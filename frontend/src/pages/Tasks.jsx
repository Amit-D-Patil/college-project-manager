import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  CheckSquare,
  PlusCircle,
  Paperclip,
  Clock,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  FolderOpen,
} from 'lucide-react';

const Tasks = () => {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Faculty guide states
  const [guidedGroups, setGuidedGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');
  
  // Assign task form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [taskAttachment, setTaskAttachment] = useState(null);

  // Student deliverable submission states
  const [selectedTask, setSelectedTask] = useState(null);
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Guide evaluation feedback state
  const [evalComment, setEvalComment] = useState('');

  // Feedbacks
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadStudentTasks = async (groupId) => {
    try {
      const res = await API.get(`/tasks/group/${groupId}`);
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load student tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuideData = async () => {
    try {
      // Fetch guide allocated groups
      const res = await API.get('/analytics/dashboard');
      if (res.data.success) {
        setGuidedGroups(res.data.analytics.assignedGroupsCount > 0 ? res.data.analytics.groupAnalytics : []);
        if (res.data.analytics.groupAnalytics?.length > 0) {
          const firstGroupId = res.data.analytics.groupAnalytics[0].groupId;
          setActiveGroupId(firstGroupId);
          await loadStudentTasks(firstGroupId);
        } else {
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to load guide details:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.currentRole === 'student') {
      if (profile?.groupId) {
        loadStudentTasks(profile.groupId._id || profile.groupId);
      } else {
        setLoading(false);
      }
    } else if (user?.currentRole === 'guide') {
      loadGuideData();
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  // Guide switches group filter
  const handleGroupFilterChange = async (e) => {
    const gid = e.target.value;
    setActiveGroupId(gid);
    setLoading(true);
    await loadStudentTasks(gid);
  };

  // Guide assigns task
  const handleAssignTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!activeGroupId) {
      return setError('Please select a student group first');
    }

    const formData = new FormData();
    formData.append('groupId', activeGroupId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('deadline', deadline);
    formData.append('priority', priority);
    if (taskAttachment) formData.append('attachment', taskAttachment);

    try {
      const res = await API.post('/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess('Task assigned to group successfully!');
        setTitle('');
        setDescription('');
        setDeadline('');
        setTaskAttachment(null);
        await loadStudentTasks(activeGroupId);
      }
    } catch (err) {
      setError(err.message || 'Failed to assign task');
    }
  };

  // Student submits deliverable
  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('progressPercentage', '100');
    if (deliverableFile) formData.append('deliverable', deliverableFile);
    if (commentText) formData.append('comment', commentText);

    try {
      const res = await API.put(`/tasks/${selectedTask._id}/progress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess('Deliverable files and comments submitted successfully!');
        setSelectedTask(null);
        setDeliverableFile(null);
        setCommentText('');
        loadStudentTasks(profile.groupId._id || profile.groupId);
      }
    } catch (err) {
      setError(err.message || 'Submission failed');
    }
  };

  // Guide reviews task (approves/rejects/revision requested)
  const handleReviewTask = async (taskId, reviewStatus) => {
    setError('');
    setSuccess('');
    try {
      const res = await API.put(`/tasks/${taskId}/review`, {
        status: reviewStatus,
        comment: evalComment,
      });
      if (res.data.success) {
        setSuccess(`Task marked as ${reviewStatus} successfully!`);
        setEvalComment('');
        loadStudentTasks(activeGroupId);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'high':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'low':
        return 'text-slate-600 bg-slate-50 border-slate-100';
      default:
        return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'revision_requested':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
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
        <h1 className="text-2xl font-bold text-slate-800">Tasks Board & Deliverables</h1>
        <p className="text-sm text-slate-400 mt-1">Assign, track, and review final year project stage milestones</p>
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

      {/* Constraints Check: Student without group */}
      {user.currentRole === 'student' && !profile?.groupId && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 shadow-sm">
          <span>You must form a group and assign a guide to see task boards</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- LEFT: TASK LIST --- */}
        <div className="lg:flex-grow bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <CheckSquare size={16} className="text-primary-500" />
              <span>Assigned Task Checklist</span>
            </h3>

            {/* Guide Group Filter */}
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
            {tasks.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-12">No tasks assigned to this group yet</div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="border border-slate-150 rounded-xl p-5 hover:border-primary-200 hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                      <div className="flex gap-2 mt-1.5 text-[9px] font-bold">
                        <span className={`px-2 py-0.5 border rounded uppercase ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-0.5 border rounded uppercase ${getStatusBadge(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock size={11} /> Due: {new Date(task.deadline).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{task.description}</p>

                  {/* Comments History */}
                  {task.comments.length > 0 && (
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[10px] space-y-2 max-h-32 overflow-y-auto">
                      <span className="font-bold text-slate-400 uppercase tracking-wide">Discussion Logs</span>
                      {task.comments.map((c, idx) => (
                        <div key={idx} className="border-b border-slate-100/50 pb-1.5 last:border-0 last:pb-0">
                          <span className="font-bold text-slate-700">{c.authorName}: </span>
                          <span className="text-slate-600">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submissions & Actions Container */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-50 text-[10px]">
                    
                    {/* Deliverable details */}
                    {task.deliverableUrl ? (
                      <a
                        href={`http://localhost:5000${task.deliverableUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Paperclip size={12} />
                        <span>Submitted File: {task.deliverableName || 'Deliverable'}</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 font-medium italic">No deliverable files uploaded</span>
                    )}

                    {/* Student Submit Trigger */}
                    {user.currentRole === 'student' && task.status !== 'approved' && task.status !== 'completed' && (
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-3 py-1.5 rounded shadow-sm transition-all"
                      >
                        Submit Work
                      </button>
                    )}

                    {/* Guide Review actions */}
                    {user.currentRole === 'guide' && task.status === 'under_review' && (
                      <div className="w-full space-y-3 pt-2">
                        <textarea
                          placeholder="Add evaluation remarks..."
                          rows="2"
                          value={evalComment}
                          onChange={(e) => setEvalComment(e.target.value)}
                          className="w-full bg-slate-50 p-2 border border-slate-200 text-xs rounded focus:bg-white"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleReviewTask(task._id, 'revision_requested')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-3 py-1.5 rounded transition-all"
                          >
                            Reject & Request Revision
                          </button>
                          <button
                            onClick={() => handleReviewTask(task._id, 'approved')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded shadow transition-all"
                          >
                            Approve Deliverable
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- RIGHT: SUBMIT MODAL OR ASSIGN PANEL --- */}
        <div className="lg:w-80 shrink-0">
          
          {/* Guide Assign Tasks Form */}
          {user.currentRole === 'guide' && (
            <form onSubmit={handleAssignTask} className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                <PlusCircle size={16} className="text-primary-500" />
                <span>Assign New Task</span>
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Draft Literature Review Section"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Task Description</label>
                <textarea
                  placeholder="What details are expected?"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-50 text-xs">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Due Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    className="w-full bg-slate-50 text-xs p-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">starter attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => setTaskAttachment(e.target.files[0])}
                  className="w-full bg-slate-50 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-200 file:text-[9px] file:font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg shadow transition-all mt-4"
              >
                Assign Task
              </button>
            </form>
          )}

          {/* Student Deliverable Submission Box */}
          {user.currentRole === 'student' && selectedTask && (
            <form onSubmit={handleSubmitDeliverable} className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white text-xs">Submit Task Deliverables</h3>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-500 hover:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="text-[11px]">
                <span className="text-slate-500 font-bold block uppercase tracking-wider">Submitting for:</span>
                <span className="text-white font-bold text-xs">{selectedTask.title}</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Upload Work File (PDF/Zip)</label>
                <input
                  type="file"
                  onChange={(e) => setDeliverableFile(e.target.files[0])}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-700 file:text-white file:text-[9px] file:font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Progress Remarks</label>
                <textarea
                  placeholder="Explain details of work completed..."
                  rows="3"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-lg shadow-primary-500/10 transition-all mt-4"
              >
                Submit Deliverable
              </button>
            </form>
          )}

          {user.currentRole === 'student' && !selectedTask && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-400 shadow-sm">
              <FolderOpen className="mx-auto text-slate-300 mb-2" size={24} />
              <span>Select a pending task from the left to upload your deliverables.</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Tasks;
