import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { AlertCircle, Truck, ChefHat, Clock, CheckCircle, Phone, MapPin, Package } from 'lucide-react';
import DeliveryModal from '../DeliveryModal';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchOrders();

    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Change received!', payload);
          fetchOrders(); // Sync view immediately on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setOrders(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error: err } = await supabase
        .from('orders')
        .update({
          order_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (err) throw err;
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveOtp = async (orderId: string) => {
    const otp = otpInputs[orderId];
    if (!otp) return;
    
    try {
      const { error: err } = await supabase
        .from('orders')
        .update({
          otp_log: otp,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (err) throw err;
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.order_status === filterStatus);

  const statusFlow = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

  const statusIcons: { [key: string]: any } = {
    pending: Clock,
    preparing: ChefHat,
    ready: CheckCircle,
    out_for_delivery: Truck,
    delivered: CheckCircle,
    cancellation_requested: AlertCircle,
    refund_processed: CheckCircle,
  };

  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
    preparing: 'bg-blue-900/20 text-blue-400 border-blue-500/30',
    ready: 'bg-green-900/20 text-green-400 border-green-500/30',
    out_for_delivery: 'bg-purple-900/20 text-purple-400 border-purple-500/30',
    delivered: 'bg-green-900/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-900/20 text-red-400 border-red-500/30',
    cancellation_requested: 'bg-red-900/40 text-red-500 border-red-600 font-bold animate-pulse',
    refund_processed: 'bg-gray-800 text-gray-400 border-gray-600',
  };

  const handleBookDelivery = (order: Order) => {
    setSelectedOrder(order);
    setShowDeliveryModal(true);
  };

  return (
    <>
      <DeliveryModal
        order={selectedOrder}
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
      />
      <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Orders Management</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
          <span className="text-gray-400 text-sm">Total: {filteredOrders.length}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No orders found</div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => {
            const StatusIcon = statusIcons[order.order_status] || Clock;
            
            // Unfulfilled logic: Not delivered, not cancelled, and no OTP logged
            const isUnfulfilled = 
              !['delivered', 'cancelled', 'refund_processed', 'cancellation_requested'].includes(order.order_status) && 
              !order.otp_log;

            const isCancelReq = order.order_status === 'cancellation_requested';

            return (
              <div 
                key={order.id} 
                className={`bg-[#1A1A1A] rounded-xl border p-6 transition-all relative ${
                  isCancelReq 
                    ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                    : isUnfulfilled 
                      ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]' 
                      : 'border-[#CA8A04]/20'
                }`}
              >
                {isCancelReq && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-red-600/50 animate-bounce">
                    Action Required
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order ID</p>
                    <p className="text-white font-mono text-sm break-all">{order.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Customer</p>
                    <p className="text-white font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-orange-400 font-bold">${order.total_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Time</p>
                    <p className="text-white text-sm">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-700">
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Phone</p>
                      <p className="text-white text-sm">{order.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Delivery Address</p>
                      <p className="text-white text-sm">{order.address}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <p className="text-gray-300 text-sm font-semibold mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="text-gray-300 text-sm flex justify-between">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-orange-400">
                          ${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Management */}
                <div className="flex flex-wrap gap-2 items-center mb-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${statusColors[order.order_status] || statusColors.pending}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="capitalize">{order.order_status.replace('_', ' ')}</span>
                  </div>

                  <div className="flex-1"></div>

                  <div className="flex gap-2">
                    {statusFlow.map((status, idx) => {
                      const currentIdx = statusFlow.indexOf(order.order_status);
                      return (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          disabled={idx < currentIdx}
                          className={`px-2 py-1 text-xs rounded transition capitalize ${
                            idx <= currentIdx
                              ? idx === currentIdx
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      );
                    })}
                    
                    {/* ADMIN ACTION: Cancellation Requested Workflow */}
                    {order.order_status === 'cancellation_requested' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => updateOrderStatus(order.id, 'refund_processed')}
                          className="px-4 py-1.5 text-xs font-bold rounded bg-green-600 hover:bg-green-500 text-white shadow-[0_0_10px_rgba(22,163,74,0.4)] transition uppercase tracking-wide"
                        >
                          Approve & Refund
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-4 py-1.5 text-xs font-bold rounded bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700 transition uppercase tracking-wide"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    
                    {/* OTP BAR */}
                    <div className="flex items-center gap-2 ml-4 relative">
                      <input 
                        type="text" 
                        placeholder={order.otp_log ? `OTP: ${order.otp_log}` : "Delivery OTP"}
                        maxLength={6}
                        value={otpInputs[order.id] || ''}
                        onChange={(e) => setOtpInputs({ ...otpInputs, [order.id]: e.target.value })}
                        disabled={!!order.otp_log}
                        className={`w-28 px-3 py-1.5 text-sm rounded ${
                          order.otp_log 
                            ? 'bg-green-900/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-900 text-white border border-gray-700 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]'
                        } outline-none transition uppercase`}
                      />
                      {!order.otp_log && (
                        <button
                          onClick={() => saveOtp(order.id)}
                          className="px-3 py-1.5 text-xs font-bold rounded bg-[#D4AF37] hover:bg-[#FFD700] text-gray-900 transition"
                        >
                          Save
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleBookDelivery(order)}
                      className="px-3 py-1.5 text-xs font-bold ml-2 rounded transition bg-[#222222] border border-[#CA8A04] hover:bg-[#333333] text-[#FFD700] flex items-center gap-2"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Book Delivery
                    </button>
                  </div>
                </div>

                {order.delivery_requested && (
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-sm">
                    <p className="text-blue-300">
                      Delivery tracking enabled - Customer tracking order in real-time
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>
    </>
  );
}
