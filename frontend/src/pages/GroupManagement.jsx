import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  Users,
  UserPlus,
  MailOpen,
  LogOut,
  Shield,
  Clock,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

const GroupManagement = () => {
  const { profile, fetchProfile } = useAuth();
  const [groupState, setGroupState] = useState({ inGroup: false, data: null, invitations: [] });
  const [loading, setLoading] = useState(true);
  
  // Inputs
  const [joinCode, setJoinCode] = useState('');
  const [inviteRoll, setInviteRoll] = useState('');
  
  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchGroupData = async () => {
    try {
      const res = await API.get('/groups/my-group');
      if (res.data.success) {
        setGroupState({
          inGroup: res.data.inGroup,
          data: res.data.data || null,
          invitations: res.data.invitations || [],
        });
      }
    } catch (err) {
      console.error('Failed to load group details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, []);

  const handleCreateGroup = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await API.post('/groups/create');
      if (res.data.success) {
        setSuccess('Group created successfully!');
        await fetchGroupData();
        await fetchProfile(); // refresh auth profile
      }
    } catch (err) {
      setError(err.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!joinCode) return;
    try {
      const res = await API.post('/groups/join', { groupCode: joinCode.trim() });
      if (res.data.success) {
        setSuccess('Joined group successfully!');
        setJoinCode('');
        await fetchGroupData();
        await fetchProfile();
      }
    } catch (err) {
      setError(err.message || 'Failed to join group');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!inviteRoll) return;
    try {
      const res = await API.post('/groups/invite', { rollNumber: inviteRoll.trim().toUpperCase() });
      if (res.data.success) {
        setSuccess(`Invitation sent successfully to student!`);
        setInviteRoll('');
        await fetchGroupData();
      }
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    }
  };

  const handleAcceptInvite = async (groupId) => {
    setError('');
    setSuccess('');
    try {
      const res = await API.post('/groups/accept', { groupId });
      if (res.data.success) {
        setSuccess('Accepted invitation successfully!');
        await fetchGroupData();
        await fetchProfile();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept invitation');
    }
  };

  const handleRejectInvite = async (groupId) => {
    setError('');
    try {
      const res = await API.post('/groups/reject', { groupId });
      if (res.data.success) {
        setSuccess('Rejected invitation successfully!');
        await fetchGroupData();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject invitation');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await API.post('/groups/leave');
      if (res.data.success) {
        setSuccess('You have left the group.');
        await fetchGroupData();
        await fetchProfile();
      }
    } catch (err) {
      setError(err.message || 'Failed to leave group');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Project Group Management</h1>
        <p className="text-sm text-slate-400 mt-1">Form or manage your final year project team (3-4 members required)</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check size={14} />
          <span>{success}</span>
        </div>
      )}

      {/* --- STATE 1: NOT IN GROUP --- */}
      {!groupState.inGroup ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Create or Join Box */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Create a New Team</h3>
              <p className="text-xs text-slate-400 mt-1">Establish a group and become the team leader. You will receive a unique join code.</p>
              <button
                onClick={handleCreateGroup}
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                <Users size={14} />
                <span>Create Group</span>
              </button>
            </div>

            <hr className="border-slate-100" />

            <div>
              <h3 className="font-bold text-slate-800 text-sm">Join via Code</h3>
              <p className="text-xs text-slate-400 mt-1">Enter the group code shared by your division classmate.</p>
              <form onSubmit={handleJoinGroup} className="flex gap-2 mt-4">
                <input
                  type="text"
                  placeholder="e.g. G-A-123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 focus:bg-white text-xs w-48"
                  required
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  Join Team
                </button>
              </form>
            </div>
          </div>

          {/* Pending Invitations list */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <MailOpen size={16} className="text-primary-500" />
              <span>Pending Group Invitations</span>
            </h3>
            {groupState.invitations.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-12">
                No invitations received yet
              </div>
            ) : (
              <div className="space-y-3">
                {groupState.invitations.map((inv) => (
                  <div
                    key={inv._id}
                    className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex justify-between items-center text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-700">{inv.groupCode}</h4>
                      <p className="text-slate-500 text-[10px] mt-0.5">Leader: {inv.leader?.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptInvite(inv._id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-all"
                        title="Accept"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => handleRejectInvite(inv._id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded transition-all"
                        title="Reject"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* --- STATE 2: ALREADY IN GROUP --- */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Team Identification</span>
                <h3 className="text-xl font-bold text-slate-800">{groupState.data?.groupCode}</h3>
              </div>
              <button
                onClick={handleLeaveGroup}
                className="bg-rose-50 hover:bg-rose-100 hover:text-rose-700 text-rose-600 font-semibold text-xs px-3.5 py-2 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <LogOut size={13} />
                <span>Leave Group</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Team details */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-3">Group Members</h4>
                  <div className="space-y-3">
                    {groupState.data?.members?.map((member) => {
                      const isLeader = groupState.data.leader._id === member._id;
                      return (
                        <div
                          key={member._id}
                          className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span>{member.name}</span>
                                {isLeader && (
                                  <span className="bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-[4px] text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-0.5">
                                    <Shield size={8} /> Leader
                                  </span>
                                )}
                              </h5>
                              <p className="text-slate-400 text-[10px] mt-0.5">{member.rollNumber} | {member.email}</p>
                            </div>
                          </div>
                          <span className="text-slate-500 font-medium">Batch {member.batch}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Invites & Code display */}
              <div className="space-y-6">
                <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl">
                  <span className="text-[10px] text-primary-600 font-bold uppercase tracking-wider block">Group Invite Code</span>
                  <h3 className="text-2xl font-black text-primary-800 tracking-wide mt-1">{groupState.data?.groupCode}</h3>
                  <p className="text-[10px] text-primary-500 mt-2 leading-relaxed">
                    Share this code with members of division '{groupState.data?.division}' to join the team.
                  </p>
                </div>

                {/* Invite members panel (Leader only) */}
                {groupState.data?.leader?.email === profile?.email && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <UserPlus size={14} /> Invite via Roll Number
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Invite classmates from division {groupState.data.division}.</p>
                    </div>

                    <form onSubmit={handleInviteMember} className="space-y-2">
                      <input
                        type="text"
                        placeholder="e.g. CS2026A04"
                        value={inviteRoll}
                        onChange={(e) => setInviteRoll(e.target.value)}
                        className="bg-slate-50 border border-slate-200 focus:bg-white text-xs w-full"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg shadow transition-all"
                      >
                        Send Invitation
                      </button>
                    </form>

                    {/* Pending Invites Sent */}
                    {groupState.data?.pendingInvites?.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Pending Invites</span>
                        <div className="space-y-1.5">
                          {groupState.data.pendingInvites.map((inv) => (
                            <div key={inv} className="bg-slate-50 border border-slate-100 rounded px-2.5 py-1.5 flex justify-between items-center text-[10px]">
                              <span className="font-semibold text-slate-600">Student ID: {inv.substring(18)}</span>
                              <span className="text-amber-500 flex items-center gap-0.5">
                                <Clock size={10} /> Pending
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;
