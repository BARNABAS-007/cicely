import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface CecilyOrderCardProps {
  item: any;
  category: string;
  isVeg?: boolean;
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity: (change: number) => void;
}

export default function CecilyOrderCard({
  item,
  isVeg = true,
  quantity,
  onAdd,
  onUpdateQuantity,
}: CecilyOrderCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // Format the price string if it contains multiple sizes (e.g. "₹189 / ₹199 / ₹209")
  // For the main card, we show the starting price if there are multiple
  const priceParts = item.price.split('/').map((p: string) => p.trim());
  const displayPrice = priceParts[0];
  const hasMultipleSizes = priceParts.length > 1;

  // Placeholder image based on category or item name
  // To keep it simple, we generate a random image ID based on the string hash so it's consistent
  const strHash = item.name.split('').reduce((a: number, b: string) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const imageId = Math.abs(strHash) % 50 + 100;
  const imageUrl = `https://picsum.photos/id/${imageId}/240/240`;

  const handleAddClick = () => {
    if (item.is_available === false) return;
    setIsAdding(true);
    if ('vibrate' in navigator) navigator.vibrate(50);
    setTimeout(() => setIsAdding(false), 200);
    onAdd();
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50 hover:border-orange-500/50 transition flex w-full max-w-xl mx-auto mb-4 p-4 gap-4 relative">
      
      {/* LEFT SECTION (60%) */}
      <div className="flex-1 flex flex-col justify-start">
        {/* Veg / Non-Veg Indicator */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-3 h-3 border ${isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[1px]`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
          {isVeg && <span className="text-[10px] text-green-500 font-semibold tracking-wider">VEG</span>}
        </div>

        {/* Title & Description */}
        <h3 className="font-serif text-[18px] font-bold text-white leading-tight mb-1">
          {item.name}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 leading-snug mb-3">
          {item.description || 'A delicious, authentic preparation made with premium ingredients and hand-picked spices.'}
        </p>

        {/* Pricing & Tag */}
        <div className="mt-auto flex flex-col items-start gap-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[#FFD700] text-lg">
              {displayPrice}
            </span>
            {hasMultipleSizes && (
              <span className="text-gray-500 text-xs">(starts at)</span>
            )}
          </div>
          <div className="bg-[#FFF8E7] text-[#8B6508] text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[#DEB887]">
            Direct Ordering Price
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (40%) */}
      <div className="w-[120px] flex-shrink-0 relative flex flex-col items-center">
        {/* Image Container */}
        <div className="w-[120px] h-[120px] rounded-[16px] overflow-hidden bg-gray-700 shadow-md relative">
          <img 
            src={item.image || imageUrl} 
            alt={item.name}
            loading="lazy"
            className={`w-full h-full object-cover transition ${item.is_available === false ? 'grayscale opacity-50' : ''}`}
          />
          {item.is_available === false && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
              <span className="text-white font-bold text-xs border-2 border-white/50 px-2 py-1 rounded bg-black/50 tracking-widest uppercase rotate-[-15deg]">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* THE HOOK: Floating 'ADD' Button */}
        <div className="absolute -bottom-4 translate-y-0 shadow-lg z-10">
          {quantity > 0 && !hasMultipleSizes ? (
            <div className={`flex items-center text-white rounded-full px-2 py-1 gap-3 h-9 font-bold ${item.is_available === false ? 'bg-gray-600' : 'bg-[#FF9800]'}`}>
              <button disabled={item.is_available === false} onClick={() => onUpdateQuantity(-1)} className="p-1 hover:bg-orange-600 rounded-full transition disabled:opacity-50">
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm pb-px">{quantity}</span>
              <button disabled={item.is_available === false} onClick={() => onUpdateQuantity(1)} className="p-1 hover:bg-orange-600 rounded-full transition disabled:opacity-50">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <motion.button
              whileTap={item.is_available !== false ? { scale: 0.95 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              onClick={handleAddClick}
              disabled={item.is_available === false}
              className={`text-white font-bold text-sm h-9 px-6 rounded-full uppercase tracking-wide transition shadow-md border-[2px] border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                item.is_available === false 
                  ? 'bg-gray-600' 
                  : isAdding 
                    ? 'bg-[#FFD700] text-gray-900 scale-95' 
                    : 'bg-[#FF9800] hover:bg-[#F57C00]'
              }`}
            >
              {isAdding ? 'Added!' : <>Add {hasMultipleSizes && <span className="text-[10px] ml-1 font-normal">+</span>}</>}
            </motion.button>
          )}
        </div>
      </div>
      
    </div>
  );
}
