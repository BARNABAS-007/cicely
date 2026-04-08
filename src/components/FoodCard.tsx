import { useMemo } from 'react';
import { Plus, Minus, Star, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface FoodCardProps {
  item: {
    id: string;
    name: string;
    price: string | number;
    description: string;
    image: string;
    is_veg?: boolean;
    rating?: number;
    prep_time?: string;
    is_featured?: boolean;
    category?: string;
  };
  onAdd: () => void;
  quantity?: number;
  onUpdateQuantity?: (change: number) => void;
}

export default function FoodCard({ item, onAdd, quantity = 0, onUpdateQuantity }: FoodCardProps) {
  const displayPrice = typeof item.price === 'number' ? `₹${item.price}` : item.price;

  const isPopularTonight = useMemo(() => {
    const hash = item.id.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return hash % 7 === 0; 
  }, [item.id]);

  const cuisineTag = useMemo(() => {
    const name = item.name.toLowerCase();
    const cat = item.category?.toLowerCase() || '';
    if (name.includes('pasta') || name.includes('lasagna')) return 'Italian';
    if (name.includes('soup') || cat.includes('soup')) return 'Signature';
    if (name.includes('drink') || cat.includes('drink')) return 'Gourmet Brew';
    if (name.includes('special')) return 'Chef Favorite';
    return 'Continental';
  }, [item.name, item.category]);

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* 📱 MOBILE HORIZONTAL CARD (visible <768px) */}
      {/* ═══════════════════════════════════════════ */}
      <div className="md:hidden glass-card rounded-3xl overflow-hidden group">
        <div className="flex flex-row items-stretch">
          {/* Left: content */}
          <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
            {/* Badges Row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Veg / Non-Veg Icon */}
              <div className={`w-5 h-5 border-2 ${item.is_veg ? 'border-green-500' : 'border-red-500'} rounded-sm flex items-center justify-center shrink-0`}>
                <div className={`w-2 h-2 ${item.is_veg ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
              </div>
              {item.is_featured && (
                <span className="bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={8} /> Chef's
                </span>
              )}
              {isPopularTonight && (
                <span className="text-brand-gold/60 text-[9px] font-bold uppercase tracking-wider">Popular</span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-serif text-lg font-bold text-white leading-tight mb-1 line-clamp-2 tracking-tight">
              {item.name}
            </h3>

            {/* Description */}
            <p className="text-brand-cream/25 text-xs leading-relaxed line-clamp-2 mb-3 font-medium">
              {item.description || "A signature creation from our Chef's pantry."}
            </p>

            {/* Meta Row */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1 text-brand-gold/70">
                <Star className="w-3 h-3 fill-brand-gold/70" />
                <span className="text-[10px] font-bold">{item.rating || '4.9'}</span>
              </div>
              <div className="flex items-center gap-1 text-brand-cream/20">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-bold">{item.prep_time || '15 min'}</span>
              </div>
              <span className="text-brand-gold/30 text-[9px] font-black uppercase tracking-wider">{cuisineTag}</span>
            </div>

            {/* Price */}
            <span className="text-brand-gold text-xl font-black tracking-tight">{displayPrice}</span>
          </div>

          {/* Right: square image + floating add button */}
          <div className="relative w-[130px] min-h-[130px] shrink-0 self-center m-3">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-2xl"
            />
            {/* Floating Add / Quantity Control */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
              {quantity > 0 ? (
                <div className="flex items-center gap-1 bg-black border border-brand-gold/40 rounded-full px-1 py-0.5 shadow-gold-glow/30">
                  <motion.button
                    whileTap={{ scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    onClick={(e) => { e.stopPropagation(); onUpdateQuantity?.(-1); }}
                    className="w-8 h-8 flex items-center justify-center text-brand-gold rounded-full hover:bg-brand-gold/10 transition-colors"
                  >
                    <Minus size={14} />
                  </motion.button>
                  <span className="text-white font-black text-sm w-5 text-center">{quantity}</span>
                  <motion.button
                    whileTap={{ scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    onClick={(e) => { e.stopPropagation(); onUpdateQuantity?.(1); }}
                    className="w-8 h-8 flex items-center justify-center btn-gold-amber rounded-full"
                  >
                    <Plus size={14} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.75 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                  onClick={(e) => { e.stopPropagation(); onAdd(); }}
                  className="w-10 h-10 btn-gold-amber rounded-full flex items-center justify-center shadow-lg spring-bounce"
                >
                  <Plus size={20} strokeWidth={3} />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* 🖥️ DESKTOP VERTICAL CARD (visible >=768px) */}
      {/* ═══════════════════════════════════════════ */}
      <div className="hidden md:block group relative glass-card rounded-4xl overflow-hidden shadow-premium-3d transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-gold-glow/20">
        {/* Badge Section */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
          {item.is_featured && (
            <div className="bg-brand-gold text-brand-dark px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-gold-glow flex items-center gap-2 animate-float">
              <Sparkles size={10} /> Chef Special
            </div>
          )}
          {isPopularTonight && (
            <div className="bg-white/10 backdrop-blur-md text-brand-gold px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-brand-gold/30">
              Popular Tonight
            </div>
          )}
        </div>

        {/* Image Section */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-1000 scale-100 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
          
          {/* Price Tag */}
          <div className="absolute bottom-6 left-8 z-10 py-1 px-3 bg-brand-dark/40 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-2xl font-black text-brand-gold tracking-tight drop-shadow-2xl">{displayPrice}</span>
          </div>

          {/* Veg/Non-Veg */}
          <div className="absolute top-6 right-6 z-10 w-7 h-7 bg-brand-dark/40 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center p-1.5 shadow-lg">
            <div className={`w-3.5 h-3.5 border-2 ${item.is_veg ? 'border-green-500' : 'border-red-500'} rounded-sm flex items-center justify-center`}>
              <div className={`w-1.5 h-1.5 ${item.is_veg ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 pt-4 relative">
          {/* Floating Add Control */}
          <div className="absolute -top-8 right-8 z-30">
            {quantity > 0 ? (
              <div className="flex items-center gap-3 bg-brand-dark border border-brand-gold/30 rounded-3xl p-2 shadow-gold-glow/20 animate-in zoom-in duration-300">
                <motion.button
                  whileTap={{ scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity?.(-1); }}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-brand-gold hover:text-brand-dark text-brand-gold rounded-2xl transition-all duration-300"
                >
                  <Minus size={18} />
                </motion.button>
                <span className="text-white font-black text-lg w-6 text-center">{quantity}</span>
                <motion.button
                  whileTap={{ scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  onClick={(e) => { e.stopPropagation(); onUpdateQuantity?.(1); }}
                  className="w-10 h-10 flex items-center justify-center btn-gold-amber rounded-2xl shadow-gold-glow"
                >
                  <Plus size={18} />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.75 }}
                transition={{ type: 'spring', stiffness: 500, damping: 12 }}
                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                className="w-16 h-16 btn-gold-amber rounded-3xl flex items-center justify-center shadow-gold-glow spring-bounce group/btn"
              >
                <Plus size={32} className="transition-transform group-hover/btn:rotate-90 duration-500" />
              </motion.button>
            )}
          </div>

          {/* Cuisine & Meta */}
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-gold/10 px-3 py-1 rounded text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold border border-brand-gold/20">
               {cuisineTag}
            </div>
            <div className="flex items-center gap-1.5 text-brand-gold/80 font-bold text-[10px] uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-brand-gold/80" />
              <span>{item.rating || '4.9'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-cream/30 font-bold text-[10px] uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              <span>{item.prep_time || '15 min'}</span>
            </div>
          </div>

          <h3 className="font-serif text-2xl font-black text-white mb-2 leading-tight tracking-tight group-hover:text-brand-gold transition-colors duration-500">
            {item.name}
          </h3>
          
          <p className="text-brand-cream/30 text-sm leading-relaxed line-clamp-2 font-medium mb-6">
            {item.description || "A signature creation from our Chef's pantry, prepared with the finest ingredients."}
          </p>

          {/* Material Shine Effect */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300 rounded-4xl -skew-x-12 translate-x-full group-hover:-translate-x-full duration-700"></div>

          {/* Decorative Lighting Line */}
          <div className="w-full h-px bg-gradient-to-r from-brand-gold/0 via-brand-gold/20 to-brand-gold/0 opacity-40 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </>
  );
}
