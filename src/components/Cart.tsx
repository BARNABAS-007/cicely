import { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Minus, Plus, Loader, MapPin, CreditCard, Banknote, ShieldCheck, Trash2, User, Navigation, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('idle');
  const [showPolicyPopup, setShowPolicyPopup] = useState(false);
  
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', countryCode: '+91', phone: '', address: '' });
  const [gettingLocation, setGettingLocation] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
  const navigate = useNavigate();
  const totalItems = getTotalItems();
  const totalPrice = Number(getTotalPrice() || 0);

  const handleGetLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported');
      return;
    }
    setGettingLocation(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.coords.latitude}&lon=${p.coords.longitude}`);
          const data = await res.json();
          setFormData(prev => ({ ...prev, address: data.display_name || `${p.coords.latitude}, ${p.coords.longitude}` }));
        } catch { setError('Failed to get address'); }
        finally { setGettingLocation(false); }
      },
      () => { setError('Location access denied'); setGettingLocation(false); }
    );
  };

  const PACKAGING_FEE = 15;
  const DELIVERY_CHARGE = 30;
  const gst = totalPrice * 0.05;
  const grandTotal = totalPrice + gst + PACKAGING_FEE + DELIVERY_CHARGE;

  const handleInitiateOrder = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill in all delivery details');
      return;
    }
    if (formData.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setShowPolicyPopup(true);
  };

  const handlePlaceOrder = async () => {
    setShowPolicyPopup(false);
    setLoading(true);
    setCheckoutStep('securing');
    setError('');

    try {
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const { data: success } = await supabase.rpc('decrement_stock', { p_item_id: item.id });
          if (success === false) {
            setError(`Highly Popular: ${item.name} just sold out!`);
            setLoading(false);
            setCheckoutStep('idle');
            return;
          }
        }
      }

      setCheckoutStep('processing');
      const totalAmount = grandTotal;
      
      if (paymentMethod === 'cod') {
        const { data, error: err } = await supabase.from('orders').insert([{
          customer_name: formData.name,
          phone: `${formData.countryCode} ${formData.phone}`,
          address: formData.address,
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          total_price: totalAmount,
          order_status: 'pending'
        }]).select();

        if (err) throw err;
        clearCart();
        setIsOpen(false);
        navigate(`/checkout?success=true&order_id=${data?.[0]?.id}`);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        name: 'Cecily Restaurant',
        description: 'Premium Dining Order',
        handler: async () => {
          const { data, error: err } = await supabase.from('orders').insert([{
            customer_name: formData.name,
            phone: `${formData.countryCode} ${formData.phone}`,
            address: formData.address,
            items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
            total_price: totalAmount,
            order_status: 'paid'
          }]).select();
          if (err) throw err;
          clearCart();
          setIsOpen(false);
          const orderId = data?.[0]?.id;
          if (orderId) navigate(`/checkout?success=true&order_id=${orderId}`);
          else navigate('/');
        },
        prefill: { name: formData.name, contact: formData.phone },
        theme: { color: '#D4AF37' },
        modal: { ondismiss: () => { setLoading(false); setCheckoutStep('idle'); } }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message);
      setLoading(false); setCheckoutStep('idle');
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* 📱 MOBILE: Floating "View Cart" Pill */}
      {/* ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {totalItems > 0 && !isOpen && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setIsOpen(true)}
            className="md:hidden fixed bottom-[5.5rem] left-4 right-4 z-[60] btn-gold-amber rounded-2xl py-4 px-6 flex items-center justify-between shadow-gold-glow"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black/20 rounded-xl flex items-center justify-center">
                <ShoppingCart size={16} />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 block leading-none">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
                <span className="text-base font-black tracking-tight">₹{(totalPrice * 1.05 + 5).toFixed(0)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-black text-xs uppercase tracking-widest">
              View Cart <ChevronRight size={16} />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════ */}
      {/* 🖥️ DESKTOP: Floating Cart Button */}
      {/* ═══════════════════════════════════════════ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:flex fixed bottom-8 right-8 z-50 w-20 h-20 btn-gold-amber rounded-[28px] shadow-gold-glow items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 group"
      >
        <ShoppingCart className="w-8 h-8" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-black rounded-full w-7 h-7 flex items-center justify-center border-4 border-brand-gold shadow-lg">
            {totalItems}
          </span>
        )}
      </button>

      {/* ═══════════════════════════════════════════ */}
      {/* Cart Drawer */}
      {/* ═══════════════════════════════════════════ */}
      {isOpen && (
        <>
          {/* Overlay — NO blur on mobile for performance */}
          <div className="fixed inset-0 bg-black/80 md:backdrop-blur-sm z-50 animate-in fade-in duration-300" onClick={() => setIsOpen(false)} />
          
          {/* Drawer — full height flex column */}
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[500px] bg-[#0a0806] z-[60] flex flex-col shadow-2xl border-l border-white/5 animate-in slide-in-from-right duration-500">
            
            {/* Header — compact on mobile */}
            <div className="bg-black p-5 md:p-8 flex items-center justify-between border-b border-white/5 shrink-0">
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                  <ShoppingCart className="text-brand-gold" size={22} /> Selection
                </h2>
                <p className="text-brand-cream/30 text-[9px] font-black uppercase tracking-[0.3em] mt-1">{totalItems} items · ₹{totalPrice.toFixed(0)}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-brand-gold hover:text-brand-dark transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Area — items + form together */}
            <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide">
              
              {/* Cart Items */}
              <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center opacity-30">
                      <ShoppingCart size={32} className="text-brand-cream" />
                    </div>
                    <p className="text-brand-cream/20 font-black uppercase tracking-[0.4em] text-[10px]">Your basket is empty</p>
                    <button onClick={() => setIsOpen(false)} className="text-brand-gold text-[10px] font-black uppercase tracking-widest border-b border-brand-gold/30 pb-1 hover:border-brand-gold transition-all">Start Exploring</button>
                  </div>
                ) : (
                  <>
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center bg-white/[0.03] border border-white/5 p-3 md:p-4 rounded-2xl hover:border-brand-gold/20 transition-all duration-300">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-bold text-sm md:text-base truncate">{item.name}</h4>
                          <span className="text-brand-gold font-black text-xs">₹{Number(item.price || 0).toFixed(0)} each</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/60 rounded-xl p-1 border border-white/10 shrink-0">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                            className="w-8 h-8 flex items-center justify-center text-brand-cream/40 hover:text-white transition-colors active:scale-90"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-white font-black text-sm w-5 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="w-8 h-8 flex items-center justify-center bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-black transition-all rounded-lg active:scale-90"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-brand-cream/10 hover:text-red-500 transition-colors shrink-0 active:scale-90">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Checkout Form — inside the scroll area so it doesn't push items out */}
              {items.length > 0 && (
                <div className="p-4 md:p-6 pt-2 space-y-4 border-t border-white/5">
                  <p className="text-brand-cream/30 text-[10px] font-black uppercase tracking-[0.4em]">Delivery Details</p>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream/20" size={16} />
                      <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-brand-cream/20 focus-gold-glow outline-none" />
                    </div>
                    
                    <div className="flex gap-3">
                      <select value={formData.countryCode} onChange={e => setFormData({...formData, countryCode: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-brand-cream text-xs font-bold focus:border-brand-gold outline-none">
                        <option value="+91">IN (+91)</option>
                      </select>
                      <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit mobile number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})} className={`flex-1 bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-brand-cream/20 focus-gold-glow outline-none ${formData.phone.length > 0 && formData.phone.length !== 10 ? 'border-red-500/50' : 'border-white/10'}`} />
                    </div>
                    
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 text-brand-cream/20" size={16} />
                      <textarea placeholder="Delivery Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-brand-cream/20 focus-gold-glow outline-none h-20 resize-none" />
                      <button onClick={handleGetLocation} className="absolute right-3 top-3 w-8 h-8 bg-brand-gold/10 text-brand-gold rounded-lg hover:bg-brand-gold hover:text-black transition-all flex items-center justify-center active:scale-90">
                        {gettingLocation ? <Loader size={14} className="animate-spin" /> : <Navigation size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setPaymentMethod('online')} 
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 ${paymentMethod === 'online' ? 'btn-gold-amber border-transparent shadow-gold-glow' : 'bg-white/5 text-brand-cream/40 border-white/10'}`}
                    >
                      <CreditCard size={18} />
                      <span>Pay Online</span>
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('cod')} 
                      className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 ${paymentMethod === 'cod' ? 'btn-gold-amber border-transparent shadow-gold-glow' : 'bg-white/5 text-brand-cream/40 border-white/10'}`}
                    >
                      <Banknote size={18} />
                      <span>Cash on Delivery</span>
                    </button>
                  </div>

                  {/* Bill Breakdown */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2 text-sm">
                    <div className="flex justify-between text-brand-cream/40">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-brand-cream/40">
                      <span>GST (5%)</span>
                      <span>₹{gst.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-brand-cream/40">
                      <span>Packaging Fee</span>
                      <span>₹{PACKAGING_FEE}</span>
                    </div>
                    <div className="flex justify-between text-brand-cream/40">
                      <span>Delivery (Rapido)</span>
                      <span>₹{DELIVERY_CHARGE}</span>
                    </div>
                    <div className="flex justify-between text-white font-black pt-2 border-t border-white/10 text-base">
                      <span>Total</span>
                      <span className="text-brand-gold">₹{grandTotal.toFixed(0)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 py-2.5 px-3 rounded-xl text-red-500 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <X size={12} /> {error}
                    </div>
                  )}

                  {/* Order Button */}
                  <button 
                    onClick={handleInitiateOrder} 
                    disabled={loading} 
                    className="w-full btn-gold-amber py-4 md:py-5 rounded-xl font-black tracking-[0.15em] uppercase text-xs shadow-gold-glow flex items-center justify-center gap-3 active:scale-95 transition-transform"
                  >
                    {loading ? <Loader className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    {loading ? 'Placing Order...' : `Place Order · ₹${grandTotal.toFixed(0)}`}
                  </button>

                  {/* Bottom padding for safe area */}
                  <div className="h-4 md:h-0"></div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* ═══════════════════════════════════════════ */}
      {/* ⚠️ Cancellation Policy Popup — Before Payment */}
      {/* ═══════════════════════════════════════════ */}
      {showPolicyPopup && (
        <>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" onClick={() => setShowPolicyPopup(false)} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-[#1a1512] rounded-2xl max-w-md w-full border border-orange-500/30 shadow-[0_0_40px_rgba(255,140,0,0.15)] overflow-hidden">
              {/* Warning Header */}
              <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 px-6 py-4 border-b border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-lg">Cancellation Policy</h3>
                    <p className="text-orange-300/70 text-xs">Please read before proceeding</p>
                  </div>
                </div>
              </div>

              {/* Policy Content */}
              <div className="p-6 space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="text-red-500 text-lg shrink-0">🚫</span>
                    <div>
                      <p className="text-red-400 font-bold text-sm mb-1">No Cancellation After Rider Booking</p>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        Once a Rapido rider has been booked for delivery, your order <strong className="text-red-300">cannot be cancelled</strong> and <strong className="text-red-300">no refund</strong> will be provided.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="text-yellow-500 text-lg shrink-0">⏱️</span>
                    <div>
                      <p className="text-yellow-400 font-bold text-sm mb-1">2-Minute Cancellation Window</p>
                      <p className="text-gray-400 text-xs leading-relaxed">
                        You can cancel within <strong className="text-yellow-300">2 minutes</strong> of placing the order (before food preparation starts). After that, cancellation is subject to restaurant approval.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <span className="text-blue-500 text-lg shrink-0">📋</span>
                    <div>
                      <p className="text-blue-400 font-bold text-sm mb-1">Order Summary</p>
                      <p className="text-gray-400 text-xs">
                        {items.length} item{items.length > 1 ? 's' : ''} · <strong className="text-white">₹{grandTotal.toFixed(0)}</strong> · {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setShowPolicyPopup(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3.5 rounded-xl transition border border-white/10"
                >
                  Go Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 btn-gold-amber font-black py-3.5 rounded-xl shadow-gold-glow flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <ShieldCheck size={16} />
                  I Agree, Pay Now
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
