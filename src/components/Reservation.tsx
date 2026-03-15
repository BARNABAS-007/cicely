import { useState, FormEvent } from 'react';
import { Calendar, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Reservation() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    guests: '2',
    date: '',
    time: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const { error } = await supabase.from('reservations').insert([
        {
          name: formData.name,
          phone: formData.phone,
          guests: parseInt(formData.guests),
          date: formData.date,
          time: formData.time,
        },
      ]);

      if (error) throw error;

      setStatus('success');
      setMessage('Your reservation has been submitted successfully! We will confirm shortly.');
      setFormData({
        name: '',
        phone: '',
        guests: '2',
        date: '',
        time: '',
      });
    } catch (error) {
      setStatus('error');
      setMessage('Sorry, there was an error submitting your reservation. Please try again or call us directly.');
      console.error('Reservation error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="reservation" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Reserve Your Table</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Book your dining experience at Cicely. We'll confirm your reservation shortly.
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                pattern="[0-9+\s-]+"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="guests" className="block text-sm font-medium mb-2">
                  <Users className="inline mr-2" size={16} />
                  Guests
                </label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-2">
                  <Clock className="inline mr-2" size={16} />
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
                />
              </div>
            </div>

            {status === 'success' && (
              <div className="flex items-center p-4 bg-green-900 bg-opacity-50 border border-green-700 rounded-md">
                <CheckCircle className="text-green-400 mr-3" size={20} />
                <p className="text-green-100">{message}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex items-center p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-md">
                <AlertCircle className="text-red-400 mr-3" size={20} />
                <p className="text-red-100">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Submitting...' : 'Reserve Table'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
