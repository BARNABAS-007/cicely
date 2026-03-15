import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertCircle, CheckCircle, Clock, Trash2, Filter } from 'lucide-react';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
  status: string;
  created_at: string;
}

export default function ReservationsTab() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('reservations')
        .select('*')
        .order('date', { ascending: false });

      if (err) throw err;
      setReservations(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      const { error: err } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);

      if (err) throw err;
      fetchReservations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;

    try {
      const { error: err } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (err) throw err;
      fetchReservations();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredReservations =
    filterStatus === 'all'
      ? reservations
      : reservations.filter((r) => r.status === filterStatus);

  const statuses = {
    pending: { bg: 'bg-yellow-900/20', text: 'text-yellow-400', icon: Clock },
    confirmed: { bg: 'bg-green-900/20', text: 'text-green-400', icon: CheckCircle },
    completed: { bg: 'bg-blue-900/20', text: 'text-blue-400', icon: CheckCircle },
    cancelled: { bg: 'bg-red-900/20', text: 'text-red-400', icon: AlertCircle },
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">Reservations</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="all">All Reservations</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <span className="text-gray-400 text-sm">Total: {filteredReservations.length}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No reservations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Guests</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => {
                  const statusInfo =
                    statuses[reservation.status as keyof typeof statuses] ||
                    statuses.pending;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={reservation.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-white font-medium">{reservation.name}</td>
                      <td className="px-6 py-4 text-gray-300">{reservation.phone}</td>
                      <td className="px-6 py-4 text-gray-300">{reservation.date}</td>
                      <td className="px-6 py-4 text-gray-300">{reservation.time}</td>
                      <td className="px-6 py-4 text-gray-300">{reservation.guests}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="capitalize">{reservation.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={reservation.status}
                            onChange={(e) =>
                              updateReservationStatus(reservation.id, e.target.value)
                            }
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => deleteReservation(reservation.id)}
                            className="p-1 text-red-400 hover:bg-red-900/20 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
