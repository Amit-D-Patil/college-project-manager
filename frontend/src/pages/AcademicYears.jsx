import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { Calendar, Plus, ToggleLeft, ToggleRight, Check } from 'lucide-react';

const AcademicYears = () => {
  const [sessions, setSessions] = useState([]);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadSessions = async () => {
    try {
      const res = await API.get('/admin/academic-years');
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load academic years:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleAddSession = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name) return;

    try {
      const res = await API.post('/admin/academic-years', { name, isActive });
      if (res.data.success) {
        setSuccess('Academic year session configured successfully!');
        setName('');
        setIsActive(false);
        loadSessions();
      }
    } catch (err) {
      setError(err.message || 'Configuration failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Academic Sessions Setup</h1>
        <p className="text-sm text-slate-400 mt-1">Configure academic calendars and toggle the active registration session</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check size={14} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Configure new year */}
        <form onSubmit={handleAddSession} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus size={16} className="text-primary-500" />
            <span>Setup Session</span>
          </h3>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Academic Year</label>
            <input
              type="text"
              placeholder="e.g. 2025-2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-50 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 py-1 cursor-pointer" onClick={() => setIsActive(!isActive)}>
            {isActive ? (
              <ToggleRight className="text-primary-600" size={24} />
            ) : (
              <ToggleLeft className="text-slate-400" size={24} />
            )}
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Set as Active Year</span>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded shadow transition-all mt-4"
          >
            Configure Session
          </button>
        </form>

        {/* Sessions list */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Calendar size={16} className="text-primary-500" />
            <span>Configured Academic Sessions</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Session Name</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-slate-800">{session.name}</td>
                    <td className="py-3 px-3 text-center">
                      {session.isActive ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide">
                          Active Session
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-450 px-2 py-0.5 rounded text-[9px] font-semibold uppercase">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AcademicYears;
