import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader, XCircle, Copy, MapPin, Phone, Navigation } from 'lucide-react';

const RESTAURANT_ADDRESS = 'Cecily Restaurant, MG Road, Vijayawada, Andhra Pradesh';
const RESTAURANT_PHONE = '+91 8977461605';

// Distinct alarm sounds so customer knows what action is needed
function playAlarmSound(type: 'ready' | 'otp' | 'book') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const makeBeep = (freq: number, start: number, dur: number, wave: OscillatorType = 'sine', vol = 0.35) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = wave;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.start(start);
      osc.stop(start + dur);
    };
    const t = ctx.currentTime;

    if (type === 'ready') {
      // 🔔 FOOD READY — Doorbell "ding-dong" pattern (high-low, repeated)
      makeBeep(988, t, 0.3, 'sine', 0.5);        // Ding (high B5)
      makeBeep(784, t + 0.35, 0.4, 'sine', 0.5); // Dong (G5)
      makeBeep(988, t + 1.0, 0.3, 'sine', 0.5);  // Ding again
      makeBeep(784, t + 1.35, 0.4, 'sine', 0.5); // Dong again
    } else if (type === 'book') {
      // 🚨 BOOK RIDER — Urgent siren (ascending then descending, fast)
      makeBeep(440, t, 0.15, 'sawtooth', 0.3);
      makeBeep(554, t + 0.15, 0.15, 'sawtooth', 0.3);
      makeBeep(659, t + 0.3, 0.15, 'sawtooth', 0.3);
      makeBeep(880, t + 0.45, 0.2, 'sawtooth', 0.4);
      makeBeep(659, t + 0.7, 0.15, 'sawtooth', 0.3);
      makeBeep(554, t + 0.85, 0.15, 'sawtooth', 0.3);
      makeBeep(440, t + 1.0, 0.2, 'sawtooth', 0.3);
      // Repeat
      makeBeep(440, t + 1.5, 0.15, 'sawtooth', 0.3);
      makeBeep(554, t + 1.65, 0.15, 'sawtooth', 0.3);
      makeBeep(659, t + 1.8, 0.15, 'sawtooth', 0.3);
      makeBeep(880, t + 1.95, 0.25, 'sawtooth', 0.4);
    } else {
      // 📱 SEND OTP — Gentle triple chime (like a phone notification)
      makeBeep(1047, t, 0.12, 'sine', 0.4);       // C6
      makeBeep(1319, t + 0.15, 0.12, 'sine', 0.4); // E6
      makeBeep(1568, t + 0.3, 0.2, 'sine', 0.5);   // G6 (hold longer)
      // Second chime set
      makeBeep(1047, t + 0.8, 0.12, 'sine', 0.4);
      makeBeep(1319, t + 0.95, 0.12, 'sine', 0.4);
      makeBeep(1568, t + 1.1, 0.25, 'sine', 0.5);
    }
  } catch (e) {
    console.warn('Audio not available:', e);
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const successParam = queryParams.get('success');
  const queryOrderId = queryParams.get('order_id');

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [countdown, setCountdown] = useState<number | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);


  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev ? prev - 1 : 0));
      }, 1000);
    } else if (countdown === 0) {
      if (!currentOrder?.otp_log) {
        playAlarmSound('otp');
        if (navigator.vibrate) navigator.vibrate([300, 200, 300, 200, 500]);
        alert("⚠️ ACTION REQUIRED: Enter Pickup OTP for Rapido Captain.");
      }
      setCountdown(null);
    }
    return () => clearInterval(timer);
  }, [countdown, currentOrder]);

  useEffect(() => {
    if (successParam === 'true' && queryOrderId) {
      const fetchOrder = async () => {
        const { data } = await supabase.from('orders').select('*').eq('id', queryOrderId).single();
        if (data) setCurrentOrder(data);
        setLoading(false);
      };
      
      fetchOrder();
      
      const channel = supabase.channel(`public:orders:${queryOrderId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${queryOrderId}` }, (payload: any) => {
          setCurrentOrder((prevOrder: any) => {
             // If status just became ready, alarm + vibrate
             if (payload.new.order_status === 'ready' && prevOrder?.order_status !== 'ready') {
                 playAlarmSound('ready');
                 if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 600]);
             }
             return payload.new;
          });
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
    const status = currentOrder?.order_status || 'pending';
    const isDeliveryRequested = currentOrder?.delivery_requested;
    const isCancelled = ['cancellation_requested', 'refund_processed', 'cancelled'].includes(status);
    
    // Define tracking steps
    const steps = [
      { key: 'confirmed', label: 'Order Confirmed', icon: '✅', description: 'Your order has been received' },
      { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', description: 'Chef is cooking your food' },
      { key: 'ready', label: 'Food Ready', icon: '🍽️', description: 'Your food is packed & ready' },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚴', description: 'Rider is on the way' },
      { key: 'delivered', label: 'Delivered', icon: '🎉', description: 'Enjoy your meal!' },
    ];

    // Map order status to step index
    const getActiveStep = () => {
      if (['pending', 'paid', 'confirmed'].includes(status)) return 0;
      if (status === 'preparing') return 1;
      if (status === 'ready') return 2;
      if (status === 'out_for_delivery') return 3;
      if (status === 'delivered') return 4;
      return 0;
    };
    const activeStep = getActiveStep();

    // Elapsed time
    const orderTime = currentOrder.created_at ? new Date(currentOrder.created_at).getTime() : Date.now();
    const elapsedMins = Math.floor((Date.now() - orderTime) / 60000);

    // Status headline
    const statusHeadline = isCancelled 
      ? (status === 'refund_processed' ? 'Order Cancelled & Refunded' : 'Cancellation Requested')
      : status === 'delivered' ? 'Order Delivered!' 
      : status === 'out_for_delivery' ? 'On Its Way to You!'
      : status === 'ready' ? '🔔 Your Food is Ready!'
      : status === 'preparing' ? 'Preparing Your Order...'
      : 'Order Placed Successfully!';

    // Can cancel? Only before rider booked and within early statuses
    const canCancel = !isCancelled 
      && !isDeliveryRequested
      && ['pending', 'confirmed', 'paid', 'preparing'].includes(status)
      && !['out_for_delivery', 'delivered'].includes(status);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">

            {/* ── Header ── */}
            <div className="text-center mb-6">
              {!isCancelled ? (
                <>
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center text-2xl ${
                    status === 'delivered' ? 'bg-green-500/20' :
                    status === 'ready' ? 'bg-yellow-500/20 animate-pulse' :
                    'bg-orange-500/20'
                  }`}>
                    {status === 'delivered' ? '🎉' : status === 'ready' ? '🔔' : status === 'out_for_delivery' ? '🚴' : status === 'preparing' ? '👨‍🍳' : '✓'}
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{statusHeadline}</h2>
                  <p className="text-gray-500 text-sm">
                    {elapsedMins === 0 ? 'Just now' : `${elapsedMins} min${elapsedMins > 1 ? 's' : ''} ago`} · Order #{currentOrder.id?.slice(-6)}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-3 bg-red-500/20 rounded-2xl flex items-center justify-center">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-400 mb-1">{statusHeadline}</h2>
                  <p className="text-gray-500 text-sm">
                    {status === 'refund_processed' 
                      ? 'Your refund has been processed to your original payment method.'
                      : 'Your cancellation request is being reviewed by the restaurant.'}
                  </p>
                </>
              )}
            </div>

            {/* ── Live Tracking Steps ── */}
            {!isCancelled && (
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-5 mb-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Live Tracking</span>
                  {status !== 'delivered' && (
                    <span className="text-orange-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      Live
                    </span>
                  )}
                </div>

                <div className="space-y-0">
                  {steps.map((step, idx) => {
                    const isCompleted = idx < activeStep;
                    const isActive = idx === activeStep;

                    return (
                      <div key={step.key} className="flex gap-3">
                        {/* Vertical line + dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-all duration-500 ${
                            isCompleted ? 'bg-green-500/20 border-2 border-green-500' :
                            isActive ? 'bg-orange-500/20 border-2 border-orange-400 shadow-[0_0_12px_rgba(255,165,0,0.4)] animate-pulse' :
                            'bg-gray-700/50 border-2 border-gray-600'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <span className={`text-xs ${isActive ? '' : 'grayscale opacity-40'}`}>{step.icon}</span>
                            )}
                          </div>
                          {idx < steps.length - 1 && (
                            <div className={`w-0.5 h-8 transition-all duration-500 ${
                              isCompleted ? 'bg-green-500/50' : 'bg-gray-700'
                            }`} />
                          )}
                        </div>

                        {/* Label */}
                        <div className="pt-1 pb-3">
                          <p className={`text-sm font-bold transition-colors ${
                            isCompleted ? 'text-green-400' :
                            isActive ? 'text-white' :
                            'text-gray-600'
                          }`}>
                            {step.label}
                          </p>
                          {(isActive || isCompleted) && (
                            <p className={`text-xs ${isActive ? 'text-gray-400' : 'text-gray-600'}`}>
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Cancellation Warning (when rider is booked) ── */}
            {isDeliveryRequested && !isCancelled && !['delivered'].includes(status) && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-3 mb-5 flex items-center gap-2.5">
                <span className="text-red-500 shrink-0">🚫</span>
                <p className="text-red-400/80 text-xs">
                  <strong className="text-red-400">Rider booked</strong> — cancellation is no longer available for this order.
                </p>
              </div>
            )}

            {/* ── Cancel Button (only when allowed) ── */}
            {canCancel && (
              <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 mb-5 flex items-center justify-between">
                <p className="text-gray-500 text-xs">Need to cancel?</p>
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="text-red-500 hover:text-red-400 font-bold text-xs px-3 py-1.5 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {/* ── Order Details Card ── */}
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-5 mb-5 backdrop-blur-sm">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Order Details</p>
              
              {/* Customer Info */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="text-white font-medium">{currentOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-white font-medium">{currentOrder.phone}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-500 shrink-0">Address</span>
                  <span className="text-white font-medium text-right ml-4 max-w-[200px]">{currentOrder.address}</span>
                </div>
              </div>

              {/* Full Itemized Invoice */}
              <div className="border-t border-gray-700 pt-3">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">🧾 Invoice</p>
                <div className="space-y-1.5">
                  {(currentOrder.items || []).map((item: any, idx: number) => {
                    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.name} <span className="text-gray-600">× {item.quantity}</span></span>
                        <span className="text-white font-medium">₹{(price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                {(() => {
                  const subtotal = (currentOrder.items || []).reduce((sum: number, item: any) => {
                    const p = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
                    return sum + (p * item.quantity);
                  }, 0);
                  const gst = subtotal * 0.05;
                  const packaging = 15;
                  const delivery = 30;
                  return (
                    <div className="mt-3 pt-2 border-t border-gray-700/50 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>GST (5%)</span>
                        <span>₹{gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Packaging Fee</span>
                        <span>₹{packaging.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Delivery (Rapido)</span>
                        <span>₹{delivery.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-700 mt-1">
                        <span className="text-white font-bold">Grand Total</span>
                        <span className="text-orange-400 font-bold text-lg">₹{currentOrder.total_price.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Order ID */}
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <p className="text-gray-600 text-[10px] font-mono break-all">
                  ID: {currentOrder.id}
                </p>
                {currentOrder.payment_id && (
                  <p className="text-gray-600 text-[10px] font-mono break-all">
                    Payment: {currentOrder.payment_id}
                  </p>
                )}
              </div>
            </div>

            {/* ── Rapido Booking: Addresses to Copy ── */}
            {(
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 p-5 mb-5 backdrop-blur-sm space-y-3">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">📋 Copy addresses for Rapido</p>
                
                {/* Pickup – Restaurant */}
                <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Pickup (Restaurant)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm flex-1">{RESTAURANT_ADDRESS}</p>
                    <button onClick={() => handleCopy(RESTAURANT_ADDRESS, 'pickup')} className="p-1.5 hover:bg-gray-700 rounded transition shrink-0" title="Copy address">
                      {copiedKey === 'pickup' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-gray-500 shrink-0" />
                    <span className="text-gray-400 text-xs flex-1">{RESTAURANT_PHONE}</span>
                    <button onClick={() => handleCopy(RESTAURANT_PHONE, 'pickupPhone')} className="p-1.5 hover:bg-gray-700 rounded transition shrink-0" title="Copy phone">
                      {copiedKey === 'pickupPhone' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                {/* Drop – Customer */}
                <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Drop (Your Address)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm flex-1">{currentOrder.address}</p>
                    <button onClick={() => handleCopy(currentOrder.address, 'drop')} className="p-1.5 hover:bg-gray-700 rounded transition shrink-0" title="Copy address">
                      {copiedKey === 'drop' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-xl transition font-bold text-sm border border-gray-700"
              >
                Back to Home
              </button>
              <button
                onClick={async () => {
                  playAlarmSound('book');
                  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                  await supabase.from('orders').update({ delivery_requested: true }).eq('id', currentOrder.id);
                  const deeplink = `rapido://pickup?address=${encodeURIComponent(RESTAURANT_ADDRESS)}&dropoff=${encodeURIComponent(currentOrder.address)}`;
                  const iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  iframe.src = deeplink;
                  document.body.appendChild(iframe);
                  setTimeout(() => {
                    document.body.removeChild(iframe);
                    window.open('https://rapido.bike', '_blank');
                  }, 1500);
                  setShowOtpInput(true);
                  setCountdown(60);
                }}
                className={`flex-1 ${status === 'ready' ? 'bg-[#FFD700] hover:bg-[#FACC15] animate-pulse shadow-[0_0_20px_rgba(255,215,0,0.8)]' : 'bg-[#FFD700] hover:bg-[#FACC15] shadow-[0_0_15px_rgba(255,215,0,0.5)]'} text-gray-900 border border-[#CA8A04] px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 font-bold text-sm`}
              >
                {status === 'ready' ? '🚨 BOOK RIDER NOW' : '🚴 Call Rapido'}
              </button>
            </div>

            {/* ── OTP Input ── */}
            {showOtpInput && !currentOrder?.otp_log && (
              <div className="bg-gray-800/50 rounded-2xl border border-orange-500/30 p-5 mb-5 backdrop-blur-sm">
                <h4 className="text-orange-400 font-bold mb-2 flex justify-between items-center">
                  <span>📱 Enter Rapido Pickup OTP</span>
                  {countdown !== null && countdown > 0 && (
                    <span className={`text-sm font-mono animate-pulse ${countdown <= 15 ? 'text-red-500' : 'text-yellow-400'}`}>{countdown}s</span>
                  )}
                </h4>
                <p className="text-gray-400 text-xs mb-1">
                  Open your <strong className="text-white">Rapido app</strong> → go to <strong className="text-white">My Trips</strong> → find your booking → tap the trip to see the <strong className="text-orange-400">4-digit pickup OTP</strong>.
                </p>
                <p className="text-gray-500 text-xs mb-3">Share this OTP with the restaurant so they can hand over your order to the rider.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000"
                    className="bg-gray-900 text-white border border-gray-700 rounded-xl px-4 py-2.5 flex-1 outline-none focus:border-orange-500 text-center tracking-[0.5em] font-mono text-lg"
                  />
                  <button
                    onClick={async () => {
                      if (otpValue.length === 4) {
                        const { error } = await supabase
                          .from('orders')
                          .update({ otp_log: otpValue, delivery_requested: true, updated_at: new Date().toISOString() })
                          .eq('id', currentOrder.id);
                        if (!error) {
                          setCurrentOrder((prev: any) => ({ ...prev, otp_log: otpValue, delivery_requested: true }));
                          setShowOtpInput(false);
                        } else {
                          console.error('Failed to save OTP to database:', error.message);
                          alert('⚠️ OTP could not be saved to the database. The restaurant dashboard won\'t see it.\n\nPlease ask the restaurant owner to add the "otp_log" and "delivery_requested" columns to the orders table in Supabase.\n\nError: ' + error.message);
                        }
                      }
                    }}
                    disabled={otpValue.length !== 4}
                    className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 font-bold rounded-xl transition"
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            )}

            {/* ── OTP Success ── */}
            {currentOrder?.otp_log && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 mb-5 text-center">
                <p className="text-green-400 font-bold text-sm">✓ OTP ({currentOrder.otp_log}) Sent Successfully</p>
              </div>
            )}

          </div>
        </div>

        {/* Cancellation Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-md w-full border border-gray-700 shadow-2xl">
              <h3 className="text-2xl font-bold text-red-500 mb-2 text-center">Are you sure?</h3>
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
