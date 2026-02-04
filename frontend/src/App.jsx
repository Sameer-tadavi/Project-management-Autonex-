/* eslint-disable react/prop-types */
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './routes/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// Lazy Loaded Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'));
const SubProjectsPage = lazy(() => import('./pages/ProjectsPage'));  // Renamed: now Sub-Projects
const AllocationsPage = lazy(() => import('./pages/AllocationsPage'));
const LeavesPage = lazy(() => import('./pages/LeavesPage'));
const ProjectsPage = lazy(() => import('./pages/ParentProjectsPage'));  // Renamed: now Main Projects
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const EmployeeLogin = lazy(() => import('./pages/auth/EmployeeLogin'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500 font-medium">Loading Application...</div>}>
          <Routes>
            {/* Public Auth Routes - Each login is completely separate */}
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/employee" element={<EmployeeLogin />} />
            <Route path="/login" element={<Navigate to="/login/admin" replace />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="sub-projects" element={<SubProjectsPage />} />
              <Route path="allocations" element={<AllocationsPage />} />
              <Route path="leaves" element={<LeavesPage />} />
            </Route>

            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Protected Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<div>Employee Dashboard Placeholder</div>} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/login/admin" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
