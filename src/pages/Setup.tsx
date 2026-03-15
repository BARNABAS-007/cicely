import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Setup() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const createOwnerAccount = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-owner-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Owner account created successfully! You can now login with admin@cicely.com / demo123');
      } else {
        if (data.error?.message?.includes('already exists')) {
          setStatus('success');
          setMessage('Owner account already exists. You can login with admin@cicely.com / demo123');
        } else {
          setStatus('error');
          setMessage(data.error?.message || 'Failed to create owner account');
        }
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2">Owner Account Setup</h1>
          <p className="text-gray-400 mb-8">Initialize the owner account for the dashboard</p>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-200 text-sm">
              Click the button below to create a demo owner account:
            </p>
            <p className="text-blue-300 text-xs mt-2 font-mono">
              Email: admin@cicely.com<br />
              Password: demo123
            </p>
          </div>

          <button
            onClick={createOwnerAccount}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 mb-6"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating Account...' : 'Create Owner Account'}
          </button>

          {status === 'success' && (
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-200 text-sm">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{message}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-400 text-sm text-center mb-4">
              Ready to login? Go to the owner login page:
            </p>
            <a
              href="/login"
              className="block text-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
