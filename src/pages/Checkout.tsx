import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader, XCircle } from 'lucide-react';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const successParam = queryParams.get('success');
  const queryOrderId = queryParams.get('order_id');

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (successParam === 'true' && queryOrderId) {
      const fetchOrder = async () => {
        const { data } = await supabase.from('orders').select('*').eq('id', queryOrderId).single();
        if (data) setCurrentOrder(data);
        setLoading(false);
      };
      
      fetchOrder();
      
      const channel = supabase.channel(`public:orders:${queryOrderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${queryOrderId}` }, (payload) => {
          setCurrentOrder(payload.new);
        }).subscribe();
        
      return () => { supabase.removeChannel(channel); };
    } else {
      navigate('/'); // Redirect home if accessed without valid success parameters
    }
  }, [successParam, queryOrderId, navigate]);

  const confirmCancel = async () => {
    setShowCancelModal(false);
    if (!currentOrder) return;
    const orderTime = new Date(currentOrder.created_at).getTime();
    const diffMins = (Date.now() - orderTime) / 60000;
    const newStatus = diffMins < 2 ? 'refund_processed' : 'cancellation_requested';
    
    try {
      await supabase.from('orders').update({
        order_status: newStatus,
        cancellation_reason: 'User requested cancellation',
        updated_at: new Date().toISOString()
      }).eq('id', queryOrderId);
      setCurrentOrder({ ...currentOrder, order_status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (currentOrder) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Order Successfully Placed!</h2>
              <p className="text-gray-400">Your delicious food is being prepared.</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 md:p-8 border border-gray-700 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center gap-2">
                  {!['cancellation_requested', 'refund_processed', 'cancelled'].includes(currentOrder?.order_status || '') && (
                    <>
                      <Loader className="w-5 h-5 text-orange-500 animate-spin" />
                      {currentOrder?.order_status === 'pending' || currentOrder?.order_status === 'paid' ? 'Order received...' : 
                       currentOrder?.order_status === 'preparing' ? 'Preparing your food...' : 
                       currentOrder?.order_status === 'out_for_delivery' ? 'Out for Delivery!' : 'Confirming...'}
                    </>
                  )}
                </h3>
                <div className="flex justify-between text-sm font-medium text-gray-400 mb-2 px-2">
                  <span className="text-orange-500">Confirmed</span>
                  <span className={['preparing', 'ready', 'out_for_delivery', 'delivered'].includes(currentOrder?.order_status) ? 'text-orange-500' : ''}>Preparing</span>
                  <span className={['out_for_delivery', 'delivered'].includes(currentOrder?.order_status) ? 'text-orange-500' : ''}>Out for Delivery</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-orange-500 transition-all duration-1000 ${
                    ['pending', 'paid'].includes(currentOrder?.order_status) ? 'w-1/3' : 
                    ['preparing', 'ready'].includes(currentOrder?.order_status) ? 'w-2/3' : 
                    ['out_for_delivery', 'delivered'].includes(currentOrder?.order_status) ? 'w-full' : 'w-0'
                  }`}></div>
                </div>
              </div>

              {/* Cancellation UI Block */}
              {!['cancellation_requested', 'refund_processed', 'cancelled', 'out_for_delivery', 'delivered'].includes(currentOrder?.order_status || '') && (
                <div className="mb-6 p-4 bg-gray-800 rounded-xl border border-gray-700 text-left">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">Need to make changes?</p>
                    {['pending', 'confirmed', 'paid'].includes(currentOrder?.order_status || 'pending') ? (
                      <button 
                        onClick={() => setShowCancelModal(true)}
                        className="text-red-500 hover:text-red-400 font-bold text-sm px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition"
                      >
                        Cancel Order
                      </button>
                    ) : (
                      <span className="text-orange-500 text-sm font-medium">Contact Restaurant to Cancel</span>
                    )}
                  </div>
                </div>
              )}

              {/* Status Banner for Cancellations/Refunds */}
              {['cancellation_requested', 'refund_processed', 'cancelled'].includes(currentOrder?.order_status || '') && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-left flex gap-3">
                  <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h4 className="text-red-400 font-bold mb-1">
                      {currentOrder.order_status === 'refund_processed' ? 'Order Cancelled & Refunded' : 'Cancellation Processing'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {currentOrder.order_status === 'refund_processed' 
                        ? 'Your order was successfully cancelled and your payment has been refunded to your original method.' 
                        : 'Your cancellation request is pending admin review.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-green-900/30 rounded-lg p-4 mb-6 text-left border border-green-500/20">
                <p className="text-green-300 font-mono text-sm break-all mb-1">
                  <span className="text-green-400 font-semibold">Order ID:</span> {currentOrder.id}
                </p>
                {currentOrder.payment_id && (
                  <p className="text-green-300 font-mono text-sm break-all">
                    <span className="text-green-400 font-semibold">Payment ID:</span> {currentOrder.payment_id}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-left mb-6">
                <p className="text-white">
                  <span className="text-gray-400">Name:</span> {currentOrder.customer_name}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Phone:</span> {currentOrder.phone}
                </p>
                <p className="text-white">
                  <span className="text-gray-400">Delivery Address:</span> {currentOrder.address}
                </p>
                <p className="text-white text-lg font-bold">
                  <span className="text-gray-400">Total:</span> ₹{(currentOrder.total_price).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition font-bold"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => window.location.href = `rapido://pickup?address=Cecily+Restaurant,+MG+Road,+Vijayawada&dropoff=${encodeURIComponent(currentOrder.address)}`}
                  className="flex-1 bg-[#FFD700] hover:bg-[#FACC15] text-gray-900 border border-[#CA8A04] shadow-[0_0_15px_rgba(255,215,0,0.5)] px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 font-bold"
                >
                  🚴 Call Rapido for Delivery
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full border border-gray-700 shadow-2xl animate-in">
              <h3 className="text-2xl font-bold text-white mb-2 text-center text-red-500">Are you sure?</h3>
              <p className="text-gray-300 mb-6 text-center">
                Once the kitchen starts cooking, cancellations may not be possible. If you cancel now, your refund will be processed immediately.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancel}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
