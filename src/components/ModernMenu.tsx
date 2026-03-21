import { useState, useEffect, useMemo } from 'react';
import { Star, Coffee, Utensils, Zap, CheckCircle, X, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { menuData } from '../data/menuData';
import FoodCard from './FoodCard';
import SizeSelectionModal from './SizeSelectionModal';

const OFFERS = [
  {
    id: 1,
    title: "Chef's Tasting",
    subtitle: 'Complimentary dessert with Chef Specials',
    image: '/images/redesign/burger.png',
    color: 'from-orange-electric to-orange-vibrant',
    code: 'TASTING'
  },
  {
    id: 2,
    title: 'Wine Pairing',
    subtitle: 'Complimentary house wine with premium pasta',
    image: '/images/redesign/pasta.png',
    color: 'from-purple-600 to-indigo-900',
    code: 'WINEPAIR'
  },
  {
    id: 3,
    title: 'Weekend Brunch',
    subtitle: 'Exclusive artisanal bread basket on the house',
    image: '/images/redesign/appetizer.png',
    color: 'from-blue-600 to-navy-900',
    code: 'BRUNCH'
  }
];

export default function ModernMenu() {
  const { items, addItem, updateQuantity: contextUpdateQuantity, removeItem } = useCart();
  const [categories, setCategories] = useState<{ category: string; items: any[] }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItemForModal, setSelectedItemForModal] = useState<any | null>(null);
  const [activeOffer, setActiveOffer] = useState(0);
  const [appliedOffer, setAppliedOffer] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % OFFERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true);

        // Merge DB data with local data or prioritize local for redesign items
        const rawItems = (data && data.length > 0) ? data : menuData.flatMap(c => c.items);
        
        const soupImages: Record<string, string> = {
          'cream-of-mushroom': '/images/redesign/mushroom_soup.png',
          'cream-of-chicken': '/images/redesign/chicken_soup.png',
          'egg-white-soup': '/images/redesign/egg_soup.png'
        };

        const formattedItems = rawItems.map((item: any) => {
          const id = item.id || item.name.toLowerCase().replace(/\s+/g, '-');
          let image = item.image || '';
          
          // Override if we have a local high-res version for these specific items
          if (soupImages[id]) {
            image = soupImages[id];
          } else if (!image.startsWith('http') && !image.startsWith('/')) {
            image = `/images/redesign/${image}`;
          }

          return { ...item, id, image };
        });

        const grouped = formattedItems.reduce((acc: any, item: any) => {
          const cat = item.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(item);
          return acc;
        }, {});

        const formattedCategories = Object.keys(grouped).map(cat => ({
          category: cat,
          items: grouped[cat]
        }));
        
        setCategories(formattedCategories);
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  // Dynamically derive CATEGORIES from state
  const navCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All', icon: Utensils }];
    
    // Add Trending if we have items
    if (categories.length > 0) {
      base.push({ id: 'trending', name: 'Trending', icon: Zap });
    }

    const dataCats = categories.map(cat => ({
      id: cat.category.toLowerCase().trim().replace(/\s+/g, '-'),
      name: cat.category,
      icon: cat.category.toLowerCase().includes('drink') ? Coffee : (cat.category.toLowerCase().includes('soup') ? Utensils : Star)
    }));

    // Filter out duplicates and empty categories
    const seen = new Set(['all', 'trending']);
    const uniqueCats = dataCats.filter(cat => {
      if (seen.has(cat.id)) return false;
      seen.add(cat.id);
      return true;
    });

    return [...base, ...uniqueCats];
  }, [categories]);

  const handleAddToCart = (item: any, selectedSize?: string, selectedPrice?: string) => {
    const priceParts = String(item.price).split('/');
    if (priceParts.length > 1 && !selectedSize) {
      setSelectedItemForModal(item);
      return;
    }

    const sizeSuffix = selectedSize ? ` (${selectedSize})` : '';
    const nameWithSize = `${item.name}${sizeSuffix}`;
    const priceToUse = selectedPrice ? selectedPrice.replace(/[^0-9.]/g, '') : String(item.price).replace(/[^0-9.]/g, '');

    addItem({
      id: nameWithSize.toLowerCase().replace(/\s+/g, '-'),
      name: nameWithSize,
      price: parseFloat(priceToUse),
      description: item.description || 'Premium Cecily Dish',
      category: item.category,
      quantity: 1,
    });
    setSelectedItemForModal(null);
  };

  const trendingItems = useMemo(() => {
    const allItems = categories.flatMap(cat => cat.items);
    return allItems.filter(item => item.name.includes('Cream') || item.name.includes('Lasagna') || item.name.includes('Special')).slice(0, 4);
  }, [categories]);

  const filteredItems = useMemo(() => {
    let items = [];
    if (selectedCategory === 'all') items = categories.flatMap(cat => cat.items);
    else if (selectedCategory === 'trending') items = trendingItems;
    else items = categories.find(cat => cat.category.toLowerCase().trim().replace(/\s+/g, '-') === selectedCategory)?.items || [];

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(lowerSearch) || 
        (item.description && item.description.toLowerCase().includes(lowerSearch))
      );
    }
    
    return items;
  }, [selectedCategory, categories, trendingItems, searchTerm]);

  const handleClaimOffer = (offer: any) => {
    setAppliedOffer(offer.code);
    // Persist longer or until another action
  };

  return (
    <div id="ordering" className="min-h-screen bg-navy-950 pb-24">
      {/* Header Space */}
      <div className="h-4"></div>

      {/* Offer Status Toast */}
      {appliedOffer && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-orange-electric/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 text-white shadow-electric-glow animate-bounce">
          <CheckCircle size={20} />
          <span className="font-bold">Offer {appliedOffer} Applied!</span>
          <button 
            onClick={() => setAppliedOffer(null)}
            className="ml-2 hover:text-navy-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Offer Carousel */}
      <div className="container mx-auto px-4 mb-8">
        <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-premium-3d border border-white/5">
          {OFFERS.map((offer, index) => (
            <div
              key={offer.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === activeOffer ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} opacity-40`}></div>
              <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">
                <h3 className="text-3xl md:text-5xl font-black mb-1 tracking-tighter drop-shadow-lg">{offer.title}</h3>
                <p className="text-lg md:text-xl font-light opacity-90 mb-4">{offer.subtitle}</p>
                <button 
                  onClick={() => handleClaimOffer(offer)}
                  className="w-fit bg-white text-navy-950 px-8 py-2.5 rounded-full font-bold text-sm hover:scale-110 active:scale-95 transition-all shadow-xl"
                >
                  Claim Now
                </button>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {OFFERS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeOffer ? 'w-6 bg-orange-electric' : 'bg-white/50'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mb-6">
        <div className="relative max-w-md mx-auto md:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for dishes, ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-electric transition-all shadow-lg"
          />
        </div>
      </div>

      {/* Dynamic Category Bar */}
      <div className="sticky top-[72px] z-30 bg-navy-950/80 backdrop-blur-xl border-b border-white/5 py-4 mb-8 px-4 scrollbar-hide">
        <div className="container mx-auto flex gap-4 overflow-x-auto pb-2">
          {navCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 transform ${
                selectedCategory === cat.id
                  ? 'bg-orange-electric text-white shadow-electric-glow scale-105'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <cat.icon size={18} />
              <span className="font-bold text-sm tracking-wide">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food Grid */}
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-80 bg-white/5 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in duration-500">
                {filteredItems.map((item) => {
                  const cartItem = items.find(i => i.id === item.id);
                  return (
                    <FoodCard
                      key={item.id}
                      item={item}
                      onAdd={() => handleAddToCart(item)}
                      quantity={cartItem?.quantity}
                      onUpdateQuantity={(change) => {
                        const existing = items.find(i => i.id === item.id);
                        if (!existing) return;
                        const newQty = existing.quantity + change;
                        if (newQty <= 0) removeItem(item.id);
                        else contextUpdateQuantity(item.id, newQty);
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <Utensils size={48} className="mx-auto mb-4 opacity-20" />
                <p>No items found in this category.</p>
              </div>
            )}
          </>
        )}
      </div>

      <SizeSelectionModal
        isOpen={!!selectedItemForModal}
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
        onConfirm={(item, size, price) => handleAddToCart(item, size, price)}
      />
    </div>
  );
}
