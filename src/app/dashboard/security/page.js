'use client';
import { useState } from 'react';

export default function SecuritySettingsPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  const handleToggleMfa = () => {
    // Placeholder for real MFA setup flow
    setMfaEnabled(!mfaEnabled);
  };

  const handleLogoutAll = async () => {
    if (confirm('Are you sure you want to log out of all other devices? You will be signed out everywhere except here.')) {
      alert('All other sessions terminated successfully.');
      // Placeholder for actual API call to clear sessions
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8 border-b border-slate-200 pb-4">
        Enterprise Security
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* MFA Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">🛡️</span>
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Add an extra layer of security to your account. When enabled, you'll need to enter a time-sensitive code from your authenticator app when signing in.
            </p>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <span className="block font-semibold text-slate-700">Authenticator App</span>
                <span className={`text-xs font-bold ${mfaEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {mfaEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button 
                onClick={handleToggleMfa}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                  mfaEnabled 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                }`}
              >
                {mfaEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* Active Sessions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 p-2 rounded-lg">💻</span>
              Active Sessions
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Review and manage the devices currently logged into your account. If you see an unfamiliar device, log out of all sessions immediately.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="block font-semibold text-slate-800 text-sm">Windows PC - Chrome</span>
                  <span className="text-xs text-slate-500">IP: 192.168.1.1 • Active Now</span>
                </div>
                <span className="text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">Current</span>
              </div>
              
              <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between opacity-75">
                <div>
                  <span className="block font-semibold text-slate-700 text-sm">iPhone 14 - Safari</span>
                  <span className="text-xs text-slate-400">IP: 10.0.0.45 • Last active 2 hours ago</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleLogoutAll}
              className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Log out of all other devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
