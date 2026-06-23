import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import {
  FileSpreadsheet,
  FileText,
  Layers,
  Download,
  AlertTriangle,
} from 'lucide-react';

const Reports = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await API.get('/admin/departments');
        if (res.data.success) {
          setDepartments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, []);

  const handleDownload = (format, type) => {
    let url = `http://localhost:5000/api/reports/${format}?type=${type}`;
    if (selectedDept) {
      url += `&departmentId=${selectedDept}`;
    }
    // Open in new tab/triggers direct download in browser
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Compliance & Audit Reports</h1>
        <p className="text-sm text-slate-400 mt-1">Export formatted data reports for NBA, NAAC, and AICTE university reviews</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Filter Export Range:</span>
        </div>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-xs w-64"
        >
          <option value="">All College Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name} ({d.code})
            </option>
          ))}
        </select>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Report 1: Student Registry */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5 hover:border-primary-200 transition-all flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <FileSpreadsheet size={16} className="text-primary-500" />
              <span>Student Master Registry</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              List of all registered students, roll numbers, enrollment IDs, division batches, emails, and active group codes.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleDownload('excel', 'students')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download size={13} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Report 2: Faculty Workload */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5 hover:border-primary-200 transition-all flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <FileText size={16} className="text-primary-500" />
              <span>Guide Workload & Allocation</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Faculty workload statistics listing active group allocation counts, maximum load capacities, and domains of specialization.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleDownload('excel', 'guides')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download size={13} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleDownload('pdf', 'guide_workload')}
              className="bg-slate-50 hover:bg-primary-50 text-slate-600 hover:text-primary-600 border border-slate-200 hover:border-primary-200 font-semibold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Report 3: Project Synopsis Tracker */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5 hover:border-primary-200 transition-all flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <FileSpreadsheet size={16} className="text-primary-500" />
              <span>Project Proposals & Synopses</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              List of all submitted project titles, abstracts, domains, technologies used, associated group codes, and guide approvals.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleDownload('excel', 'projects')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download size={13} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Report 4: Grades Scorecard */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5 hover:border-primary-200 transition-all flex flex-col justify-between">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <FileText size={16} className="text-primary-500" />
              <span>Final Evaluations Scorecards</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Compliance-ready scorecard grades listing project innovation scores, complexity scores, implementation scores, and viva scores.
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleDownload('excel', 'evaluations')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download size={13} />
              <span>Export Excel</span>
            </button>
            <button
              onClick={() => handleDownload('pdf', 'evaluations')}
              className="bg-slate-50 hover:bg-primary-50 text-slate-600 hover:text-primary-600 border border-slate-200 hover:border-primary-200 font-semibold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Download size={13} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

      </div>

      <div className="bg-slate-900 text-slate-350 border border-slate-850 p-5 rounded-xl shadow flex gap-3 text-xs">
        <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="font-bold text-white mb-1">compliance verification note</h4>
          <p className="leading-relaxed text-[11px] text-slate-400">
            PDF reports are signed electronically with the university coordinator credentials matching current session token rules. Excel exports support bulk updates and NBA compliance mappings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
