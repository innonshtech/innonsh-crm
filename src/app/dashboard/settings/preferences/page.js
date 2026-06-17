'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Settings, 
  Clock, 
  Calendar, 
  Save, 
  Loader2, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Settings states
  const [leadInactivityDays, setLeadInactivityDays] = useState(7);
  const [followUpOverdueDays, setFollowUpOverdueDays] = useState(0);

  const [toastMessage, setToastMessage] = useState({ text: '', type: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage({ text: '', type: '' });
    }, 4000);
  };

  useEffect(() => {
    async function loadPreferences() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.user.role !== 'owner') {
            setErrorMsg('Only organization owners can access system thresholds settings.');
            setLoading(false);
            return;
          }
          setIsAdmin(true);

          const settingsRes = await fetch('/api/tenant/settings');
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            if (settingsData.success && settingsData.settings) {
              setLeadInactivityDays(settingsData.settings.leadInactivityDays);
              setFollowUpOverdueDays(settingsData.settings.followUpOverdueDays);
            }
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
        setErrorMsg('Failed to load organization settings.');
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadInactivityDays: Number(leadInactivityDays),
          followUpOverdueDays: Number(followUpOverdueDays)
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('🎉 Preferences saved successfully!');
      } else {
        showToast(data.error || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      showToast('Network error while saving settings.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-xs text-slate-400 font-bold">Retrieving custom preferences...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-black text-slate-800">Access Denied</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-semibold">{errorMsg}</p>
        <button
          onClick={() => router.push('/dashboard/settings')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer font-bold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative h-full max-w-3xl">
      {/* Floating Toast Notification */}
      {toastMessage.text && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3.5 rounded-xl border shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top duration-300 ${
          toastMessage.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-250 text-emerald-800'
        }`}>
          <CheckCircle className="h-4.5 w-4.5" />
          <span className="text-xs font-black tracking-wide">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition cursor-pointer font-bold mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7 text-emerald-500" />
            Thresholds & Preferences
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Configure default settings for lead inactivity tags and overdue follow-up alerts.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50 space-y-6">
        
        {/* Lead Inactivity Preferences */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Clock className="h-5 w-5 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Lead Inactivity Limit</h3>
          </div>
          <p className="text-xs text-slate-450 leading-relaxed font-semibold">
            Define the number of days of no activity (no edits or updates to the lead profile) before a lead is flagged with the ⏳ **Inactive** alert in the directory.
          </p>
          <div className="max-w-xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Inactivity Limit (in days)</label>
            <input
              type="number"
              min="1"
              max="365"
              required
              value={leadInactivityDays}
              onChange={(e) => setLeadInactivityDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-slate-800 font-bold transition"
            />
          </div>
        </div>

        {/* Follow-up Overdue Preferences */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Calendar className="h-5 w-5 text-teal-500" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Follow-up Overdue Grace Period</h3>
          </div>
          <p className="text-xs text-slate-455 leading-relaxed font-semibold">
            Define the grace period (in days) allowed for follow-ups before they are marked as **Overdue**. Set to `0` to instantly flag any follow-up as overdue once its scheduled time passes.
          </p>
          <div className="max-w-xs">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Grace Period (in days)</label>
            <input
              type="number"
              min="0"
              max="90"
              required
              value={followUpOverdueDays}
              onChange={(e) => setFollowUpOverdueDays(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:outline-none text-xs text-slate-800 font-bold transition"
            />
          </div>
        </div>

        {/* Actions panel */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-150">
          <button
            type="button"
            onClick={() => router.push('/dashboard/settings')}
            className="px-4 py-2 text-xs font-bold hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-white text-xs font-bold rounded-lg shadow-md transition cursor-pointer"
          >
            {saveLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Save className="h-4.5 w-4.5" />
            )}
            Save Configuration Settings
          </button>
        </div>
      </form>
    </div>
  );
}
