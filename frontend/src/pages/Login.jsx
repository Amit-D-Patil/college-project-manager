import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMessage('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrMessage(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Developer quick login presets
  const handleQuickLogin = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Brand Panel */}
        <div className="md:w-1/2 bg-gradient-to-br from-primary-700 to-primary-950 p-12 text-white flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={36} className="text-primary-300" />
            <h1 className="text-2xl font-bold tracking-wide">University ERP</h1>
          </div>
          
          <div className="my-8">
            <h2 className="text-3xl font-extrabold leading-tight mb-4">
              Final Year Project Lifecycle Management
            </h2>
            <p className="text-sm text-primary-200 leading-relaxed">
              A comprehensive portal for student registrations, guide allocations, task trackers, document versioning, and compliance reporting (NBA / NAAC).
            </p>
          </div>

          <div className="text-xs text-primary-400">
            &copy; 2026 Academic ERP Services. All rights reserved.
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-sm text-slate-400 mt-1">Please sign in to your university account</p>
          </div>

          {errMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 mb-6">
              <AlertCircle size={14} />
              <span>{errMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  required
                  className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 disabled:opacity-50 mt-6"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Dev Demo Helpers */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Developer Demo Accounts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@college.edu', 'Admin@123')}
                className="text-left bg-slate-50 hover:bg-primary-50 text-[11px] p-2 rounded-lg border border-slate-200 hover:border-primary-200 transition-all font-medium text-slate-600"
              >
                💼 Admin User
              </button>
              <button
                onClick={() => handleQuickLogin('hod_cs@college.edu', 'Welcome@123')}
                className="text-left bg-slate-50 hover:bg-primary-50 text-[11px] p-2 rounded-lg border border-slate-200 hover:border-primary-200 transition-all font-medium text-slate-600"
              >
                🏫 HOD / Guide (CS)
              </button>
              <button
                onClick={() => handleQuickLogin('coordinator_cs@college.edu', 'Welcome@123')}
                className="text-left bg-slate-50 hover:bg-primary-50 text-[11px] p-2 rounded-lg border border-slate-200 hover:border-primary-200 transition-all font-medium text-slate-600"
              >
                📋 Coordinator (CS)
              </button>
              <button
                onClick={() => handleQuickLogin('student1@college.edu', 'Welcome@123')}
                className="text-left bg-slate-50 hover:bg-primary-50 text-[11px] p-2 rounded-lg border border-slate-200 hover:border-primary-200 transition-all font-medium text-slate-600"
              >
                🎓 Student Leader (CS)
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
