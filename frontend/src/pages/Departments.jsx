import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { Layers, Plus, Check } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadDepts = async () => {
    try {
      const res = await API.get('/admin/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepts();
  }, []);

  const handleAddDept = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name || !code) return;

    try {
      const res = await API.post('/admin/departments', {
        name,
        code: code.trim().toUpperCase(),
      });
      if (res.data.success) {
        setSuccess('Department configured successfully!');
        setName('');
        setCode('');
        loadDepts();
      }
    } catch (err) {
      setError(err.message || 'Department setup failed');
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
        <h1 className="text-2xl font-bold text-slate-800">Departments Config</h1>
        <p className="text-sm text-slate-400 mt-1">Setup college departments and register official code abbreviations</p>
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
        
        {/* Configure new Dept */}
        <form onSubmit={handleAddDept} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Plus size={16} className="text-primary-500" />
            <span>Setup Department</span>
          </h3>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Department Name</label>
            <input
              type="text"
              placeholder="e.g. Computer Science Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Department Code</label>
            <input
              type="text"
              placeholder="e.g. CS"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded shadow transition-all mt-4"
          >
            Configure Department
          </button>
        </form>

        {/* Depts list */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Layers size={16} className="text-primary-500" />
            <span>Active College Departments</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Dept Code</th>
                  <th className="py-2.5 px-3">Department Name</th>
                  <th className="py-2.5 px-3 text-right">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-extrabold text-primary-600 uppercase">{dept.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{dept.name}</td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(dept.createdAt).toLocaleDateString()}
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

export default Departments;
