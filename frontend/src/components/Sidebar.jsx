import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileCode,
  CheckSquare,
  FileSpreadsheet,
  MessageSquare,
  ClipboardList,
  Bell,
  Settings,
  Grid,
  FileText,
  Calendar,
  Layers,
  LogOut,
  UserCheck,
} from 'lucide-react';

const Sidebar = () => {
  const { user, switchUserRole, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    try {
      await switchUserRole(newRole);
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to switch role');
    }
  };

  // Define navigation items based on active role
  const getNavItems = () => {
    const role = user?.currentRole;

    switch (role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Group', path: '/group', icon: Users },
          { name: 'Project Proposal', path: '/project-register', icon: FileCode },
          { name: 'Tasks Board', path: '/tasks', icon: CheckSquare },
          { name: 'Documents', path: '/documents', icon: FileSpreadsheet },
          { name: 'Communication', path: '/chat', icon: MessageSquare },
        ];
      case 'guide':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Review Marking', path: '/reviews', icon: ClipboardList },
          { name: 'Task Board', path: '/tasks', icon: CheckSquare },
          { name: 'Documents Approval', path: '/documents', icon: FileSpreadsheet },
          { name: 'Notices Board', path: '/notices', icon: Bell },
          { name: 'Communication', path: '/chat', icon: MessageSquare },
        ];
      case 'coordinator':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Excel Imports', path: '/imports', icon: FileText },
          { name: 'Guide Allocations', path: '/allocations', icon: Layers },
          { name: 'Project Proposals', path: '/projects', icon: FileCode },
          { name: 'Review Marks', path: '/reviews', icon: ClipboardList },
          { name: 'Notices Board', path: '/notices', icon: Bell },
          { name: 'Reports Center', path: '/reports', icon: FileSpreadsheet },
          { name: 'Communication', path: '/chat', icon: MessageSquare },
        ];
      case 'hod':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Faculty Workload', path: '/allocations', icon: Users },
          { name: 'Project Proposals', path: '/projects', icon: FileCode },
          { name: 'Notices Board', path: '/notices', icon: Bell },
          { name: 'Reports Center', path: '/reports', icon: FileSpreadsheet },
        ];
      case 'principal':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'College Analytics', path: '/dashboard', icon: Grid },
          { name: 'Notices Board', path: '/notices', icon: Bell },
          { name: 'Reports Center', path: '/reports', icon: FileSpreadsheet },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Academic Years', path: '/academic-years', icon: Calendar },
          { name: 'Departments', path: '/departments', icon: Layers },
          { name: 'User Management', path: '/users', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="w-64 bg-sidebar text-slate-300 min-h-screen flex flex-col justify-between shadow-xl">
      <div>
        {/* ERP Title */}
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <div className="bg-primary-500 text-white p-2 rounded-lg font-bold text-lg">CP</div>
          <div>
            <h1 className="font-bold text-white text-base tracking-wide leading-tight">Project Portal</h1>
            <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">ERP System</span>
          </div>
        </div>

        {/* Role Switcher */}
        {user?.roles?.length > 1 && (
          <div className="p-4 mx-4 my-3 bg-slate-800 rounded-lg border border-slate-700">
            <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <UserCheck size={12} /> Active Role:
            </label>
            <select
              value={user.currentRole}
              onChange={handleRoleChange}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-1.5 focus:ring-1 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              {user.roles.map((r) => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white text-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate">{user?.email}</h4>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">{user?.currentRole}</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 py-2.5 rounded-lg text-xs font-semibold border border-slate-700 hover:border-red-900 transition-all"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
