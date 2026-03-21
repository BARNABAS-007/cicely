import React from 'react';
import { Plus, Leaf } from 'lucide-react';

interface FoodCardProps {
  item: {
    id: string;
    name: string;
    price: string | number;
    description: string;
    image: string;
    is_veg?: boolean;
  };
  onAdd: () => void;
  quantity?: number;
  onUpdateQuantity?: (change: number) => void;
}

export default function FoodCard({ item, onAdd, quantity = 0, onUpdateQuantity }: FoodCardProps) {
  const displayPrice = typeof item.price === 'number' ? `₹${item.price}` : item.price;

  return (
    <div className="group relative bg-navy-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-premium-3d transition-all duration-500 hover:translate-y-[-8px] hover:shadow-2xl">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60"></div>
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full shadow-lg">
          <span className="text-orange-electric font-bold text-sm tracking-wide">{displayPrice}</span>
        </div>

        {/* Veg Icon */}
        {item.is_veg && (
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md p-1 rounded-md border border-white/20">
            <div className="w-3 h-3 border-2 border-green-500 rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-orange-electric transition-colors">
          {item.name}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 font-light">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-navy-800 bg-orange-electric/10 px-2 py-1 rounded-md border border-orange-electric/20 font-medium text-orange-electric">
            Premium Choice
          </div>
          
          {/* Floating Add Button */}
          <div className="relative">
            {quantity > 0 ? (
              <div className="flex items-center bg-navy-800 rounded-full p-1 border border-white/10 shadow-lg">
                <button
                  onClick={() => onUpdateQuantity?.(-1)}
                  className="w-8 h-8 flex items-center justify-center text-white hover:text-orange-electric transition-colors"
                >
                  -
                </button>
                <span className="px-3 text-white font-bold">{quantity}</span>
                <button
                  onClick={() => onUpdateQuantity?.(1)}
                  className="w-8 h-8 flex items-center justify-center text-white hover:text-orange-electric transition-colors"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                onClick={onAdd}
                className="w-10 h-10 bg-orange-electric rounded-full flex items-center justify-center text-white shadow-electric-glow hover:animate-glow transition-all duration-300 transform active:scale-95"
              >
                <Plus size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative Gradient Blur */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-orange-electric/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}
