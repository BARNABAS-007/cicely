import { useState, useEffect, useMemo } from 'react';
import { Star, Coffee, Utensils, CheckCircle, X, Search, Sparkles, Navigation, Globe } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../lib/supabase';
import { menuData } from '../data/menuData';
import FoodCard from './FoodCard';
import SizeSelectionModal from './SizeSelectionModal';

const OFFERS = [
  {
    id: 1,
    title: "Golden Hour Specials",
    subtitle: 'Complimentary dessert with Chef Specials',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80',
    color: 'from-brand-gold/80 to-brand-espresso',
    code: 'TASTING'
  },
  {
    id: 2,
    title: 'Vintage Wine Pairing',
    subtitle: 'Complimentary house wine with premium pasta',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80',
    color: 'from-brand-espresso to-brand-dark',
    code: 'WINEPAIR'
  },
  {
    id: 3,
    title: 'Artisan Brunch',
    subtitle: 'Exclusive sourdough bread basket on the house',
    image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&q=80',
    color: 'from-brand-wood to-brand-espresso',
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
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function fetchMenu() {
      try {
        const [menuResponse, inventoryResponse] = await Promise.all([
          supabase.from('menu_items').select('*').eq('is_available', true).limit(100),
          supabase.from('inventory').select('*')
        ]);

        let rawItems = (menuResponse.data && menuResponse.data.length > 0) 
          ? menuResponse.data 
          : menuData.flatMap(c => c.items);

        if (inventoryResponse.data && !inventoryResponse.error) {
          const invMap = new Map();
          inventoryResponse.data.forEach((inv: any) => invMap.set(inv.item_id, inv));
          
          rawItems = rawItems.filter((item: any) => {
            const id = item.id || item.name.toLowerCase().replace(/\s+/g, '-');
            if (invMap.has(id)) {
              const inv = invMap.get(id);
              return inv.in_stock && (inv.stock_count === undefined || inv.stock_count > 0);
            }
            return true;
          });
        }

        const formattedItems = rawItems.map((item: any) => ({
          ...item,
          id: item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
          image: item.image?.startsWith('http') ? item.image : `/images/redesign/${item.image}`
        }));

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

  const navCategories = useMemo(() => {
    const base = [{ id: 'all', name: 'All', icon: Utensils }];
    if (categories.length > 0) base.push({ id: 'trending', name: 'Trending', icon: Sparkles });

    const dataCats = categories.map(cat => ({
      id: cat.category.toLowerCase().trim().replace(/\s+/g, '-'),
      name: cat.category,
      icon: cat.category.toLowerCase().includes('drink') ? Coffee : Star
    }));

    const seen = new Set(['all', 'trending']);
    return [...base, ...dataCats.filter(cat => !seen.has(cat.id) && seen.add(cat.id))];
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
    const all = categories.flatMap(cat => cat.items);
    return all.filter(item => item.is_featured || item.name.includes('Special')).slice(0, 4);
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

  return (
    <div id="ordering" className="min-h-screen bg-brand-dark pt-6 md:pt-32 pb-40 relative wood-grain wood-bloom overflow-hidden">
      
      {/* 🕯️ Ambient Bloobs */}
      <div className="bloob w-[800px] h-[800px] -top-96 -left-96 animate-pulse hidden md:block" style={{ animationDuration: '8s' }}></div>
      <div className="bloob w-[600px] h-[600px] top-1/2 -right-48 animate-pulse hidden md:block" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      <div className="bloob w-[400px] h-[400px] bottom-0 left-1/4 animate-pulse opacity-10 hidden md:block" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>

      {/* Toast */}
      {appliedOffer && (
        <div className="fixed top-6 md:top-28 left-1/2 -translate-x-1/2 z-50 bg-brand-gold px-6 md:px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 text-brand-dark shadow-gold-glow animate-in slide-in-from-top-10 duration-500 font-black tracking-[0.15em] md:tracking-[0.2em] uppercase text-[9px] md:text-[10px]">
          <CheckCircle size={18} />
          <span>Reserved: Premium {appliedOffer} Package</span>
          <button onClick={() => setAppliedOffer(null)} className="ml-1 hover:opacity-50"><X size={14} /></button>
        </div>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* 📱 MOBILE: Category Ribbon Header */}
      {/* ═══════════════════════════════════════════ */}
      <div className="md:hidden sticky top-0 z-40 glass-nav pt-4 pb-3 px-4">
        {/* Mobile Logo Bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 btn-gold-amber rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-lg">C</span>
            </div>
            <span className="text-white font-black text-lg tracking-widest uppercase">Cicely</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/20" size={16} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-5 text-sm text-brand-cream placeholder-brand-cream/20 outline-none focus-gold-glow"
          />
        </div>

        {/* Horizontal Category Ribbon */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
          {navCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 border text-xs font-bold tracking-wider uppercase shrink-0 spring-bounce ${
                selectedCategory === cat.id
                  ? 'btn-gold-amber border-transparent shadow-gold-glow'
                  : 'bg-white/5 text-brand-cream/40 border-white/8 active:bg-white/10'
              }`}
            >
              <cat.icon size={13} />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 🖥️ DESKTOP: Hero Offer (hidden on mobile) */}
      {/* ═══════════════════════════════════════════ */}
      <div className="hidden md:block container mx-auto px-6 mb-24 relative z-10">
        <div className="relative h-[500px] md:h-[600px] rounded-[40px] overflow-hidden shadow-2xl border border-white/5 bg-brand-dark/40">
          {OFFERS.map((offer, index) => (
            <div
              key={offer.id}
              className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out transform ${
                index === activeOffer ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-r ${offer.color} mix-blend-multiply opacity-70`}></div>
              <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-24 text-white">
                <div className="inline-flex items-center gap-4 mb-6">
                  <Globe className="text-brand-gold w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
                   <span className="text-brand-gold font-black tracking-[0.4em] uppercase text-[10px]">Official Restaurant Special</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">{offer.title}</h1>
                <p className="text-lg md:text-2xl font-bold text-brand-cream/60 mb-10 max-w-2xl leading-relaxed">{offer.subtitle}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setAppliedOffer(offer.code)}
                    className="w-fit btn-gold-amber px-14 py-5 rounded-[20px] tracking-[0.2em] uppercase text-xs shadow-gold-glow hover:scale-105 active:scale-95 transition-all spring-bounce"
                  >
                    Reserve Now
                  </button>
                  <button className="w-fit bg-white/5 border border-white/10 text-white px-10 py-5 rounded-[20px] font-black tracking-[0.2em] uppercase text-xs hover:bg-white/10 transition-all btn-soft-press">
                    Browse More
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-12 right-12 flex gap-4">
            {OFFERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveOffer(i)}
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  i === activeOffer ? 'w-16 bg-brand-gold shadow-gold-glow' : 'w-4 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 🖥️ DESKTOP: Interactive Menu Controls */}
      {/* ═══════════════════════════════════════════ */}
      <div className="hidden md:block sticky top-[80px] z-40 py-8 mb-20">
        <div className="container mx-auto px-6 flex flex-col xl:flex-row gap-12 items-center justify-between">
          {/* Categories - Pill Navigation */}
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 w-full xl:w-auto">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-4 px-10 py-4 rounded-full whitespace-nowrap transition-all duration-500 border btn-soft-press ${
                  selectedCategory === cat.id
                    ? 'btn-gold-amber border-transparent shadow-gold-glow scale-105'
                    : 'bg-white/5 text-brand-cream/40 border-white/5 hover:border-white/20'
                }`}
              >
                <cat.icon size={16} className={selectedCategory === cat.id ? 'animate-pulse' : ''} />
                <span className="font-black text-[10px] tracking-[0.3em] uppercase">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full xl:w-auto">
             <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-4 rounded-full text-brand-cream/30">
                <Navigation size={14} className="text-brand-gold" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dining @ Cicely, MG Road</span>
             </div>
             
             {/* Refined Search */}
             <div className="relative w-full sm:w-96 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-cream/20 group-focus-within:text-brand-gold transition-colors" size={18} />
               <input
                 type="text"
                 placeholder="Search Gourmet Pantry..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-16 pr-8 text-brand-cream placeholder-brand-cream/20 outline-none focus-gold-glow focus:bg-white/10"
               />
             </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 🍽️ Food Grid */}
      {/* ═══════════════════════════════════════════ */}
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="mb-8 md:mb-12 flex items-center justify-between px-1">
           <div>
             <h2 className="font-serif text-2xl md:text-4xl font-black text-white tracking-wide md:tracking-widest uppercase mb-1 md:mb-2">Signature Collection</h2>
             <div className="flex items-center gap-3 md:gap-4">
                <span className="w-8 md:w-12 h-0.5 bg-brand-gold rounded-full opacity-40"></span>
                <p className="text-brand-cream/30 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Crafted For The Evening</p>
             </div>
           </div>
           <div className="hidden md:flex gap-2">
              <div className="w-3 h-3 rounded-full bg-brand-gold/20 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-brand-gold/10 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-3 h-3 rounded-full bg-brand-gold/5 animate-pulse" style={{ animationDelay: '1s' }}></div>
           </div>
        </div>

        {loading ? (
          <>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[140px] bg-white/5 rounded-3xl animate-pulse border border-white/5"></div>
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-16">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-[480px] bg-white/5 rounded-[40px] animate-pulse border border-white/5"></div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Mobile: stacked list */}
            <div className="md:hidden space-y-4">
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

            {/* Desktop: grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-20">
              {filteredItems.map((item, idx) => {
                const cartItem = items.find(i => i.id === item.id);
                return (
                  <div 
                    key={item.id} 
                    className={`animate-in fade-in slide-in-from-bottom-12 duration-1000`}
                    style={{ animationDelay: `${idx * 150}ms`, marginTop: idx % 3 === 1 ? '24px' : '0px' }}
                  >
                    <FoodCard
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
                  </div>
                );
              })}
            </div>
          </>
        )}

        {filteredItems.length === 0 && !loading && (
           <div className="text-center py-20 md:py-40 border-y border-white/5 bg-white/2 rounded-3xl md:rounded-[40px] mt-8 md:mt-12">
             <Star size={40} className="mx-auto text-brand-cream/10 mb-4 md:mb-6 animate-spin" style={{ animationDuration: '4s' }} />
             <p className="text-brand-cream/40 font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-[10px] md:text-xs">No Signature Dishes Found</p>
           </div>
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
