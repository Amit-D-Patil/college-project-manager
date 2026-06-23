import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  FileSpreadsheet,
  PlusCircle,
  Paperclip,
  CheckCircle,
  AlertTriangle,
  History,
  FolderClosed,
} from 'lucide-react';

const DOC_TYPES = [
  { value: 'synopsis', label: 'Project Synopsis' },
  { value: 'SRS', label: 'Software Requirements Specification (SRS)' },
  { value: 'design', label: 'Design Document' },
  { value: 'ppt', label: 'Presentation Slides (PPT)' },
  { value: 'progress_report', label: 'Progress Report' },
  { value: 'final_report', label: 'Final Project Report' },
  { value: 'research_paper', label: 'Research Paper draft' },
  { value: 'poster', label: 'Project Poster' },
  { value: 'manual', label: 'User Operations Manual' },
  { value: 'other', label: 'Other Attachment' },
];

const Documents = () => {
  const { user, profile } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Guide filter states
  const [guidedGroups, setGuidedGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');

  // Upload form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState('synopsis');
  const [docFile, setDocFile] = useState(null);

  // Review states
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [remarks, setRemarks] = useState('');

  // Version history toggles
  const [showHistoryMap, setShowHistoryMap] = useState({});

  // feedback
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadGroupDocuments = async (groupId) => {
    try {
      const res = await API.get(`/documents/group/${groupId}`);
      if (res.data.success) {
        setDocuments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuideData = async () => {
    try {
      const res = await API.get('/analytics/dashboard');
      if (res.data.success) {
        setGuidedGroups(res.data.analytics.assignedGroupsCount > 0 ? res.data.analytics.groupAnalytics : []);
        if (res.data.analytics.groupAnalytics?.length > 0) {
          const firstGroupId = res.data.analytics.groupAnalytics[0].groupId;
          setActiveGroupId(firstGroupId);
          await loadGroupDocuments(firstGroupId);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to load guide metadata:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.currentRole === 'student') {
      if (profile?.groupId) {
        loadGroupDocuments(profile.groupId._id || profile.groupId);
      } else {
        setLoading(false);
      }
    } else if (user?.currentRole === 'guide') {
      loadGuideData();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  const handleGroupFilterChange = async (e) => {
    const gid = e.target.value;
    setActiveGroupId(gid);
    setLoading(true);
    await loadGroupDocuments(gid);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!docFile) {
      return setError('Please choose a document file to upload');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('type', type);
    formData.append('file', docFile);

    try {
      const res = await API.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess('Document version uploaded and sent to Guide for review!');
        setTitle('');
        setType('synopsis');
        setDocFile(null);
        loadGroupDocuments(profile.groupId._id || profile.groupId);
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await API.put(`/documents/${selectedDoc._id}/status`, {
        status: reviewStatus,
        remarks: remarks,
      });

      if (res.data.success) {
        setSuccess(`Document marked as ${reviewStatus} successfully!`);
        setSelectedDoc(null);
        setRemarks('');
        loadGroupDocuments(activeGroupId);
      }
    } catch (err) {
      setError(err.message || 'Failed to review document');
    }
  };

  const toggleHistory = (docId) => {
    setShowHistoryMap((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'revision_requested':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Document Management & Versions</h1>
        <p className="text-sm text-slate-400 mt-1">Upload and review final project documentation, SRS, manuals, and code poster attachments</p>
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

      {/* Constraints check */}
      {user.currentRole === 'student' && !profile?.groupId && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 shadow-sm">
          <span>You must form a group and assign a guide to see documents repository</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- LEFT: DOCUMENTS DIRECTORY --- */}
        <div className="lg:flex-grow bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <FileSpreadsheet size={16} className="text-primary-500" />
              <span>Project Documents</span>
            </h3>

            {/* Guide Filter */}
            {user.currentRole === 'guide' && guidedGroups.length > 0 && (
              <select
                value={activeGroupId}
                onChange={handleGroupFilterChange}
                className="bg-slate-50 border border-slate-200 text-[10px] p-1.5"
              >
                {guidedGroups.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    Group {g.groupCode}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-12">No documents uploaded yet</div>
            ) : (
              documents.map((doc) => (
                <div key={doc._id} className="border border-slate-150 rounded-xl p-5 space-y-3 hover:border-primary-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{doc.title}</h4>
                      <div className="flex gap-2 mt-1.5 text-[9px] font-bold">
                        <span className="bg-primary-50 border border-primary-100 text-primary-600 px-2 py-0.5 rounded uppercase">
                          {doc.type.toUpperCase()}
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          Version {doc.version}
                        </span>
                        <span className={`px-2 py-0.5 border rounded uppercase ${getStatusBadge(doc.status)}`}>
                          {doc.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`http://localhost:5000${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-50 hover:bg-primary-50 border border-slate-200 hover:border-primary-200 text-slate-600 hover:text-primary-600 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Paperclip size={11} />
                      <span>Download Latest File</span>
                    </a>
                  </div>

                  {doc.remarks && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded p-2 italic leading-relaxed">
                      Remarks: "{doc.remarks}"
                    </p>
                  )}

                  {/* Version History Toggle Button */}
                  {doc.versionHistory?.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleHistory(doc._id)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold flex items-center gap-1 transition-all"
                      >
                        <History size={12} />
                        <span>{showHistoryMap[doc._id] ? 'Hide Version History' : `Show Version History (${doc.versionHistory.length} previous versions)`}</span>
                      </button>

                      {showHistoryMap[doc._id] && (
                        <div className="mt-2.5 border-t border-slate-50 pt-2 space-y-2">
                          {doc.versionHistory.map((v, index) => (
                            <div key={index} className="bg-slate-50 border border-slate-100/70 p-2.5 rounded text-[10px] flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-700">v{v.version}</span>
                                <span className="text-slate-400 font-medium ml-2">Uploaded: {new Date(v.createdAt).toLocaleDateString()}</span>
                                {v.remarks && <p className="italic text-slate-500 mt-1">Remarks: "{v.remarks}"</p>}
                              </div>
                              <a
                                href={`http://localhost:5000${v.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 font-bold hover:underline"
                              >
                                Download v{v.version}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Guide Review Button */}
                  {user.currentRole === 'guide' && doc.status === 'pending' && (
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-[10px] px-3 py-1.5 rounded shadow transition-all block"
                    >
                      Review & Grade Status
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT: ACTIONS PANEL --- */}
        <div className="lg:w-80 shrink-0">
          {/* Student Upload Form */}
          {user.currentRole === 'student' && (
            <form onSubmit={handleUpload} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <PlusCircle size={16} className="text-primary-500" />
                <span>Upload New Document</span>
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Group 12 SRS Document Draft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Document Category</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 text-xs">
                  {DOC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Choose File</label>
                <input
                  type="file"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  required
                  className="w-full bg-slate-50 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-200 file:text-[9px] file:font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg shadow transition-all mt-4"
              >
                Upload Version
              </button>
            </form>
          )}

          {/* Guide Review Panel */}
          {user.currentRole === 'guide' && selectedDoc && (
            <form onSubmit={handleReviewSubmit} className="bg-slate-900 text-slate-350 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white text-xs">Submit Document Review</h3>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="text-[10px] leading-relaxed">
                <span className="text-slate-500 font-bold block uppercase tracking-wider">Reviewing for:</span>
                <span className="text-white font-bold">{selectedDoc.title} (v{selectedDoc.version})</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Review Verdict</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded cursor-pointer"
                >
                  <option value="approved">Approve Document</option>
                  <option value="revision_requested">Request Revision / Remarks</option>
                  <option value="rejected">Reject Proposal</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Remarks & Corrections</label>
                <textarea
                  placeholder="Input detailed corrections instructions here..."
                  rows="4"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white text-xs p-2 rounded"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-lg shadow-primary-500/10 transition-all mt-4"
              >
                Submit Review Status
              </button>
            </form>
          )}

          {user.currentRole === 'guide' && !selectedDoc && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-400 shadow-sm">
              <FolderClosed className="mx-auto text-slate-300 mb-2" size={24} />
              <span>Select a pending document from the left directory to submit review evaluations.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Documents;
