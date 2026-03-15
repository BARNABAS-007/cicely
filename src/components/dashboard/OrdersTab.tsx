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

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
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
  };

  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
    preparing: 'bg-blue-900/20 text-blue-400 border-blue-500/30',
    ready: 'bg-green-900/20 text-green-400 border-green-500/30',
    out_for_delivery: 'bg-purple-900/20 text-purple-400 border-purple-500/30',
    delivered: 'bg-green-900/20 text-green-400 border-green-500/30',
    cancelled: 'bg-red-900/20 text-red-400 border-red-500/30',
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
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.order_status] || Clock;

            return (
              <div key={order.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
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
                    {order.items.map((item, idx) => (
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
                    <button
                      onClick={() => handleBookDelivery(order)}
                      className="px-3 py-1 text-xs rounded transition bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    >
                      <Package className="w-3 h-3" />
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
