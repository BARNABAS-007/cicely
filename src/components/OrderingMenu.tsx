import { useState } from 'react';
import { menuData } from '../data/menuData';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

export default function OrderingMenu() {
  const { addItem } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>(menuData[0]?.category || '');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const categories = menuData;
  const currentCategory = categories.find((cat) => cat.category === selectedCategory);

  const handleAddToCart = (item: any) => {
    const quantity = quantities[item.name] || 1;
    const cartItem: CartItem = {
      id: item.name.toLowerCase().replace(/\s+/g, '-'),
      name: item.name,
      price: parseFloat(item.price),
      description: item.description || 'Delicious dish',
      category: selectedCategory,
      quantity,
    };
    addItem(cartItem);
    setQuantities((prev) => ({ ...prev, [item.name]: 1 }));
    setSuccessMessage(`${item.name} added to cart!`);
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const updateQuantity = (itemName: string, change: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemName]: Math.max(1, (prev[itemName] || 1) + change),
    }));
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

        {/* Category Tabs */}
        <div className="mb-12 flex overflow-x-auto gap-2 pb-2">
          {categories.map((category) => (
            <button
              key={category.category}
              onClick={() => setSelectedCategory(category.category)}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === category.category
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {category.category}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {currentCategory && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCategory.items.map((item) => (
              <div
                key={item.name}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-orange-500 transition"
              >
                <div className="h-48 bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-white text-sm font-medium">{item.name}</p>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {item.description || 'Delicious specialty'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-orange-500">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => updateQuantity(item.name, -1)}
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    <span className="flex-1 text-center text-white font-medium">
                      {quantities[item.name] || 1}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.name, 1)}
                      className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
