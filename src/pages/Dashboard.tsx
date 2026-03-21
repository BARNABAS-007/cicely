import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, BarChart3, Calendar, UtensilsCrossed, Settings, ShoppingBag, Package } from 'lucide-react';
import ReservationsTab from '../components/dashboard/ReservationsTab';
import AnalyticsTab from '../components/dashboard/AnalyticsTab';
import MenuTab from '../components/dashboard/MenuTab';
import OrdersTab from '../components/dashboard/OrdersTab';
import LiveInventoryTab from '../components/dashboard/LiveInventoryTab';
import SettingsTab from '../components/dashboard/SettingsTab';

type TabType = 'orders' | 'reservations' | 'analytics' | 'menu' | 'inventory' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('reservations');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-orange-600">Cicely</h1>
            <p className="text-gray-400 text-sm mt-1">Owner Dashboard</p>
          </div>

          <nav className="p-4 space-y-2">
            {[
              { id: 'orders' as TabType, label: 'Orders', icon: ShoppingBag },
              { id: 'reservations' as TabType, label: 'Reservations', icon: Calendar },
              { id: 'inventory' as TabType, label: 'Live Inventory', icon: Package },
              { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
              { id: 'menu' as TabType, label: 'Menu Management', icon: UtensilsCrossed },
              { id: 'settings' as TabType, label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === id
                    ? 'bg-orange-600/20 text-orange-500 border border-orange-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-700 bg-gray-800">
            <div className="text-sm text-gray-400 mb-4">
              <p className="truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition border border-red-600/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'reservations' && <ReservationsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'inventory' && <LiveInventoryTab />}
            {activeTab === 'menu' && <MenuTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
