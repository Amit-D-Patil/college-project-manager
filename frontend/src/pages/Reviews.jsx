import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Award,
  Layers,
} from 'lucide-react';

const REVIEWS = ['Review 1', 'Review 2', 'Review 3', 'Pre-Final Review', 'Final Review'];

const Reviews = () => {
  const { user, profile } = useAuth();
  
  // Data lists
  const [reviewsHistory, setReviewsHistory] = useState([]);
  const [finalEvaluation, setFinalEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guide filter states
  const [guidedGroups, setGuidedGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);

  // Grade inputs (Intermediate reviews)
  const [reviewNum, setReviewNum] = useState('Review 1');
  const [presScore, setPresScore] = useState(0);
  const [techScore, setTechScore] = useState(0);
  const [qaScore, setQaScore] = useState(0);
  const [docScore, setDocScore] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: true/false }

  // Final evaluation scorecard inputs
  const [finalMode, setFinalMode] = useState(false); // toggle intermediate vs final scorecard
  const [innovation, setInnovation] = useState(0);
  const [complexity, setComplexity] = useState(0);
  const [design, setDesign] = useState(0);
  const [implementation, setImplementation] = useState(0);
  const [finalDoc, setFinalDoc] = useState(0);
  const [finalPres, setFinalPres] = useState(0);
  const [viva, setViva] = useState(0);
  const [finalComments, setFinalComments] = useState('');

  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadGroupGrades = async (groupId) => {
    try {
      const revsRes = await API.get(`/reviews/group/${groupId}`);
      const evalRes = await API.get(`/evaluations/group/${groupId}`);

      if (revsRes.data.success) {
        setReviewsHistory(revsRes.data.data);
      }
      if (evalRes.data.success) {
        setFinalEvaluation(evalRes.data.hasEvaluation ? evalRes.data.data : null);
      }
    } catch (err) {
      console.error('Failed to load grades data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGuideData = async () => {
    try {
      const res = await API.get('/analytics/dashboard');
      if (res.data.success) {
        const groups = res.data.analytics.assignedGroupsCount > 0 ? res.data.analytics.groupAnalytics : [];
        setGuidedGroups(groups);
        
        if (groups.length > 0) {
          const firstGroupId = groups[0].groupId;
          setActiveGroupId(firstGroupId);
          
          // Fetch members of first group
          const fullGroupRes = await API.get('/groups/my-group'); // fetch details via list/all or specific endpoint
          const groupDetails = res.data.analytics.groupDetails;
          
          // Fetch group details directly from server to get members list
          const grpRes = await API.get(`/projects/all`);
          if (grpRes.data.success) {
            const currentGroup = grpRes.data.data.find(p => p.groupId?._id === firstGroupId)?.groupId;
            if (currentGroup) {
              setGroupMembers(currentGroup.members || []);
              // Initialize attendanceMap to true
              const att = {};
              currentGroup.members.forEach((m) => { att[m._id] = true; });
              setAttendanceMap(att);
            }
          }
          
          await loadGroupGrades(firstGroupId);
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
        loadGroupGrades(profile.groupId._id || profile.groupId);
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
    setError('');
    setSuccess('');
    
    // Fetch members and update list
    const grpRes = await API.get(`/projects/all`);
    if (grpRes.data.success) {
      const currentGroup = grpRes.data.data.find(p => p.groupId?._id === gid)?.groupId;
      if (currentGroup) {
        setGroupMembers(currentGroup.members || []);
        const att = {};
        currentGroup.members.forEach((m) => { att[m._id] = true; });
        setAttendanceMap(att);
      }
    }

    await loadGroupGrades(gid);
  };

  const handleAttendanceChange = (studentId) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Intermediate review score submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Format attendance array
    const attendance = Object.keys(attendanceMap).map((studentId) => ({
      studentId,
      present: attendanceMap[studentId],
    }));

    const payload = {
      groupId: activeGroupId,
      reviewNumber: reviewNum,
      marks: {
        presentation: Number(presScore),
        technicalDepth: Number(techScore),
        qaPerformance: Number(qaScore),
        documentation: Number(docScore),
      },
      remarks,
      attendance,
    };

    try {
      const res = await API.post('/reviews', payload);
      if (res.data.success) {
        setSuccess(`Marks for ${reviewNum} saved successfully and synchronized!`);
        setPresScore(0);
        setTechScore(0);
        setQaScore(0);
        setDocScore(0);
        setRemarks('');
        loadGroupGrades(activeGroupId);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review');
    }
  };

  // Final evaluation scorecard submit
  const handleFinalEvaluationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      groupId: activeGroupId,
      innovation: Number(innovation),
      technicalComplexity: Number(complexity),
      designQuality: Number(design),
      implementationQuality: Number(implementation),
      documentation: Number(finalDoc),
      presentation: Number(finalPres),
      vivaPerformance: Number(viva),
      comments: finalComments,
    };

    try {
      const res = await API.post('/evaluations', payload);
      if (res.data.success) {
        setSuccess('Final evaluation scorecard graded and closed!');
        setInnovation(0);
        setComplexity(0);
        setDesign(0);
        setImplementation(0);
        setFinalDoc(0);
        setFinalPres(0);
        setViva(0);
        setFinalComments('');
        loadGroupGrades(activeGroupId);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit final scorecard');
    }
  };

  // Calc live sums for guide UI feedback
  const totalIntermediate = Number(presScore) + Number(techScore) + Number(qaScore) + Number(docScore);
  const totalFinal = Number(innovation) + Number(complexity) + Number(design) + Number(implementation) + Number(finalDoc) + Number(finalPres) + Number(viva);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Project Review & Scorecard</h1>
          <p className="text-sm text-slate-400 mt-1">Record and verify semester milestone evaluations and final year grading rubrics</p>
        </div>

        {user.currentRole === 'guide' && (
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setFinalMode(false)}
              className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${
                !finalMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Milestones Marks
            </button>
            <button
              onClick={() => setFinalMode(true)}
              className={`text-xs font-bold px-3 py-1.5 rounded transition-all ${
                finalMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              Final Rubrics Card
            </button>
          </div>
        )}
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

      {/* Constraint check: Student without group */}
      {user.currentRole === 'student' && !profile?.groupId && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 shadow-sm">
          <span>You must form a group and assign a guide to see review scorecards</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* --- LEFT: GRADES & SCORECARD DISPLAY --- */}
        <div className="lg:flex-grow space-y-6">
          
          {/* Milestone reviews list */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <ClipboardList size={16} className="text-primary-500" />
                <span>Milestone Review Evaluations</span>
              </h3>
              
              {/* Group filter for Guide */}
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
              {reviewsHistory.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-12">No milestone review grades recorded yet</div>
              ) : (
                reviewsHistory.map((rev) => (
                  <div key={rev._id} className="border border-slate-100 rounded-xl p-4 space-y-3 hover:bg-slate-50/50 transition-all text-xs">
                    <div className="flex justify-between items-start border-b border-slate-50 pb-2">
                      <div>
                        <h4 className="font-bold text-slate-800">{rev.reviewNumber}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Evaluator: {rev.evaluatedById?.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-primary-600">{rev.totalMarks} / {rev.maxMarks}</span>
                        <span className="text-[9px] text-slate-400 block font-medium">Recorded: {new Date(rev.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Presentation</span>
                        <span className="font-bold text-slate-700">{rev.marks.presentation} / 10</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Technical Depth</span>
                        <span className="font-bold text-slate-700">{rev.marks.technicalDepth} / 15</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Q&A Performance</span>
                        <span className="font-bold text-slate-700">{rev.marks.qaPerformance} / 15</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Documentation</span>
                        <span className="font-bold text-slate-700">{rev.marks.documentation} / 10</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-3 text-[10px] pt-1 text-slate-500">
                      <div className="flex flex-wrap gap-2">
                        <span className="font-bold text-slate-400 uppercase tracking-wide block sm:inline">Attendance:</span>
                        {rev.attendance.map((att) => (
                          <span
                            key={att.studentId?._id}
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              att.present ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {att.studentId?.name} ({att.present ? 'P' : 'A'})
                          </span>
                        ))}
                      </div>
                      {rev.remarks && <p className="italic text-slate-500">Remarks: "{rev.remarks}"</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Final Scorecard section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Award size={16} className="text-primary-500" />
              <span>Final Project Grading Scorecard (Rubrics Evaluation)</span>
            </h3>

            {finalEvaluation ? (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800">Grades Total Score</h4>
                    <span className="text-[10px] text-slate-400">Graded By: {finalEvaluation.evaluatedById?.name}</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-600">{finalEvaluation.totalScore} / 100</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-2.5 border border-slate-200 rounded text-center">
                    <span className="text-[9px] text-slate-400 font-bold block">Innovation</span>
                    <span className="font-extrabold text-slate-800 text-sm">{finalEvaluation.innovation} / 10</span>
                  </div>
                  <div className="bg-white p-2.5 border border-slate-200 rounded text-center">
                    <span className="text-[9px] text-slate-400 font-bold block">Complexity</span>
                    <span className="font-extrabold text-slate-800 text-sm">{finalEvaluation.technicalComplexity} / 15</span>
                  </div>
                  <div className="bg-white p-2.5 border border-slate-200 rounded text-center">
                    <span className="text-[9px] text-slate-400 font-bold block">Design Quality</span>
                    <span className="font-extrabold text-slate-800 text-sm">{finalEvaluation.designQuality} / 15</span>
                  </div>
                  <div className="bg-white p-2.5 border border-slate-200 rounded text-center">
                    <span className="text-[9px] text-slate-400 font-bold block">Implementation</span>
                    <span className="font-extrabold text-slate-800 text-sm">{finalEvaluation.implementationQuality} / 20</span>
                  </div>
                  <div className="bg-white p-2.5 border border-slate-200 rounded text-center">
                    <span className="text-[9px] text-slate-400 font-bold block">Documentation</span>
                    <span className="font-extrabold text-slate-800 text-sm">{finalEvaluation.documentation} / 15</span>
                  </div>
                  <div className="bg-white p-2.5 border border-slate-200 rounded text-center">
                    <span className="text-[9px] text-slate-400 font-bold block">Presentation</span>
                    <span className="font-extrabold text-slate-800 text-sm">{finalEvaluation.presentation} / 10</span>
                  </div>
                  <div className="bg-white p-2.5 border border-slate-200 rounded text-center">
                    <span className="text-[9px] text-slate-400 font-bold block">Viva-Voce</span>
                    <span className="font-extrabold text-slate-800 text-sm">{finalEvaluation.vivaPerformance} / 15</span>
                  </div>
                </div>

                {finalEvaluation.comments && (
                  <p className="italic text-slate-500 pt-2 leading-relaxed">
                    Evaluator Remarks: "{finalEvaluation.comments}"
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-xs text-slate-400 py-8">Final Year project grading scorecard has not been locked yet</div>
            )}
          </div>

        </div>

        {/* --- RIGHT: INPUT PANEL (GUIDE ONLY) --- */}
        {user.currentRole === 'guide' && (
          <div className="lg:w-80 shrink-0">
            {/* intermediate reviews input */}
            {!finalMode ? (
              <form onSubmit={handleReviewSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <ClipboardList size={16} className="text-primary-500" />
                  <span>Grade Milestone Marks</span>
                </h3>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Select Milestone</label>
                  <select value={reviewNum} onChange={(e) => setReviewNum(e.target.value)} className="w-full bg-slate-50 text-xs">
                    {REVIEWS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Presentation (10)</label>
                    <input type="number" min="0" max="10" value={presScore} onChange={(e) => setPresScore(e.target.value)} className="w-full bg-slate-50" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Tech Depth (15)</label>
                    <input type="number" min="0" max="15" value={techScore} onChange={(e) => setTechScore(e.target.value)} className="w-full bg-slate-50" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Q&A Performance (15)</label>
                    <input type="number" min="0" max="15" value={qaScore} onChange={(e) => setQaScore(e.target.value)} className="w-full bg-slate-50" required />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide mb-1">Documentation (10)</label>
                    <input type="number" min="0" max="10" value={docScore} onChange={(e) => setDocScore(e.target.value)} className="w-full bg-slate-50" required />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded p-2 text-center text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Running Total Marks</span>
                  <span className="text-lg font-extrabold text-primary-600">{totalIntermediate} / 50</span>
                </div>

                {/* Attendance Checklist */}
                {groupMembers.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Student Attendance</span>
                    <div className="space-y-1">
                      {groupMembers.map((m) => (
                        <label key={m._id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1.5 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={attendanceMap[m._id] || false}
                            onChange={() => handleAttendanceChange(m._id)}
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span>{m.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Evaluation Remarks</label>
                  <textarea
                    placeholder="Enter review remarks..."
                    rows="3"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-50 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-lg shadow transition-all mt-4"
                >
                  Save Milestone Marks
                </button>
              </form>
            ) : (
              /* final evaluation rubrics card input */
              <form onSubmit={handleFinalEvaluationSubmit} className="bg-slate-900 text-slate-350 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Award size={16} className="text-amber-400" />
                  <span>Final Year Rubrics Card</span>
                </h3>

                <div className="space-y-3.5 text-xs text-slate-400">
                  <div className="flex justify-between items-center gap-2">
                    <label className="font-medium">Innovation (10)</label>
                    <input type="number" min="0" max="10" value={innovation} onChange={(e) => setInnovation(e.target.value)} className="w-20 bg-slate-850 border border-slate-700 text-white py-1 px-2 rounded text-center" required />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <label className="font-medium">Complexity (15)</label>
                    <input type="number" min="0" max="15" value={complexity} onChange={(e) => setComplexity(e.target.value)} className="w-20 bg-slate-850 border border-slate-700 text-white py-1 px-2 rounded text-center" required />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <label className="font-medium">Design Quality (15)</label>
                    <input type="number" min="0" max="15" value={design} onChange={(e) => setDesign(e.target.value)} className="w-20 bg-slate-850 border border-slate-700 text-white py-1 px-2 rounded text-center" required />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <label className="font-medium">Implementation (20)</label>
                    <input type="number" min="0" max="20" value={implementation} onChange={(e) => setImplementation(e.target.value)} className="w-20 bg-slate-850 border border-slate-700 text-white py-1 px-2 rounded text-center" required />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <label className="font-medium">Documentation (15)</label>
                    <input type="number" min="0" max="15" value={finalDoc} onChange={(e) => setFinalDoc(e.target.value)} className="w-20 bg-slate-850 border border-slate-700 text-white py-1 px-2 rounded text-center" required />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <label className="font-medium">Presentation (10)</label>
                    <input type="number" min="0" max="10" value={finalPres} onChange={(e) => setFinalPres(e.target.value)} className="w-20 bg-slate-850 border border-slate-700 text-white py-1 px-2 rounded text-center" required />
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <label className="font-medium">Viva-Voce Performance (15)</label>
                    <input type="number" min="0" max="15" value={viva} onChange={(e) => setViva(e.target.value)} className="w-20 bg-slate-850 border border-slate-700 text-white py-1 px-2 rounded text-center" required />
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded p-2 text-center text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Grades Sum Total</span>
                  <span className="text-xl font-black text-amber-400">{totalFinal} / 100</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Final Comments remarks</label>
                  <textarea
                    placeholder="Input audit comments..."
                    rows="3"
                    value={finalComments}
                    onChange={(e) => setFinalComments(e.target.value)}
                    className="w-full bg-slate-850 border border-slate-700 text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-lg shadow-primary-500/10 transition-all mt-4"
                >
                  Lock Grades Scorecard
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Reviews;
