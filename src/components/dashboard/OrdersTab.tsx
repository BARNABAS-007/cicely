import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../types';
import { AlertCircle, Truck, Phone, MapPin, Package, Download, RefreshCw } from 'lucide-react';
import DeliveryModal from '../DeliveryModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    fetchOrders();

    // Setup Supabase Realtime subscription with status tracking
    console.log('🔔 Initializing Realtime for Orders...');
    const channel = supabase
      .channel('admin-orders-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('✅ NEW ORDER RECEIVED:', payload.new.id);
          playBuzzSound();
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('🔄 ORDER UPDATED:', payload.new.id);
          fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime Status:', status);
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setRealtimeStatus('error');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const playBuzzSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (startTime: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'square';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      };
      [0, 0.4, 0.8].forEach(t => playBeep(ctx.currentTime + t));
    } catch (e) { console.warn('Audio buzz failed', e); }
  };

  const fetchOrders = async () => {
    try {
      // PERF: Limit to last 50 orders to avoid "snail" speed on large DBs
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

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

  const handleBookDelivery = (order: Order) => {
    setSelectedOrder(order);
    setShowDeliveryModal(true);
  };

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((o) => o.order_status === filterStatus);

  const statusFlow = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

  const statusColors: { [key: string]: string } = {
    pending: 'bg-amber-900/20 text-amber-500 border-amber-500/30',
    preparing: 'bg-blue-900/20 text-blue-400 border-blue-500/30',
    ready: 'bg-green-900/20 text-green-400 border-green-500/30',
    out_for_delivery: 'bg-purple-900/20 text-purple-400 border-purple-500/30',
    delivered: 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-900/20 text-red-400 border-red-500/30',
    cancellation_requested: 'bg-red-600 text-white border-red-600 animate-pulse',
  };

  const generateBill = (order: any) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(212, 175, 55);
      doc.text("Cecily Restaurant", 105, 22, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("MG Road, Vijayawada, Andhra Pradesh", 105, 30, { align: "center" });
      doc.text("Phone: +91 8977461605", 105, 36, { align: "center" });
      
      // Divider
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(14, 42, 196, 42);
      
      // Order Info
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`, 14, 52);
      doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 58);
      doc.text(`Time: ${new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, 14, 64);
      
      doc.text(`Customer: ${order.customer_name}`, 110, 52);
      doc.text(`Phone: ${order.phone}`, 110, 58);
      doc.text(`Status: ${order.order_status.replace(/_/g, ' ').toUpperCase()}`, 110, 64);

      // Items Table
      const tableData = (order.items || []).map((item: any) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return [
          item.name, 
          String(item.quantity), 
          `Rs. ${price.toFixed(2)}`, 
          `Rs. ${(price * item.quantity).toFixed(2)}`
        ];
      });

      const subtotal = (order.items || []).reduce((sum: number, item: any) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * item.quantity);
      }, 0);

      const gst = subtotal * 0.05;
      const packagingFee = 15;
      const deliveryCharge = 30;

      const result = autoTable(doc, {
        startY: 72,
        head: [['Item', 'Qty', 'Price', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { cellWidth: 80 } },
      });

      // Get Y position after the table
      const finalY = (result as any)?.finalY || (doc as any).lastAutoTable?.finalY || 140;

      // Bill Summary
      const summaryY = finalY + 10;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      
      doc.text("Subtotal:", 130, summaryY);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, 196, summaryY, { align: "right" });
      
      doc.text("GST (5%):", 130, summaryY + 6);
      doc.text(`Rs. ${gst.toFixed(2)}`, 196, summaryY + 6, { align: "right" });
      
      doc.text("Packaging Fee:", 130, summaryY + 12);
      doc.text(`Rs. ${packagingFee.toFixed(2)}`, 196, summaryY + 12, { align: "right" });
      
      doc.text("Delivery (Rapido):", 130, summaryY + 18);
      doc.text(`Rs. ${deliveryCharge.toFixed(2)}`, 196, summaryY + 18, { align: "right" });

      doc.setDrawColor(200, 200, 200);
      doc.line(130, summaryY + 22, 196, summaryY + 22);

      doc.setFontSize(12);
      doc.setTextColor(212, 175, 55);
      doc.text("Grand Total:", 130, summaryY + 30);
      doc.text(`Rs. ${order.total_price.toFixed(2)}`, 196, summaryY + 30, { align: "right" });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Thank you for ordering from Cecily Restaurant!", 105, 280, { align: "center" });

      doc.save(`Cecily_Invoice_${order.id.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error('Invoice generation failed:', err);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DeliveryModal
        order={selectedOrder}
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
      />

      {/* Header & Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Order Command Center</h2>
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-brand-cream/40 text-xs font-bold uppercase tracking-widest">
              {realtimeStatus === 'connected' ? 'Live Sync Active' : 'Connecting to Live Feed...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-brand-dark border border-white/10 rounded-full px-6 py-2.5 text-brand-cream text-xs font-bold uppercase tracking-widest focus:border-brand-gold outline-none transition-all"
          >
            <option value="all">All Lifecycles</option>
            {statusFlow.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <button 
            onClick={() => { setLoading(true); fetchOrders(); }}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-brand-gold transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-gold/20 border-t-brand-gold rounded-full animate-spin"></div>
          <p className="text-brand-cream/40 font-bold uppercase tracking-widest text-xs">Fetching Orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-32 bg-white/5 border border-dashed border-white/10 rounded-3xl">
          <Package className="w-12 h-12 mx-auto text-brand-cream/10 mb-4" />
          <p className="text-brand-cream/40 font-bold uppercase tracking-widest text-xs">No active orders in this view</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredOrders.map((order) => {
            return (
              <div 
                key={order.id} 
                className="group bg-white/5 border border-white/10 rounded-3xl p-8 transition-all duration-500 hover:bg-white/[0.07] hover:border-brand-gold/30 relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>

                <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black tracking-[0.2em] uppercase shadow-lg ${statusColors[order.order_status]}`}>
                        {order.order_status.replace('_', ' ')}
                      </div>
                      <span className="text-brand-cream/20 font-mono text-xs">#{order.id.slice(0, 8)}...</span>
                      <span className="text-brand-cream/40 text-xs font-bold uppercase tracking-widest">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <p className="text-brand-cream/40 text-[10px] font-black uppercase tracking-widest mb-1">Customer</p>
                        <p className="text-xl font-bold text-white tracking-tight">{order.customer_name}</p>
                        <p className="text-brand-cream/60 text-sm mt-1 flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-brand-gold" /> {order.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-brand-cream/40 text-[10px] font-black uppercase tracking-widest mb-1">Destination</p>
                        <p className="text-white text-sm font-medium leading-relaxed flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                          {order.address}
                        </p>
                      </div>
                    </div>

                    <div className="bg-brand-dark/40 rounded-2xl p-4 border border-white/5">
                      <div className="space-y-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-brand-cream/80 font-medium">{item.name} <span className="text-brand-gold mx-2">×</span> {item.quantity}</span>
                            <span className="text-brand-cream font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                          <span className="text-brand-cream/40 text-[10px] font-black uppercase tracking-widest">Total Bill</span>
                          <span className="text-2xl font-black text-brand-gold">₹{order.total_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:w-72 flex flex-col gap-3">
                    <p className="text-brand-cream/40 text-[10px] font-black uppercase tracking-widest mb-1">Logistics & Service</p>
                    
                    {/* OTP Display */}
                    {order.otp_log ? (
                      <div className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-2xl group/otp relative">
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-1">Pickup OTP</p>
                        <p className="text-3xl font-black text-emerald-400 tracking-[0.3em]">{order.otp_log}</p>
                      </div>
                    ) : order.delivery_requested ? (
                      <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-2xl animate-pulse">
                        <p className="text-brand-gold text-[10px] font-black uppercase tracking-widest mb-1">Waiting for OTP</p>
                        <div className="h-8 w-full bg-brand-gold/5 rounded-md"></div>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleBookDelivery(order)}
                        className="flex flex-col items-center justify-center p-4 bg-brand-gold text-brand-dark rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-gold-glow"
                      >
                        <Truck className="w-5 h-5 mb-2" />
                        Delivery
                      </button>
                      <button
                        onClick={() => generateBill(order)}
                        className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 text-brand-cream rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                      >
                        <Download className="w-5 h-5 mb-2" />
                        Invoice
                      </button>
                    </div>

                    <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                      {statusFlow.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(order.id, status)}
                          disabled={order.order_status === status}
                          className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            order.order_status === status 
                              ? 'bg-brand-gold text-brand-dark' 
                              : 'bg-white/5 text-brand-cream/40 hover:bg-white/10'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
