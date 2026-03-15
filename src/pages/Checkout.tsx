import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Checkout() {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address) {
      setError('Please fill in all fields');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: err } = await supabase.from('orders').insert([
        {
          customer_name: formData.customerName,
          phone: formData.phone,
          address: formData.address,
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total_price: getTotalPrice(),
          order_status: 'pending',
          delivery_requested: false,
        },
      ]);

      if (err) throw err;

      const newOrderId = data?.[0]?.id;
      setOrderId(newOrderId);
      setOrderPlaced(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/#ordering')}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </button>

          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <p className="text-gray-400 mb-4">Your cart is empty</p>
              <button
                onClick={() => navigate('/#ordering')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
              <p className="text-green-200 mb-4">
                Thank you for your order. Your food will be prepared soon.
              </p>

              <div className="bg-green-900/30 rounded-lg p-4 mb-6 text-left">
                <p className="text-green-300 font-mono text-sm break-all">
                  <span className="text-green-400 font-semibold">Order ID:</span> {orderId}
                </p>
              </div>

              <div className="space-y-2 text-left mb-6">
                <p className="text-white">
                  <span className="text-gray-400">Name:</span> {formData.customerName}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Phone:</span> {formData.phone}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Delivery Address:</span> {formData.address}
                </p>
                <p className="text-white text-lg font-bold">
                  <span className="text-gray-400">Total:</span> ${getTotalPrice().toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => navigate('/#ordering')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
                >
                  Order More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/#ordering')}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-8 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Delivery Details</h2>

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition h-28 resize-none"
                    placeholder="Enter your complete delivery address"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-300">
                    <div>
                      <p className="text-white">{item.name}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-orange-400 font-semibold">
                      ${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-500">${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
