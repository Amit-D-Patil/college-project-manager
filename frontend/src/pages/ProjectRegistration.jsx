import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import {
  FileCode,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Cpu,
} from 'lucide-react';

const DOMAINS = [
  'Artificial Intelligence',
  'Machine Learning',
  'Data Science',
  'IoT',
  'Cyber Security',
  'Blockchain',
  'Cloud Computing',
  'Mobile Development',
  'Web Technologies',
  'Computer Vision',
  'Robotics',
  'AR/VR',
];

const ProjectRegistration = () => {
  const { profile } = useAuth();
  const [projectState, setProjectState] = useState({ hasProject: false, data: null });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, setValue, watch, reset } = useForm();
  const selectedDomain = watch('domain');

  const fetchProjectData = async () => {
    try {
      const res = await API.get('/projects/my-project');
      if (res.data.success) {
        setProjectState({
          hasProject: res.data.hasProject,
          data: res.data.data || null,
        });

        if (res.data.hasProject && res.data.data) {
          // Pre-fill form
          const p = res.data.data;
          reset({
            title: p.title,
            problemStatement: p.problemStatement,
            objectives: p.objectives,
            domain: p.domain,
            technologies: p.technologies.join(', '),
            abstract: p.abstract,
            expectedOutcome: p.expectedOutcome,
            pref1: p.preferences[0] || '',
            pref2: p.preferences[1] || '',
            pref3: p.preferences[2] || '',
            pref4: p.preferences[3] || '',
            pref5: p.preferences[4] || '',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI ideas when domain changes
  useEffect(() => {
    if (!selectedDomain) return;
    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        const res = await API.get(`/projects/suggestions?domain=${selectedDomain}`);
        if (res.data.success) {
          setSuggestions(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load AI suggestions:', err);
      } finally {
        setSuggestionsLoading(false);
      }
    };
    fetchSuggestions();
  }, [selectedDomain]);

  useEffect(() => {
    fetchProjectData();
  }, []);

  const handleApplySuggestion = (sug) => {
    setValue('title', sug.title);
    setValue('abstract', sug.desc);
    setValue('problemStatement', `In context of ${sug.title}, current systems are inadequate because...`);
    setValue('objectives', `1. To implement an efficient routing model for ${sug.title}.\n2. To verify compliance and user latency benchmarks.`);
  };

  const onSubmit = async (formData) => {
    setError('');
    setSuccess('');

    // Format technologies
    const technologiesList = formData.technologies
      ? formData.technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    // Format preferences
    const preferencesList = [
      formData.pref1,
      formData.pref2,
      formData.pref3,
      formData.pref4,
      formData.pref5,
    ].filter(Boolean);

    const payload = {
      title: formData.title,
      problemStatement: formData.problemStatement,
      objectives: formData.objectives,
      domain: formData.domain,
      technologies: technologiesList,
      abstract: formData.abstract,
      expectedOutcome: formData.expectedOutcome,
      preferences: preferencesList,
    };

    try {
      const res = await API.post('/projects/register', payload);
      if (res.data.success) {
        setSuccess('Project registration details saved and sent for coordinator review!');
        await fetchProjectData();
      }
    } catch (err) {
      setError(err.message || 'Failed to register project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Constraint Check: Must have a group
  if (!profile?.groupId) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center space-y-4">
        <AlertTriangle className="text-amber-500 mx-auto" size={40} />
        <h3 className="font-bold text-slate-800 text-lg">Group Formation Required</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          You must form or join a student group before registering a project proposal.
        </p>
        <a
          href="/group"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-all"
        >
          Go to Group Board
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Project Proposal & Registration</h1>
          <p className="text-sm text-slate-400 mt-1">Submit your finalized final year project synopsis and specifications</p>
        </div>
        
        {projectState.hasProject && (
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Approval Status</span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold capitalize ${
              projectState.data?.status === 'approved'
                ? 'bg-emerald-100 text-emerald-700'
                : projectState.data?.status === 'rejected'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {projectState.data?.status}
            </span>
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

      {projectState.data?.comment && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs space-y-1">
          <h5 className="font-bold">Faculty Reviewer Remarks:</h5>
          <p className="italic">"{projectState.data.comment}"</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:w-2/3 bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <FileCode size={16} className="text-primary-500" />
            <span>Project Submission Form</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Domain</label>
              <select
                {...register('domain', { required: true })}
                disabled={projectState.data?.status === 'approved'}
                className="w-full bg-slate-50 text-xs"
              >
                <option value="">Select Domain</option>
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Technologies Used (Comma-separated)</label>
              <input
                type="text"
                {...register('technologies', { required: true })}
                placeholder="React.js, Node.js, MongoDB, PyTorch"
                disabled={projectState.data?.status === 'approved'}
                className="w-full bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Project Title</label>
            <input
              type="text"
              {...register('title', { required: true })}
              placeholder="Enter project title"
              disabled={projectState.data?.status === 'approved'}
              className="w-full bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Problem Statement</label>
            <textarea
              {...register('problemStatement', { required: true })}
              placeholder="Describe the problem being solved"
              rows="3"
              disabled={projectState.data?.status === 'approved'}
              className="w-full bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Objectives</label>
              <textarea
                {...register('objectives', { required: true })}
                placeholder="What does the project aim to achieve?"
                rows="3"
                disabled={projectState.data?.status === 'approved'}
                className="w-full bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Expected Outcome</label>
              <textarea
                {...register('expectedOutcome', { required: true })}
                placeholder="What will the deliverables look like?"
                rows="3"
                disabled={projectState.data?.status === 'approved'}
                className="w-full bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Abstract Synopsis</label>
            <textarea
              {...register('abstract', { required: true })}
              placeholder="Provide a comprehensive technical abstract"
              rows="4"
              disabled={projectState.data?.status === 'approved'}
              className="w-full bg-slate-50 text-xs"
            />
          </div>

          <hr className="border-slate-100" />

          {/* Preferences list (Optional backup preferences) */}
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <HelpCircle size={14} className="text-slate-400" /> Alternative Project Choices (Five Preferences)
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">List alternative project topics if coordinator requests revision.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx}>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Preference {idx}</label>
                  <input
                    type="text"
                    {...register(`pref${idx}`)}
                    placeholder={`Preference title`}
                    disabled={projectState.data?.status === 'approved'}
                    className="w-full bg-slate-50 text-[11px] py-1.5"
                  />
                </div>
              ))}
            </div>
          </div>

          {projectState.data?.status !== 'approved' && (
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-md transition-all mt-4"
            >
              Submit Proposal
            </button>
          )}
        </form>

        {/* AI Suggestions Side Panel */}
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles size={18} />
              <h3 className="font-bold text-white text-sm">AI Suggestions Helper</h3>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Select a Technology Domain in the form to generate standard AI-inspired final year engineering topics. Click apply to auto-fill.
            </p>

            {selectedDomain ? (
              <div className="space-y-3 pt-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Suggested for: {selectedDomain}</span>
                
                {suggestionsLoading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : suggestions.length === 0 ? (
                  <p className="text-xs text-slate-500">No suggestions available for this domain</p>
                ) : (
                  suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs space-y-2 hover:border-amber-400/40 transition-all"
                    >
                      <h5 className="font-bold text-white flex items-center gap-1">
                        <Cpu size={12} className="text-amber-400 shrink-0" />
                        <span>{sug.title}</span>
                      </h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{sug.desc}</p>
                      
                      {projectState.data?.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleApplySuggestion(sug)}
                          className="bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-1 rounded transition-all"
                        >
                          Use This Topic
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="bg-slate-800/50 border border-slate-800 rounded-lg p-6 text-center text-xs text-slate-500">
                Please select a domain to see project idea suggestions.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectRegistration;
