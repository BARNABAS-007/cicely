import { useState } from 'react';
import { X, MapPin, Phone, Package, Copy, CheckCircle, Navigation } from 'lucide-react';
import { Order } from '../types';

interface DeliveryModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const RESTAURANT_ADDRESS = 'Cecily Restaurant, MG Road, Vijayawada, Andhra Pradesh';
const RESTAURANT_PHONE = '+91 8977461605'; // Update this to your actual restaurant phone

export default function DeliveryModal({ order, isOpen, onClose }: DeliveryModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      onClick={() => handleCopy(text, id)}
      className="p-1.5 hover:bg-gray-600 rounded transition shrink-0"
      title="Copy"
    >
      {copiedKey === id ? (
        <CheckCircle className="w-4 h-4 text-green-400" />
      ) : (
        <Copy className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-700 bg-gray-900 rounded-t-2xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Book Rapido Delivery
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Step-by-step guide */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">📋 How to Book</p>
              <ol className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-orange-400 font-bold shrink-0">1.</span> Open <strong className="text-white">Rapido app</strong> → tap <strong className="text-white">Parcel / Delivery</strong></li>
                <li className="flex gap-2"><span className="text-orange-400 font-bold shrink-0">2.</span> Set <strong className="text-white">Pickup</strong> → paste the restaurant address below</li>
                <li className="flex gap-2"><span className="text-orange-400 font-bold shrink-0">3.</span> Set <strong className="text-white">Drop</strong> → paste customer address below</li>
                <li className="flex gap-2"><span className="text-orange-400 font-bold shrink-0">4.</span> Confirm booking — rider will arrive at restaurant first</li>
                <li className="flex gap-2"><span className="text-orange-400 font-bold shrink-0">5.</span> Customer provides <strong className="text-orange-400">Pickup OTP</strong> to rider to start trip</li>
              </ol>
            </div>

            {/* Pickup Location */}
            <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">📍 Pickup (Restaurant)</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium text-sm flex-1">{RESTAURANT_ADDRESS}</p>
                <CopyBtn text={RESTAURANT_ADDRESS} id="pickup" />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <p className="text-gray-400 text-sm flex-1">{RESTAURANT_PHONE}</p>
                <CopyBtn text={RESTAURANT_PHONE} id="pickupPhone" />
              </div>
            </div>

            {/* Drop Location */}
            <div className="bg-gray-700/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">🏠 Drop (Customer)</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-white font-medium text-sm flex-1">{order.customer_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-300 text-sm flex-1">{order.address}</p>
                <CopyBtn text={order.address} id="drop" />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <p className="text-gray-400 text-sm flex-1">{order.phone}</p>
                <CopyBtn text={order.phone} id="dropPhone" />
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="bg-gray-700/30 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">🛍 Items</p>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-300 flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-orange-400">
                      ₹{((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400">₹{order.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* OTP status */}
            {(order as any).otp_log ? (
              <div className="bg-green-900/30 border border-green-500/40 rounded-xl p-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-green-300 text-xs font-semibold">Customer OTP Received</p>
                  <p className="text-green-400 font-mono font-bold text-xl tracking-[0.4em]">{(order as any).otp_log}</p>
                  <p className="text-gray-500 text-xs">Show this to the rider when they arrive for pickup</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-400">
                ⏳ Waiting for customer to provide the Rapido Pickup OTP...
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  const deeplink = `rapido://pickup?address=${encodeURIComponent(RESTAURANT_ADDRESS)}&dropoff=${encodeURIComponent(order.address)}`;
                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  iframe.src = deeplink;
                  document.body.appendChild(iframe);
                  setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.open('https://rapido.bike', '_blank');
                  }, 1500);
                }}
                className="flex-1 bg-[#FFD700] hover:bg-[#FACC15] text-gray-900 border border-[#CA8A04] font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,215,0,0.3)]"
              >
                <Package className="w-4 h-4" />
                Open Rapido App
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition"
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
