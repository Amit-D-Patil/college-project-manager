import React, { useState } from 'react';
import API from '../utils/api';
import {
  FileText,
  Upload,
  CheckCircle,
  AlertOctagon,
  HelpCircle,
} from 'lucide-react';

const Imports = () => {
  // Upload states
  const [studentFile, setStudentFile] = useState(null);
  const [facultyFile, setFacultyFile] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);

  // Results
  const [studentResults, setStudentResults] = useState(null);
  const [facultyResults, setFacultyResults] = useState(null);

  // feedback
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleStudentUpload = async (e) => {
    e.preventDefault();
    if (!studentFile) return;
    setStudentLoading(true);
    setStudentResults(null);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', studentFile);

    try {
      const res = await API.post('/admin/import-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        setStudentResults(res.data.data);
        setStudentFile(null);
      }
    } catch (err) {
      setError(err.message || 'Student import failed');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleFacultyUpload = async (e) => {
    e.preventDefault();
    if (!facultyFile) return;
    setFacultyLoading(true);
    setFacultyResults(null);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', facultyFile);

    try {
      const res = await API.post('/admin/import-faculty', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess(res.data.message);
        setFacultyResults(res.data.data);
        setFacultyFile(null);
      }
    } catch (err) {
      setError(err.message || 'Faculty import failed');
    } finally {
      setFacultyLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Master Data Excel Imports</h1>
        <p className="text-sm text-slate-400 mt-1">Bulk upload student rolls and faculty directories to auto-provision portal accounts</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Student Import Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Upload size={16} className="text-primary-500" />
              <span>Bulk Student Import</span>
            </h3>

            <div className="text-[11px] text-slate-500 space-y-2 leading-relaxed">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">Excel Template Format:</span>
              <p>Your spreadsheet should contain the following headers exactly (in Sheet 1):</p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-slate-600 bg-slate-50 p-2 rounded">
                <li>Roll Number</li>
                <li>Enrollment Number</li>
                <li>Student Name</li>
                <li>Division (e.g. A)</li>
                <li>Batch (e.g. A1)</li>
                <li>Email</li>
                <li>Mobile Number</li>
                <li>Department Code (e.g. CS)</li>
              </ul>
              <p>Temporary password will be generated as: <span className="font-bold text-slate-800">Temp@RollNumber</span></p>
            </div>

            <form onSubmit={handleStudentUpload} className="space-y-3 pt-2">
              <input
                type="file"
                onChange={(e) => setStudentFile(e.target.files[0])}
                required
                className="w-full bg-slate-50 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-200 file:text-[9px] file:font-bold"
              />
              <button
                type="submit"
                disabled={studentLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded shadow transition-all"
              >
                {studentLoading ? 'Importing sheets...' : 'Upload Student Sheets'}
              </button>
            </form>
          </div>

          {/* Student Import logs summary */}
          {studentResults && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] space-y-1 mt-4">
              <span className="font-bold text-slate-600 block">Import Report:</span>
              <div>Total Rows: {studentResults.total}</div>
              <div className="text-emerald-600 font-bold">Successfully Created: {studentResults.successCount}</div>
              <div className="text-rose-600 font-bold">Failed/Duplicates: {studentResults.failedCount}</div>
              {studentResults.errors.length > 0 && (
                <div className="max-h-20 overflow-y-auto text-rose-500 pt-1 font-mono text-[9px] border-t border-slate-200/50 mt-1">
                  {studentResults.errors.slice(0, 3).map((err, idx) => <div key={idx}>{err}</div>)}
                  {studentResults.errors.length > 3 && <div>...and {studentResults.errors.length - 3} more errors</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Faculty Import Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Upload size={16} className="text-primary-500" />
              <span>Bulk Faculty Import</span>
            </h3>

            <div className="text-[11px] text-slate-500 space-y-2 leading-relaxed">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">Excel Template Format:</span>
              <p>Your spreadsheet should contain the following headers exactly (in Sheet 1):</p>
              <ul className="list-disc pl-4 space-y-1 font-mono text-[10px] text-slate-600 bg-slate-50 p-2 rounded">
                <li>Faculty Name</li>
                <li>Department Code (e.g. CS)</li>
                <li>Designation (e.g. Professor)</li>
                <li>Email</li>
                <li>Mobile Number</li>
                <li>Specialization (comma-separated, e.g. AI, ML)</li>
                <li>Roles (comma-separated, e.g. guide,coordinator)</li>
              </ul>
              <p>Temporary password will be generated as: <span className="font-bold text-slate-800">Welcome@Faculty</span></p>
            </div>

            <form onSubmit={handleFacultyUpload} className="space-y-3 pt-2">
              <input
                type="file"
                onChange={(e) => setFacultyFile(e.target.files[0])}
                required
                className="w-full bg-slate-50 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-200 file:text-[9px] file:font-bold"
              />
              <button
                type="submit"
                disabled={facultyLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded shadow transition-all"
              >
                {facultyLoading ? 'Importing sheets...' : 'Upload Faculty Sheets'}
              </button>
            </form>
          </div>

          {/* Faculty Import logs summary */}
          {facultyResults && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 text-[10px] space-y-1 mt-4">
              <span className="font-bold text-slate-600 block">Import Report:</span>
              <div>Total Rows: {facultyResults.total}</div>
              <div className="text-emerald-600 font-bold">Successfully Created: {facultyResults.successCount}</div>
              <div className="text-rose-600 font-bold">Failed/Duplicates: {facultyResults.failedCount}</div>
              {facultyResults.errors.length > 0 && (
                <div className="max-h-20 overflow-y-auto text-rose-500 pt-1 font-mono text-[9px] border-t border-slate-200/50 mt-1">
                  {facultyResults.errors.slice(0, 3).map((err, idx) => <div key={idx}>{err}</div>)}
                  {facultyResults.errors.length > 3 && <div>...and {facultyResults.errors.length - 3} more errors</div>}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl text-xs flex gap-2.5">
        <HelpCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
        <div>
          <h4 className="font-bold">Excel Parsing Engine Rule</h4>
          <p className="leading-relaxed text-[11px] text-blue-700 mt-0.5">
            The importer scans Sheet 1. Make sure to double check that Department Codes (e.g. CS, IT, EXTC) are matching the codes configured under department settings beforehand. Invalid codes will trigger record failures.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Imports;
