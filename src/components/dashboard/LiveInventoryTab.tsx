import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { menuData } from '../../data/menuData';
import { Search, Package, PackageX, Loader, AlertTriangle } from 'lucide-react';

interface InventoryItem {
  id: string; // The item name in lowercase
  name: string;
  category: string;
  in_stock: boolean;
  stock_count: number;
}

export default function LiveInventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    async function loadInventory() {
      let initialItems: InventoryItem[] = [];

      try {
        // 1. Fetch from menu_items table instead of local fallback
        const { data: menuItems, error: menuErr } = await supabase.from('menu_items').select('*');
        if (!menuErr && menuItems && menuItems.length > 0) {
          initialItems = menuItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category || 'Uncategorized',
            in_stock: true, 
            stock_count: 15
          }));
        } else {
          // Fallback if menu_items fails or is empty
          initialItems = menuData.flatMap((cat: any) =>
            cat.items.map((item: any) => ({
              id: item.name.toLowerCase().replace(/\s+/g, '-'),
              name: item.name,
              category: cat.title || cat.category || 'Uncategorized',
              in_stock: true, 
              stock_count: 15
            }))
          );
        }

        // 2. Try fetching from inventory to override defaults
        const { data, error } = await supabase.from('inventory').select('*');
        if (data && !error) {
          const dbMap = new Map(data.map((row: any) => [row.item_id, row]));
          initialItems.forEach(item => {
            if (dbMap.has(item.id)) {
              const invData = dbMap.get(item.id);
              item.in_stock = invData.in_stock;
              item.stock_count = invData.stock_count !== undefined ? invData.stock_count : 15;
            }
          });
        }
      } catch (err) {
        console.warn("DB connections failed, using local state.", err);
        initialItems = menuData.flatMap((cat: any) =>
            cat.items.map((item: any) => ({
              id: item.name.toLowerCase().replace(/\s+/g, '-'),
              name: item.name,
              category: cat.title || cat.category || 'Uncategorized',
              in_stock: true, 
              stock_count: 15
            }))
        );
      }

      setItems(initialItems);
      setLoading(false);
    }
    loadInventory();

    async function loadConflicts() {
      const { data } = await supabase.from('race_conditions').select('*').order('attempt_time', { ascending: false }).limit(10);
      if (data) setConflicts(data);
    }
    loadConflicts();

    const channel = supabase.channel('inventory-heartbeat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        loadInventory();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'race_conditions' }, () => {
        loadConflicts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleStock = async (itemId: string, currentStock: boolean, currentCount: number) => {
    const newStock = !currentStock;
    setItems(items.map(item => item.id === itemId ? { ...item, in_stock: newStock } : item));
    
    try {
      await supabase.from('inventory').upsert({
        item_id: itemId,
        in_stock: newStock,
        stock_count: currentCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'item_id' });
    } catch (err) {
      console.error("Failed to persist to Supabase:", err);
    }
  };

  const updateStockCount = async (itemId: string, newCount: number) => {
    const validCount = Math.max(0, newCount);
    const inStockNow = validCount > 0;
    
    setItems(items.map(item => item.id === itemId ? { ...item, stock_count: validCount, in_stock: inStockNow } : item));
    
    try {
      await supabase.from('inventory').upsert({
        item_id: itemId,
        in_stock: inStockNow,
        stock_count: validCount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'item_id' });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Live Inventory</h2>
          <p className="text-gray-400 text-sm mt-1">Control stock status for Menu Items instantly.</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 flex gap-4 border border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search all items or categories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between p-4 rounded-xl border transition ${
                item.in_stock 
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                  : 'bg-red-900/10 border-red-900/50 opacity-75'
              }`}
            >
              <div className="flex-1 pr-4">
                <span className="text-xs font-semibold text-orange-500/80 uppercase tracking-widest">{item.category}</span>
                <h3 className={`font-medium mt-1 truncate ${item.in_stock ? 'text-white' : 'text-gray-400 line-through'}`}>{item.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={item.stock_count}
                  onChange={(e) => updateStockCount(item.id, parseInt(e.target.value) || 0)}
                  className={`w-16 px-2 py-1 text-center bg-gray-900 border rounded font-mono text-sm focus:outline-none transition-colors ${
                    item.stock_count <= 0 ? 'border-red-500 text-red-400' : 'border-gray-700 text-green-400 focus:border-orange-500'
                  }`}
                  min="0"
                />

                <button
                  onClick={() => toggleStock(item.id, item.in_stock, item.stock_count)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    item.in_stock ? 'bg-green-500' : 'bg-red-600'
                  }`}
                >
                  <span className="sr-only">Toggle stock logic</span>
                  <div
                    className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white transition-transform ${
                      item.in_stock ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  >
                    {item.in_stock ? (
                      <Package className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <PackageX className="w-3.5 h-3.5 text-red-600" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conflict Resolution Log Panel */}
      {conflicts.length > 0 && (
        <div className="mt-8 bg-gray-800 rounded-xl border border-red-500/30 overflow-hidden shadow-lg">
          <div className="bg-red-900/20 p-4 border-b border-red-500/20 flex items-center justify-between">
            <h3 className="text-red-400 font-bold flex items-center gap-2 tracking-wide">
              <AlertTriangle className="w-5 h-5" />
              Conflict Resolution Log (Race Conditions)
            </h3>
            <span className="text-xs text-red-300 bg-red-900/40 px-3 py-1 rounded-full uppercase font-bold tracking-wider">
              High Demand Alerts
            </span>
          </div>
          <div className="p-4">
            <p className="text-gray-400 text-sm mb-4">
              These are recent attempts where customers tried to purchase items that just sold out. Consider restocking these items soon.
            </p>
            <div className="space-y-3">
              {conflicts.map(conflict => {
                // Find friendly name if possible
                const matchedItem = items.find(i => i.id === conflict.item_id);
                const friendlyName = matchedItem ? matchedItem.name : conflict.item_id;
                
                return (
                  <div key={conflict.id} className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between items-center bg-gradient-to-r hover:from-red-900/10 hover:to-transparent transition-all">
                    <div>
                      <p className="text-white font-semibold">
                        Failed checkout for <span className="text-orange-400">{friendlyName}</span>
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(conflict.attempt_time).toLocaleString()} | Customer: <span className="text-gray-400">{conflict.user_phone}</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        const amount = parseInt(prompt(`How much stock of ${friendlyName} do you want to add?`, '10') || '0');
                        if(amount > 0 && matchedItem) {
                           updateStockCount(matchedItem.id, matchedItem.stock_count + amount);
                        }
                      }}
                      className="px-4 py-1.5 text-xs font-bold rounded border border-green-500/50 text-green-400 hover:bg-green-900/30 transition">
                      + Restock Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
