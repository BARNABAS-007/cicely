import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Minus, Plus, Loader, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', countryCode: '+91', phone: '', address: '' });
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  const totalItems = getTotalItems();

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setGettingLocation(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            setFormData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          }
        } catch (err) {
          setError('Failed to get address from location');
        } finally {
          setGettingLocation(false);
        }
      },
      () => {
        setError('Failed to get location. Please allow location access.');
        setGettingLocation(false);
      }
    );
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const totalAmount = getTotalPrice() + (getTotalPrice() * 0.05) + 5;
      
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: Math.round(totalAmount * 100) }
      });
      if(edgeError) console.warn("Fallback to client edge creation");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummykey',
        amount: Math.round(totalAmount * 100), 
        currency: 'INR',
        order_id: edgeData?.id,
        name: 'Cecily Restaurant',
        description: 'Direct Food Ordering',
        handler: async function (response: any) {
          try {
            const { data, error: err } = await supabase.from('orders').insert([{
              customer_name: formData.name,
              phone: `${formData.countryCode} ${formData.phone}`,
              address: formData.address,
              items: items.map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
              total_price: totalAmount,
              order_status: 'paid',
              delivery_requested: false,
              payment_id: response.razorpay_payment_id
            }]).select();
            if (err) throw err;
            
            clearCart();
            setIsOpen(false);
            navigate(`/checkout?success=true&order_id=${data[0].id}`);
          } catch (dbErr: any) {
            setError('Payment successful but failed to record order.');
            setLoading(false);
          }
        },
        prefill: { name: formData.name, contact: `${formData.countryCode} ${formData.phone}` },
        theme: { color: '#EA580C' },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setError('Payment Failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-orange-600 hover:bg-orange-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition flex items-center justify-center"
      >
        <ShoppingCart className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-gray-800 z-40 flex flex-col shadow-2xl border-l border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                Your Cart
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-center">
                  <div>
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Your cart is empty</p>
                    <p className="text-sm mt-2">Add items from the menu to get started</p>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-700 rounded-lg p-3 flex gap-3 items-start"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{item.name}</h4>
                      <p className="text-orange-400 text-sm font-medium">
                        ₹{(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-600 rounded transition"
                      >
                        <Minus className="w-3 h-3 text-white" />
                      </button>
                      <span className="text-white font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-600 rounded transition"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 hover:bg-red-900/20 rounded transition"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-700 bg-gray-900 p-4 space-y-4">
                <div className="space-y-2 text-sm text-gray-400 font-mono">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-gray-200">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="text-gray-200">₹{(getTotalPrice() * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center group relative">
                    <span className="flex items-center gap-2">
                      Platform Maintenance
                    </span>
                    <span className="text-gray-200">₹5.00</span>
                  </div>
                  <div className="pt-2 text-center border-t border-gray-700/50 mt-2 flex flex-col gap-1">
                    <span className="text-green-400 font-bold text-xs uppercase tracking-wider block">✨ No Packaging Charges - Direct from Cecily</span>
                    <span className="text-emerald-400 font-medium text-xs bg-emerald-900/20 py-1.5 px-2 rounded-md border border-emerald-500/20 inline-block mt-1">
                      🎉 You save 20-30% compared to other platforms by ordering directly!
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end pt-2 border-t border-gray-800 mb-2">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-2xl font-bold text-orange-500">
                    ₹{(getTotalPrice() + getTotalPrice() * 0.05 + 5).toFixed(2)}
                  </span>
                </div>

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm focus:border-orange-500 transition outline-none"
                  />
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className="bg-gray-800 border border-gray-700 text-white px-2 py-2 rounded text-sm focus:border-orange-500 focus:outline-none w-24"
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (AE)</option>
                      <option value="+65">+65 (SG)</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="flex-1 bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm focus:border-orange-500 transition outline-none"
                    />
                  </div>
                  <div className="relative">
                    <textarea
                      placeholder="Delivery Address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded text-sm focus:border-orange-500 transition outline-none h-20 resize-none pr-10"
                    />
                    <button
                      onClick={handleGetLocation}
                      disabled={gettingLocation}
                      title="Use Current Location"
                      className="absolute right-2 top-2 p-1.5 bg-gray-700 hover:bg-orange-500 text-white rounded transition-colors disabled:opacity-50"
                    >
                      {gettingLocation ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {loading ? 'Processing...' : 'PLACE ORDER'}
                </button>

                <button
                  onClick={() => {
                    clearCart();
                    setIsOpen(false);
                  }}
                  className="w-full bg-transparent hover:bg-red-900/20 text-red-500 text-sm font-semibold py-2 rounded-lg transition border border-red-500/20"
                >
                  Empty Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
