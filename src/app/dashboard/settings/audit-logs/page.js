'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Loader2, Calendar, User, Activity, AlertCircle, Terminal } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/tenant/audit-logs?limit=50');
      if (!res.ok) {
        if (res.status === 403) throw new Error('Forbidden. Only Owners can view audit logs.');
        throw new Error('Failed to fetch audit logs');
      }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-2" />
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Terminal className="h-5 w-5 text-indigo-500" />
            Security Audit Logs
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Immutable record of critical actions taken within your organization.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm"
        >
          Refresh Logs
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldAlert className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-600">No logs found</p>
            <p className="text-xs mt-1">Security events will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {log.users ? log.users.name : 'System'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-100 font-mono text-[10px] uppercase font-bold tracking-wider">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[10px] text-slate-500 font-mono max-w-xs truncate" title={JSON.stringify(log.details)}>
                        {log.resource_type ? `[${log.resource_type}] ` : ''}
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap font-mono text-[10px] text-slate-400">
                      {log.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
