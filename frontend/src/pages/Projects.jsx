import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import {
  FileCode,
  CheckCircle,
  AlertTriangle,
  FolderOpen,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
} from 'lucide-react';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Reviewing panel selection
  const [selectedProj, setSelectedProj] = useState(null);
  
  // Decision forms states
  const [verdictStatus, setVerdictStatus] = useState('approved');
  const [commentText, setCommentText] = useState('');

  // feedback
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadProjects = async () => {
    try {
      const res = await API.get('/projects/all');
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load projects list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await API.put(`/projects/${selectedProj._id}/status`, {
        status: verdictStatus,
        comment: commentText,
      });

      if (res.data.success) {
        setSuccess(`Verdict saved successfully: Proposal is ${verdictStatus}`);
        setSelectedProj(null);
        setCommentText('');
        loadProjects();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit project decision');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-250';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-250';
      case 'revision_requested':
        return 'bg-amber-50 text-amber-700 border border-amber-250';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Project Proposals registry</h1>
        <p className="text-sm text-slate-400 mt-1">Review and approve student synopsis details and technology stack domains</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Proposals Table */}
        <div className="lg:flex-grow bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <FileCode size={16} className="text-primary-500" />
            <span>Registered Student Proposals</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-3">Project Details</th>
                  <th className="py-3 px-3">Domain</th>
                  <th className="py-3 px-3 text-center">Team Code</th>
                  <th className="py-3 px-3 text-center">allocated guide</th>
                  <th className="py-3 px-3 text-center">Approval Status</th>
                  <th className="py-3 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                      No project proposals submitted in the system
                    </td>
                  </tr>
                ) : (
                  projects.map((proj) => {
                    const group = proj.groupId;
                    const guideName = group?.guideId ? group.guideId.name : 'Unallocated';
                    
                    return (
                      <tr key={proj._id} className="hover:bg-slate-50/50">
                        <td className="py-4 px-3 max-w-xs">
                          <h4 className="font-bold text-slate-800 truncate">{proj.title}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Tech: {proj.technologies.slice(0, 3).join(', ')}</span>
                        </td>
                        <td className="py-4 px-3 font-medium text-slate-600">{proj.domain}</td>
                        <td className="py-4 px-3 text-center font-bold text-slate-700">{group?.groupCode || 'N/A'}</td>
                        <td className="py-4 px-3 text-center text-slate-500 font-semibold">{guideName}</td>
                        <td className="py-4 px-3 text-center">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${getStatusBadge(proj.status)}`}>
                            {proj.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-right">
                          <button
                            onClick={() => setSelectedProj(proj)}
                            className="bg-slate-100 hover:bg-primary-50 hover:text-primary-600 text-slate-600 font-semibold text-[10px] px-2.5 py-1.5 rounded transition-all flex items-center gap-1 ml-auto"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspect/Verdict Panel */}
        {selectedProj && (
          <div className="lg:w-96 bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-4 max-h-[700px] overflow-y-auto shrink-0">
            <div className="flex items-center justify-between border-b border-slate-150 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">synopsis Inspector</h3>
              <button
                onClick={() => setSelectedProj(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-normal">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Proposal Title</span>
                <h4 className="font-bold text-slate-800 text-sm mt-0.5">{selectedProj.title}</h4>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase">domain & technologies</span>
                <p className="font-medium text-slate-700">{selectedProj.domain} ({selectedProj.technologies.join(', ')})</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase">problem statement</span>
                <p className="bg-slate-50 border border-slate-100 rounded p-2 text-[11px] mt-0.5">{selectedProj.problemStatement}</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase">objectives</span>
                <p className="bg-slate-50 border border-slate-100 rounded p-2 text-[11px] mt-0.5">{selectedProj.objectives}</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase">synopsis abstract</span>
                <p className="bg-slate-50 border border-slate-100 rounded p-2 text-[11px] mt-0.5">{selectedProj.abstract}</p>
              </div>

              <div>
                <span className="text-[9px] text-slate-400 font-bold block uppercase">expected outcomes</span>
                <p className="bg-slate-50 border border-slate-100 rounded p-2 text-[11px] mt-0.5">{selectedProj.expectedOutcome}</p>
              </div>

              {/* Form Decision */}
              <form onSubmit={handleDecisionSubmit} className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-4 space-y-4 mt-6 shadow-md">
                <h4 className="font-bold text-white text-xs flex items-center gap-1">
                  <MessageSquare size={13} className="text-primary-400" />
                  <span>Submit Synopsis Decision</span>
                </h4>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Decision Verdict</label>
                  <select
                    value={verdictStatus}
                    onChange={(e) => setVerdictStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded cursor-pointer focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="approved">Approve Proposal</option>
                    <option value="revision_requested">Request Revision Comments</option>
                    <option value="rejected">Reject Proposal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">Feedback Comments</label>
                  <textarea
                    placeholder="Input detailed review comments..."
                    rows="3"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    className="w-full bg-slate-855 border border-slate-700 text-white text-xs p-2 rounded focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2 rounded-lg shadow-lg shadow-primary-500/10 transition-all"
                >
                  Save Decision
                </button>
              </form>
            </div>
          </div>
        )}

        {!selectedProj && (
          <div className="lg:w-80 shrink-0 bg-white border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-400 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <FolderOpen className="text-slate-200 mb-2" size={32} />
            <span>Select a student proposal from the registry list to inspect details and record decisions.</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProjectsList;
