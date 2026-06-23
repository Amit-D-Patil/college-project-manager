import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { Settings, ShieldAlert, ToggleLeft, ToggleRight, Check } from 'lucide-react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    setError('');
    setSuccess('');
    const targetStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await API.put(`/admin/users/${user._id}/status`, { status: targetStatus });
      if (res.data.success) {
        setSuccess(`User status updated to: ${targetStatus}`);
        loadUsers();
      }
    } catch (err) {
      setError(err.message || 'Status toggle failed');
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
        <h1 className="text-2xl font-bold text-slate-800">User accounts control</h1>
        <p className="text-sm text-slate-400 mt-1">Manage portal authorization, view profile associations, and activate or suspend credentials</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check size={14} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <ShieldAlert size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Settings size={16} className="text-primary-500" />
          <span>User Accounts Registry</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-500">
            <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Assigned Roles</th>
                <th className="py-2.5 px-3">Active Context</th>
                <th className="py-2.5 px-3">Account Profile</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Suspend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const profileName = u.studentProfile?.name || u.facultyProfile?.name || 'Administrator';
                return (
                  <tr key={u._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-semibold text-slate-800">{u.email}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span key={r} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 uppercase text-[10px] font-extrabold text-primary-600">{u.currentRole}</td>
                    <td className="py-3 px-3 text-slate-500">{profileName}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="text-slate-400 hover:text-primary-600 transition-all ml-auto block"
                        title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {u.status === 'active' ? (
                          <ToggleRight size={22} className="text-primary-600" />
                        ) : (
                          <ToggleLeft size={22} className="text-slate-355" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
