import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  Bell,
  PlusCircle,
  Trash2,
  Paperclip,
  CheckCircle,
  AlertOctagon,
  Info,
  Calendar,
} from 'lucide-react';

const NoticeBoard = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board'); // 'board' or 'publish'
  
  // Publish form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [targetAudience, setTargetAudience] = useState('all');
  const [expiryDate, setExpiryDate] = useState('');
  const [attachment, setAttachment] = useState(null);

  // feedback
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadNotices = async () => {
    try {
      const res = await API.get('/notices');
      if (res.data.success) {
        setNotices(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [user]);

  const handlePublish = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('type', type);
    formData.append('targetAudience', targetAudience);
    if (expiryDate) formData.append('expiryDate', expiryDate);
    if (attachment) formData.append('attachment', attachment);

    try {
      const res = await API.post('/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess('Notice published successfully and alerts broadcasted!');
        setTitle('');
        setContent('');
        setType('general');
        setTargetAudience('all');
        setExpiryDate('');
        setAttachment(null);
        loadNotices();
        setActiveTab('board');
      }
    } catch (err) {
      setError(err.message || 'Failed to publish notice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await API.delete(`/notices/${id}`);
      if (res.data.success) {
        setSuccess('Notice deleted successfully.');
        loadNotices();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete notice');
    }
  };

  const getNoticeBadge = (type) => {
    switch (type) {
      case 'emergency':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'review':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'viva':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'submission':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const canPublish = ['coordinator', 'hod', 'principal'].includes(user?.currentRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Department Notice Board</h1>
          <p className="text-sm text-slate-400 mt-1">Compliance announcements, calendar notices, and semester submission deadlines</p>
        </div>

        {canPublish && (
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('board')}
              className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${
                activeTab === 'board' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Notice Feed
            </button>
            <button
              onClick={() => setActiveTab('publish')}
              className={`text-xs font-bold px-3 py-1.5 rounded transition-all flex items-center gap-1 ${
                activeTab === 'publish' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              <PlusCircle size={12} />
              <span>Draft Notice</span>
            </button>
          </div>
        )}
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertOctagon size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* --- FEED VIEW --- */}
      {activeTab === 'board' ? (
        <div className="space-y-4">
          {notices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400 font-medium shadow-sm">
              <Bell className="mx-auto text-slate-300 mb-2" size={32} />
              <span>No active notices found in your feed</span>
            </div>
          ) : (
            notices.map((n) => (
              <div
                key={n._id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3 relative hover:border-primary-200 hover:shadow transition-all"
              >
                {/* Delete button (Coordinator/Author only) */}
                {canPublish && (
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-rose-600 transition-all"
                    title="Delete Notice"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wide ${getNoticeBadge(n.type)}`}>
                    {n.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Published by: <span className="font-bold text-slate-600">{n.authorId?.email || 'Admin'}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800">{n.title}</h3>
                
                {/* Notice text */}
                <div
                  className="text-xs text-slate-600 leading-relaxed max-w-2xl font-normal"
                  dangerouslySetInnerHTML={{ __html: n.content }}
                ></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    <span>Posted: {new Date(n.createdAt).toLocaleDateString()}</span>
                    {n.expiryDate && (
                      <span className="text-amber-500 font-semibold">
                        • Deadline: {new Date(n.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {n.attachmentUrl && (
                    <a
                      href={`http://localhost:5000${n.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-50 hover:bg-primary-50 text-slate-600 hover:text-primary-600 border border-slate-200 hover:border-primary-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Paperclip size={12} />
                      <span>Download Attachment ({n.attachmentName || 'PDF'})</span>
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* --- PUBLISH FORM VIEW --- */
        <form onSubmit={handlePublish} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <PlusCircle size={16} className="text-primary-500" />
            <span>Compose New Announcement Notice</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Notice Header Title</label>
              <input
                type="text"
                placeholder="e.g. Final Review Viva Schedule EXTC"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Notice Category</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-slate-50 text-xs">
                <option value="general">General Notice</option>
                <option value="review">Review Notice</option>
                <option value="viva">Viva Notice</option>
                <option value="submission">Submission Notice</option>
                <option value="emergency">Emergency Alert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Target Audience</label>
              <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="w-full bg-slate-50 text-xs">
                <option value="all">All Stakeholders</option>
                <option value="students">Students Only</option>
                <option value="guides">Faculty Guides Only</option>
                <option value="coordinators">Coordinators Only</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Expiry / Deadline Date (Optional)</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Announcements Content (HTML formatting allowed)</label>
            <textarea
              placeholder="Enter announcement body text here..."
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Attachment File (PDF, Images)</label>
            <input
              type="file"
              onChange={(e) => setAttachment(e.target.files[0])}
              className="w-full bg-slate-50 text-xs file:mr-4 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-slate-200 file:text-[10px] file:font-bold hover:file:bg-slate-300"
            />
          </div>

          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow transition-all mt-4"
          >
            Publish Notice
          </button>
        </form>
      )}
    </div>
  );
};

export default NoticeBoard;
