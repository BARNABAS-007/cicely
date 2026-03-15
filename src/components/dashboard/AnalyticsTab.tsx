import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Calendar, TrendingUp, CheckCircle } from 'lucide-react';

export default function AnalyticsTab() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    totalGuests: 0,
    avgGuestsPerReservation: 0,
    upcomingCount: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await supabase.from('reservations').select('*');

      if (data) {
        const today = new Date().toISOString().split('T')[0];
        const upcoming = data.filter((r) => r.date >= today);
        const pending = data.filter((r) => r.status === 'pending');
        const confirmed = data.filter((r) => r.status === 'confirmed');
        const totalGuests = data.reduce((sum, r) => sum + r.guests, 0);

        setStats({
          totalReservations: data.length,
          pendingReservations: pending.length,
          confirmedReservations: confirmed.length,
          totalGuests,
          avgGuestsPerReservation:
            data.length > 0 ? Math.round(totalGuests / data.length * 10) / 10 : 0,
          upcomingCount: upcoming.length,
        });
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const cards = [
    {
      title: 'Total Reservations',
      value: stats.totalReservations,
      icon: Calendar,
      color: 'bg-blue-900/20 text-blue-400',
    },
    {
      title: 'Pending',
      value: stats.pendingReservations,
      icon: TrendingUp,
      color: 'bg-yellow-900/20 text-yellow-400',
    },
    {
      title: 'Confirmed',
      value: stats.confirmedReservations,
      icon: CheckCircle,
      color: 'bg-green-900/20 text-green-400',
    },
    {
      title: 'Total Guests',
      value: stats.totalGuests,
      icon: Users,
      color: 'bg-orange-900/20 text-orange-400',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`${card.color} rounded-lg p-6 border border-gray-700 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-2">{card.title}</p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <Icon className="w-8 h-8 opacity-40" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <span className="text-gray-400">Avg Guests per Reservation</span>
              <span className="text-2xl font-bold text-orange-400">
                {stats.avgGuestsPerReservation}
              </span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-700">
              <span className="text-gray-400">Upcoming Reservations</span>
              <span className="text-2xl font-bold text-blue-400">
                {stats.upcomingCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Confirmation Rate</span>
              <span className="text-2xl font-bold text-green-400">
                {stats.totalReservations > 0
                  ? Math.round(
                      (stats.confirmedReservations / stats.totalReservations) * 100
                    )
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Reservation Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-gray-400">Confirmed</span>
              </div>
              <span className="font-semibold text-white">{stats.confirmedReservations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-gray-400">Pending</span>
              </div>
              <span className="font-semibold text-white">{stats.pendingReservations}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
