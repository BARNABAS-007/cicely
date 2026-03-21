import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader, AlertCircle } from 'lucide-react';

export default function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    id: 1,
    restaurant_name: '',
    phone: '',
    address: '',
    delivery_fee: 0,
    min_order_amount: 0,
    is_open: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .limit(1)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, might be acceptable if new db
          // Insert a default row
          await supabase.from('restaurant_settings').insert([formData]);
        } else if (error.message.includes('relation "restaurant_settings" does not exist')) {
           setError('restaurant_settings table does not exist in the database. Please create it.');
        } else {
          throw error;
        }
      }
      
      if (data) {
        setFormData(data);
      }
    } catch (err: any) {
      console.warn("Failed to fetch settings:", err);
      // Fallback to local storage if DB fails completely / doesn't exist yet
      const localData = localStorage.getItem('restaurant_settings_fallback');
      if (localData) {
        setFormData(JSON.parse(localData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const { error } = await supabase
        .from('restaurant_settings')
        .upsert({ ...formData, updated_at: new Date().toISOString() });
        
      if (error) throw error;
      setSuccess('Settings saved successfully!');
    } catch (err: any) {
      console.warn("Failed to save to DB:", err);
      localStorage.setItem('restaurant_settings_fallback', JSON.stringify(formData));
      setSuccess('Settings saved locally (Database table might not exist).');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-white mb-6">Restaurant Settings</h2>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Restaurant Name</label>
            <input
              type="text"
              value={formData.restaurant_name}
              onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="e.g. Cecily Restaurant"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Contact Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="+91 9876543210"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-400">Restaurant Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors h-24 resize-none"
              placeholder="Full restaurant address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Delivery Fee (₹)</label>
            <input
              type="number"
              value={formData.delivery_fee}
              onChange={(e) => setFormData({ ...formData, delivery_fee: parseFloat(e.target.value) || 0 })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Minimum Order Amount (₹)</label>
            <input
              type="number"
              value={formData.min_order_amount}
              onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div className="space-y-2 md:col-span-2 flex items-center justify-between bg-gray-900 p-4 rounded-lg border border-gray-700">
            <div>
              <h4 className="text-white font-medium">Accepting Orders</h4>
              <p className="text-sm text-gray-400">Turn this off to temporarily pause all new orders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_open}
                onChange={(e) => setFormData({ ...formData, is_open: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>
        
      </div>
    </div>
  );
}
