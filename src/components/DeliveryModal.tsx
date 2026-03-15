import { useState } from 'react';
import { X, MapPin, Phone, Package, Copy, CheckCircle } from 'lucide-react';
import { Order } from '../types';

interface DeliveryModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeliveryModal({ order, isOpen, onClose }: DeliveryModalProps) {
  const [copied, setCopied] = useState(false);
  const [booking, setBooking] = useState(false);

  if (!isOpen || !order) return null;

  const restaurantAddress = 'Cicely Restaurant, Vijayawada, India';
  const restaurantPhone = '+91 XXXXXXXXXX';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookDelivery = () => {
    setBooking(true);
    const message = `I need to book a delivery from ${restaurantAddress} to ${order.address}. Order ID: ${order.id}. Items: ${order.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}`;
    const rapidoUrl = `https://rapido.app`;
    window.open(rapidoUrl, '_blank');
    setTimeout(() => setBooking(false), 1000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-500" />
              Book Delivery
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-2">Order ID</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono text-sm break-all flex-1">{order.id}</p>
                <button
                  onClick={() => handleCopy(order.id)}
                  className="p-2 hover:bg-gray-600 rounded transition"
                >
                  <Copy className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Pickup Location */}
            <div>
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Pickup Location (Restaurant)</p>
                  <p className="text-white font-medium">{restaurantAddress}</p>
                  <p className="text-gray-400 text-sm mt-1">{restaurantPhone}</p>
                </div>
              </div>
            </div>

            {/* Delivery Location */}
            <div>
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Delivery Location (Customer)</p>
                  <p className="text-white font-medium">{order.customer_name}</p>
                  <p className="text-white text-sm">{order.address}</p>
                  <p className="text-gray-400 text-sm mt-1">{order.phone}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Items to Deliver</p>
              <div className="bg-gray-700/50 rounded-lg p-3 space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-300 flex justify-between">
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-orange-400">
                      ${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400">${order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                Use the information above to request delivery through Rapido Parcel or any delivery service. Share the order ID with the delivery partner for tracking.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleBookDelivery}
                disabled={booking}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                {booking ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                {booking ? 'Opening Rapido...' : 'Book Rapido Delivery'}
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
