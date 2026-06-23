import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Users,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Bell,
  BookOpen,
  Award,
} from 'lucide-react';

const COLORS = ['#3f75ad', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.currentRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- 1. STUDENT DASHBOARD VIEW ---
  if (user?.currentRole === 'student') {
    const { inGroup, groupDetails, tasksOverview, reviewsRecorded, activeNotices } = data || {};

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track your final year project progress</p>
        </div>

        {/* Not in group prompt */}
        {!inGroup && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-500 shrink-0" size={28} />
              <div>
                <h4 className="font-bold text-amber-800 text-sm">Group Not Formed Yet</h4>
                <p className="text-xs text-amber-700 mt-1">You must create a group or join an existing group before starting registration.</p>
              </div>
            </div>
            <a
              href="/group"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shrink-0 shadow transition-all"
            >
              Go to Group Board
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Group and Project Overview */}
          <div className="lg:col-span-2 space-y-6">
            {inGroup && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm">Project Details</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                    groupDetails?.projectId?.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {groupDetails?.projectId?.status || 'Proposal Draft'}
                  </span>
                </div>

                <div>
                  <h2 className="font-bold text-lg text-slate-800">
                    {groupDetails?.projectId?.title || 'No Project Registered Yet'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Domain: <span className="font-semibold text-slate-600">{groupDetails?.projectId?.domain || 'N/A'}</span>
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Group Code</span>
                    <span className="text-sm font-semibold text-slate-700">{groupDetails?.groupCode}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Division</span>
                    <span className="text-sm font-semibold text-slate-700">Div {groupDetails?.division}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Guide</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {groupDetails?.guideId ? `Prof. ${groupDetails.guideId.name}` : 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
                    <span>Task Completion Progress</span>
                    <span>
                      {tasksOverview?.total > 0
                        ? Math.round((tasksOverview.completed / tasksOverview.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          tasksOverview?.total > 0
                            ? (tasksOverview.completed / tasksOverview.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Scorecard */}
            {inGroup && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Milestone Reviews Scorecard</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-500">
                    <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-3">Review</th>
                        <th className="py-2.5 px-3 text-center">Score</th>
                        <th className="py-2.5 px-3">Remarks</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reviewsRecorded?.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-slate-400 font-medium">
                            No milestone reviews recorded yet
                          </td>
                        </tr>
                      ) : (
                        reviewsRecorded.map((rev) => (
                          <tr key={rev._id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 font-semibold text-slate-700">{rev.reviewNumber}</td>
                            <td className="py-3 px-3 text-center font-bold text-primary-600">
                              {rev.totalMarks} / {rev.maxMarks}
                            </td>
                            <td className="py-3 px-3 text-slate-600 truncate max-w-[200px]">{rev.remarks || '-'}</td>
                            <td className="py-3 px-3">{new Date(rev.date).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Quick Task Stats */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-center">
                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                <span className="text-2xl font-bold text-emerald-800">{tasksOverview?.completed}</span>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">Completed</p>
              </div>
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 text-center">
                <Clock className="text-primary-500 mx-auto mb-2" size={24} />
                <span className="text-2xl font-bold text-primary-800">{tasksOverview?.pending}</span>
                <p className="text-[10px] text-primary-600 font-bold uppercase tracking-wider mt-1">Pending Tasks</p>
              </div>
            </div>

            {/* Notices Board */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <Bell size={18} className="text-primary-500" />
                <span>Recent Notice Board</span>
              </h3>
              <div className="space-y-3.5">
                {activeNotices?.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-6">No recent notices posted</div>
                ) : (
                  activeNotices.map((n) => (
                    <div key={n._id} className="border-l-2 border-primary-500 pl-3 py-0.5 text-xs">
                      <h4 className="font-semibold text-slate-700 hover:underline cursor-pointer">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Expiry: {n.expiryDate ? new Date(n.expiryDate).toLocaleDateString() : 'Active'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. FACULTY/GUIDE DASHBOARD VIEW ---
  if (user?.currentRole === 'guide') {
    const { workload, assignedGroupsCount, groupAnalytics } = data || {};

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Faculty Guide Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Overview of your allocated project groups and review checkpoints</p>
          </div>
          
          {/* Workload Capacity badge */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
            <div className="bg-primary-50 p-2.5 rounded-lg text-primary-600">
              <Users size={22} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Workload</span>
              <span className="text-base font-bold text-slate-800">
                {workload?.active} / {workload?.max} Groups
              </span>
            </div>
          </div>
        </div>

        {/* Assigned groups table list */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Assigned Project Groups</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Group Code</th>
                  <th className="py-3 px-4">Project Title</th>
                  <th className="py-3 px-4 text-center">Members Count</th>
                  <th className="py-3 px-4 text-center">Progress Percentage</th>
                  <th className="py-3 px-4 text-center">Reviews Completed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupAnalytics?.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                      No project groups have been allocated to you yet.
                    </td>
                  </tr>
                ) : (
                  groupAnalytics.map((g) => (
                    <tr key={g.groupId} className="hover:bg-slate-50/50">
                      <td className="py-4 px-4 font-bold text-slate-800">{g.groupCode}</td>
                      <td className="py-4 px-4 font-medium text-slate-700 max-w-sm truncate">{g.projectTitle}</td>
                      <td className="py-4 px-4 text-center">{g.membersCount} Students</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary-500 h-full" style={{ width: `${g.progressPercentage}%` }}></div>
                          </div>
                          <span className="font-semibold text-slate-600 text-[10px]">{g.progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-primary-50 border border-primary-100 text-primary-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {g.reviewsCount} / 5
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/tasks?groupId=${g.groupId}`}
                            className="bg-slate-100 hover:bg-primary-50 hover:text-primary-600 text-slate-600 font-semibold px-2.5 py-1.5 rounded transition-all text-[11px]"
                          >
                            Assign Task
                          </a>
                          <a
                            href={`/reviews?groupId=${g.groupId}`}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-2.5 py-1.5 rounded shadow-sm transition-all text-[11px]"
                          >
                            Grade
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. COORDINATOR / HOD / PRINCIPAL DASHBOARD VIEW ---
  if (user?.currentRole === 'coordinator' || user?.currentRole === 'hod' || user?.currentRole === 'principal') {
    const {
      totalStudents,
      totalGroups,
      totalProjects,
      projectStates,
      domainDistribution,
      guideDistribution,
      pendingAllocations,
      overdueTasks,
      avgReviewsPerGroup,
      departmentName,
    } = data || {};

    // Map chart data
    const pieData = projectStates?.map((p, idx) => ({
      name: p._id.charAt(0).toUpperCase() + p._id.slice(1),
      value: p.count,
    })) || [];

    const barData = domainDistribution?.map((d) => ({
      domain: d._id.substring(0, 15) + '...',
      Projects: d.count,
    })) || [];

    const guideBarData = guideDistribution?.map((g) => ({
      name: g.name.replace('Prof. ', '').replace('Dr. ', ''),
      Allocated: g.allocatedGroupsCount,
      Limit: g.maxLoad,
    })) || [];

    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {user.currentRole === 'coordinator' ? 'Project Coordinator Dashboard' : user.currentRole === 'hod' ? 'HOD Analytics Hub' : 'Principal Analytics Hub'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Campus: {departmentName} | Academic Session 2025-2026
            </p>
          </div>
        </div>

        {/* Aggregates Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="bg-blue-50 text-blue-600 p-3.5 rounded-lg">
              <Users size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Students</span>
              <span className="text-2xl font-extrabold text-slate-800">{totalStudents}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-lg">
              <BookOpen size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Teams</span>
              <span className="text-2xl font-extrabold text-slate-800">{totalGroups}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3.5 rounded-lg">
              <FileCode size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Proposals</span>
              <span className="text-2xl font-extrabold text-slate-800">{totalProjects}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex items-center gap-4">
            <div className="bg-rose-50 text-rose-600 p-3.5 rounded-lg">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Allocations</span>
              <span className="text-2xl font-extrabold text-rose-800">{pendingAllocations}</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Domain Distribution */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Project Domains Count</h3>
            <div className="h-64">
              {barData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No project domains registered</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ bottom: 15 }}>
                    <XAxis dataKey="domain" tick={{ fontSize: 9 }} interval={0} angle={-30} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Projects" fill="#3f75ad" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Guide Workloads */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Faculty Workload (Current vs Limit)</h3>
            <div className="h-64">
              {guideBarData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">No faculty guides setup</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={guideBarData}>
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="Allocated" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Limit" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Project Proposal Status */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Proposals Status</h3>
            <div className="h-64 flex flex-col items-center justify-center">
              {pieData.length === 0 ? (
                <span className="text-xs text-slate-400">No registered projects to map</span>
              ) : (
                <div className="w-full h-full relative">
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold text-slate-500 absolute bottom-0 left-0 right-0">
                    {pieData.map((entry, index) => (
                      <span key={entry.name} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {entry.name} ({entry.value})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Warning / Notification log summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3">NBA / NAAC Compliance Summary</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span>Average Milestone Reviews per Team:</span>
                <span className="font-bold text-slate-800">{avgReviewsPerGroup} / 5</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span>Incomplete/Overdue Student Tasks:</span>
                <span className={`font-bold ${overdueTasks > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{overdueTasks}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Unallocated Groups (Requires Guide):</span>
                <span className={`font-bold ${pendingAllocations > 0 ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>{pendingAllocations}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3">
                <Award size={18} className="text-amber-400" />
                <span>NBA & AICTE Audits</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The reports module provides printable formatted PDF summaries of student evaluations, rubrics performance indicators, and guide distribution ratios ready to attach to department audit profiles.
              </p>
            </div>
            <a
              href="/reports"
              className="mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2.5 rounded-lg text-center shadow-lg shadow-primary-500/20 transition-all"
            >
              Access Reports Center
            </a>
          </div>
        </div>

      </div>
    );
  }

  // --- 4. ADMIN DASHBOARD VIEW ---
  if (user?.currentRole === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Control Panel</h1>
          <p className="text-sm text-slate-400 mt-1">Configure systemic parameters, academic years, and manage user roles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mx-auto">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">User Management</h3>
              <p className="text-xs text-slate-400 mt-1">Manage, activate, and deactivate college accounts.</p>
            </div>
            <a
              href="/users"
              className="block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-all"
            >
              Manage Users
            </a>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Departments</h3>
              <p className="text-xs text-slate-400 mt-1">Add, modify, and delete department codes.</p>
            </div>
            <a
              href="/departments"
              className="block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-all"
            >
              Configure Depts
            </a>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mx-auto">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Academic Sessions</h3>
              <p className="text-xs text-slate-400 mt-1">Track active years and reset semester parameters.</p>
            </div>
            <a
              href="/academic-years"
              className="block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg transition-all"
            >
              Session Config
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Dashboard;
