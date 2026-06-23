import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import {
  Layers,
  Sparkles,
  Users,
  AlertTriangle,
  UserCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

const GuideAllocation = () => {
  const [guides, setGuides] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection map for manual allocation
  const [selectedGuideMap, setSelectedGuideMap] = useState({});
  
  // Auto-allocation log modal
  const [autoLog, setAutoLog] = useState(null);
  const [allocating, setAllocating] = useState(false);

  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      const guidesRes = await API.get('/guides/workload');
      const projectsRes = await API.get('/projects/all'); // fetching projects yields group info
      const groupsRes = await API.get('/groups/my-group'); // stub/query endpoints

      if (guidesRes.data.success) {
        setGuides(guidesRes.data.data);
      }
      
      // Let's query all groups directly
      const allGroupsRes = await API.get('/projects/all');
      if (allGroupsRes.data.success) {
        // Group data derived from projects
        setGroups(allGroupsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load allocations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualAllocate = async (groupId) => {
    setError('');
    setSuccess('');
    const guideId = selectedGuideMap[groupId];
    if (!guideId) {
      return setError('Please select a guide to allocate');
    }

    try {
      const res = await API.post('/guides/allocate/manual', { groupId, guideId });
      if (res.data.success) {
        setSuccess(res.data.message);
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Manual allocation failed');
    }
  };

  const handleAutoAllocate = async () => {
    setError('');
    setSuccess('');
    setAllocating(true);
    try {
      const res = await API.post('/guides/allocate/auto');
      if (res.data.success) {
        setSuccess(res.data.message);
        setAutoLog(res.data.log || []);
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Auto allocation failed');
    } finally {
      setAllocating(false);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Guide Allocation</h1>
          <p className="text-sm text-slate-400 mt-1">Allocate guides to student groups based on workload and domain expertise</p>
        </div>
        
        <button
          onClick={handleAutoAllocate}
          disabled={allocating}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 self-start sm:self-center"
        >
          <Sparkles size={14} className="text-amber-400" />
          <span>{allocating ? 'Running algorithm...' : 'Auto-Allocate Guides'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}

      {/* Auto Allocation Logs Modal */}
      {autoLog && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-300 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Auto Allocation Matching Logs</h3>
            <button onClick={() => setAutoLog(null)} className="text-slate-500 hover:text-slate-300 text-xs font-bold">Close Log</button>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-400">
            {autoLog.map((logLine, idx) => (
              <div key={idx} className="border-b border-slate-800 py-1">
                {logLine}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Guides Workload table */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Users size={16} className="text-primary-500" />
            <span>Guide Workloads</span>
          </h3>

          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
            {guides.map((guide) => {
              const capacityPercent = Math.min(100, Math.round((guide.allocatedGroupsCount / guide.maxLoad) * 100));
              return (
                <div key={guide._id} className="border border-slate-100 rounded-lg p-3 space-y-2 text-xs hover:bg-slate-50/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800">{guide.name}</h4>
                      <span className="text-[10px] text-slate-400">{guide.designation}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      guide.allocatedGroupsCount >= guide.maxLoad
                        ? 'bg-rose-50 text-rose-700 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {guide.allocatedGroupsCount} / {guide.maxLoad} Groups
                    </span>
                  </div>

                  {/* Specialization tags */}
                  <div className="flex flex-wrap gap-1">
                    {guide.specialization.map((spec) => (
                      <span key={spec} className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Workload progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        capacityPercent >= 100
                          ? 'bg-rose-500'
                          : capacityPercent >= 75
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Groups Allocation status */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Layers size={16} className="text-primary-500" />
            <span>Groups Allocation Registry</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Team Code</th>
                  <th className="py-2.5 px-3">Project Domain</th>
                  <th className="py-2.5 px-3">Members</th>
                  <th className="py-2.5 px-3">Assigned Guide</th>
                  <th className="py-2.5 px-3 text-right">Manual Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                      No project groups registered in the system
                    </td>
                  </tr>
                ) : (
                  groups.map((proj) => {
                    const group = proj.groupId;
                    if (!group) return null;
                    const isAllocated = !!group.guideId;

                    return (
                      <tr key={proj._id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <h4 className="font-bold text-slate-800">{group.groupCode}</h4>
                          <span className="text-[9px] text-slate-400 block truncate max-w-[150px]">{proj.title}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="bg-primary-50 border border-primary-100 text-primary-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            {proj.domain}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-[10px] space-y-0.5">
                            {group.members.map((m) => (
                              <div key={m._id} className="font-medium text-slate-600">{m.name}</div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {isAllocated ? (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              <UserCheck size={12} /> {group.guideId.name}
                            </span>
                          ) : (
                            <span className="text-amber-500 flex items-center gap-0.5">
                              <AlertTriangle size={12} /> Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <select
                              value={selectedGuideMap[group._id] || ''}
                              onChange={(e) => setSelectedGuideMap({ ...selectedGuideMap, [group._id]: e.target.value })}
                              className="bg-slate-50 border border-slate-200 text-[10px] p-1.5"
                            >
                              <option value="">Select Guide</option>
                              {guides
                                .filter((g) => g.allocatedGroupsCount < g.maxLoad)
                                .map((g) => (
                                  <option key={g._id} value={g._id}>
                                    {g.name} ({g.allocatedGroupsCount} Load)
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleManualAllocate(group._id)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] px-2 py-1.5 rounded transition-all"
                            >
                              Map
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GuideAllocation;
