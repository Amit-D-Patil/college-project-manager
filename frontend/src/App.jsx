import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import DashboardLayout from './components/DashboardLayout';

// Page imports
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import GroupManagement from './pages/GroupManagement';
import ProjectRegistration from './pages/ProjectRegistration';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import NoticeBoard from './pages/Notices';
import Communication from './pages/Communication';
import Reviews from './pages/Reviews';
import GuideAllocation from './pages/GuideAllocation';
import ProjectsList from './pages/Projects';
import Reports from './pages/Reports';
import Imports from './pages/Imports';
import AcademicYears from './pages/AcademicYears';
import Departments from './pages/Departments';
import UsersList from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Password Force-change Route */}
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Protected Portal Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/group" element={<GroupManagement />} />
              <Route path="/project-register" element={<ProjectRegistration />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/chat" element={<Communication />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/allocations" element={<GuideAllocation />} />
              <Route path="/projects" element={<ProjectsList />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/imports" element={<Imports />} />
              <Route path="/academic-years" element={<AcademicYears />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/users" element={<UsersList />} />
              
              {/* Fallback redirects */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
