import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CartItem } from '../types';
import { menuData } from '../data/menuData';
import CecilyOrderCard from './CecilyOrderCard';
import SizeSelectionModal from './SizeSelectionModal';

export default function OrderingMenu() {
  const { items, addItem, updateQuantity: contextUpdateQuantity, removeItem } = useCart();
  const [categories, setCategories] = useState<{ category: string; items: any[] }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Modal State for multi-size items
  const [selectedItemForModal, setSelectedItemForModal] = useState<any | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      let outOfStockIds = new Set<string>();

      try {
        const { data: invData, error: invError } = await supabase.from('inventory').select('*');
        if (!invError && invData) {
          outOfStockIds = new Set(invData.filter((r: any) => r.in_stock === false).map((r: any) => r.item_id));
        }

        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true);

        if (error) {
          console.warn('menu_items table missing or error. Falling back...');
          throw error;
        }

        if (data && data.length > 0) {
          const availableData = data.map((item: any) => ({
            ...item,
            is_available: item.is_available && !outOfStockIds.has(item.id)
          }));

          const grouped = availableData.reduce((acc: any, item: any) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});

          const formattedCategories = Object.keys(grouped).map(cat => ({
            category: cat,
            items: grouped[cat]
          }));
          setCategories(formattedCategories);
          setSelectedCategory(formattedCategories[0]?.category || '');
        } else {
          // Empty Supabase DB Fallback
          const fallbackCategories = menuData.map(cat => ({
            category: cat.title || cat.category,
            items: cat.items.map((item: any) => {
              const id = item.name.toLowerCase().replace(/\s+/g, '-');
              return {
                id,
                name: item.name,
                price: item.price,
                description: item.description || 'A delicious Cecily classic.',
                image: item.image,
                is_veg: true,
                is_available: !outOfStockIds.has(id),
                category: cat.title || cat.category
              };
            })
          })).filter(cat => cat.items.length > 0);
          
          setCategories(fallbackCategories);
          setSelectedCategory(fallbackCategories[0]?.category || '');
        }
      } catch (err) {
        console.error('Error fetching menu. Engaging bulletproof fallback.', err);
        // Error-State Fallback
        const fallbackCategories = menuData.map((cat: any) => ({
            category: cat.title || cat.category,
            items: cat.items.map((item: any) => {
              const id = item.name.toLowerCase().replace(/\s+/g, '-');
              return {
                id,
                name: item.name,
                price: item.price,
                description: item.description || 'A delicious Cecily classic.',
                image: item.image,
                is_veg: true,
                is_available: !outOfStockIds.has(id),
                category: cat.title || cat.category
              };
            })
        })).filter((cat: any) => cat.items.length > 0);
        
        setCategories(fallbackCategories);
        setSelectedCategory(fallbackCategories[0]?.category || '');
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  const currentCategory = categories.find((cat) => cat.category === selectedCategory);

  const handleAddToCart = (item: any, selectedSize?: string, selectedPrice?: string) => {
    // If it has multiple sizes but no size was selected yet, open modal
    const priceParts = item.price.split('/');
    if (priceParts.length > 1 && !selectedSize) {
      setSelectedItemForModal(item);
      return;
    }

    const sizeSuffix = selectedSize ? ` (${selectedSize})` : '';
    const nameWithSize = `${item.name}${sizeSuffix}`;
    const priceToUse = selectedPrice ? selectedPrice.replace(/[^0-9.]/g, '') : item.price.replace(/[^0-9.]/g, '');

    const cartItem: CartItem = {
      id: nameWithSize.toLowerCase().replace(/\s+/g, '-'),
      name: nameWithSize,
      price: parseFloat(priceToUse),
      description: item.description || 'Delicious dish',
      category: selectedCategory,
      quantity: 1,
    };
    
    addItem(cartItem);
    setSelectedItemForModal(null);
    setSuccessMessage(`${nameWithSize} added to cart!`);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const updateQuantityLocal = (item: any, change: number) => {
    const id = item.name.toLowerCase().replace(/\s+/g, '-');
    const existing = items.find(i => i.id === id);
    if (!existing) return;
    
    const newQuantity = existing.quantity + change;
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      contextUpdateQuantity(id, newQuantity);
    }
  };

  return (
    <div id="ordering" className="min-h-screen bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-white mb-4">Order Online</h2>
        <p className="text-center text-gray-400 mb-12">
          Browse our delicious menu and order directly from home
        </p>

        {successMessage && (
          <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-start gap-3 z-50 animate-in">
            <ShoppingCart className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-200 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Shimmer Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl flex w-full max-w-xl mx-auto mb-4 p-4 gap-4 border border-gray-700/50">
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="w-16 h-3 bg-gray-700 rounded mb-4"></div>
                    <div className="w-3/4 h-5 bg-gray-700 rounded mb-2"></div>
                    <div className="w-full h-3 bg-gray-700 rounded mb-1"></div>
                    <div className="w-2/3 h-3 bg-gray-700 rounded"></div>
                  </div>
                  <div className="w-1/3 h-5 bg-gray-700 rounded mt-4"></div>
                </div>
                <div className="w-[120px] shrink-0">
                  <div className="w-[120px] h-[120px] bg-gray-700 rounded-[16px]"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <div className="sticky top-0 z-20 bg-white/30 backdrop-blur-[12px] pt-4 pb-4 mb-8 flex overflow-x-auto gap-2 border-b border-gray-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.category}
                  onClick={() => setSelectedCategory(category.category)}
                  className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition flex-shrink-0 ${
                    selectedCategory === category.category
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                      : 'bg-gray-800/80 text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  {category.category}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            {currentCategory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentCategory.items.map((item) => {
                  const id = item.name.toLowerCase().replace(/\s+/g, '-');
                  const cartItem = items.find(i => i.id === id);
                  
                  return (
                    <CecilyOrderCard
                      key={item.id || item.name}
                      item={item}
                      category={currentCategory.category}
                      isVeg={item.is_veg !== undefined ? item.is_veg : true}
                      quantity={cartItem ? cartItem.quantity : 0}
                      onAdd={() => handleAddToCart(item)}
                      onUpdateQuantity={(change) => updateQuantityLocal(item, change)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        <SizeSelectionModal
          isOpen={!!selectedItemForModal}
          item={selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          onConfirm={(item, size, price) => handleAddToCart(item, size, price)}
        />
      </div>
    </div>
  );
}
