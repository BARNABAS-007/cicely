import { X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SizeSelectionModalProps {
  isOpen: boolean;
  item: any | null;
  onClose: () => void;
  onConfirm: (item: any, selectedSize: string, selectedPrice: string) => void;
}

export default function SizeSelectionModal({ isOpen, item, onClose, onConfirm }: SizeSelectionModalProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const prices = item.price.split('/').map((p: string) => p.trim());
  
  // Default size labels based on number of prices
  let sizeLabels = ['Regular', 'Large'];
  if (prices.length === 3) {
    sizeLabels = ['Cup', 'Regular', 'Large'];
  }

  const handleConfirm = () => {
    onConfirm(item, sizeLabels[selectedIdx], prices[selectedIdx]);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-gray-900 rounded-t-3xl z-50 shadow-2xl border-t border-gray-800 animate-in slide-in-from-bottom duration-300 pb-safe">
        
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1 w-full" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-700 rounded-full" />
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-serif font-bold text-white mb-1">{item.name}</h3>
              <p className="text-gray-400 text-sm">Select your preferred size</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-gray-400 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-8">
            {prices.map((price: string, idx: number) => (
              <label 
                key={idx}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                  selectedIdx === idx 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-800 bg-gray-800 hover:border-gray-700'
                }`}
                onClick={() => setSelectedIdx(idx)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedIdx === idx ? 'border-orange-500' : 'border-gray-600'
                  }`}>
                    {selectedIdx === idx && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                  </div>
                  <span className={`font-semibold ${selectedIdx === idx ? 'text-orange-500' : 'text-gray-200'}`}>
                    {sizeLabels[idx] || `Size ${idx + 1}`}
                  </span>
                </div>
                <span className="font-bold text-white text-lg">{price}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleConfirm}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 shadow-lg transition"
          >
            <ShoppingBag className="w-5 h-5" />
            Add to Order • {prices[selectedIdx]}
          </button>
        </div>
      </div>
    </>
  );
}
