import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { menuData } from '../../data/menuData';
import { Search, Package, PackageX, Loader } from 'lucide-react';

interface InventoryItem {
  id: string; // The item name in lowercase
  name: string;
  category: string;
  in_stock: boolean;
}

export default function LiveInventoryTab() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      // 1. Load initial items from menuData
      const initialItems: InventoryItem[] = menuData.flatMap((cat) =>
        cat.items.map((item) => ({
          id: item.name.toLowerCase().replace(/\s+/g, '-'),
          name: item.name,
          category: cat.category,
          in_stock: true, // Default
        }))
      );

      try {
        // 2. Try fetching from Supabase to override defaults
        const { data, error } = await supabase.from('inventory').select('*');
        if (data && !error) {
          const dbStockMap = new Map(data.map((row: any) => [row.item_id, row.in_stock]));
          initialItems.forEach(item => {
            if (dbStockMap.has(item.id)) {
              item.in_stock = dbStockMap.get(item.id);
            }
          });
        }
      } catch (err) {
        console.warn("Inventory table might not exist yet, using local state.");
      }

      setItems(initialItems);
      setLoading(false);
    }
    loadInventory();
  }, []);

  const toggleStock = async (itemId: string, currentStock: boolean) => {
    const newStock = !currentStock;
    // Optimistic update
    setItems(items.map(item => item.id === itemId ? { ...item, in_stock: newStock } : item));
    
    try {
      await supabase.from('inventory').upsert({
        item_id: itemId,
        in_stock: newStock,
        updated_at: new Date().toISOString()
      }, { onConflict: 'item_id' });
    } catch (err) {
      console.error("Failed to persist to Supabase:", err);
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
              
              <button
                onClick={() => toggleStock(item.id, item.in_stock)}
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
          ))}
        </div>
      )}
    </div>
  );
}
