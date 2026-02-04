import { Navigate, useLocation } from 'react-router-dom';

// TODO: Replace with real auth hook
const useAuth = () => {
    // Mock authentication for development
    // In real app, check localStorage token and decode JWT for role
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    return {
        isAuthenticated: !!token,
        role: role, // 'admin' or 'employee'
    };
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to the appropriate login based on the URL extracted from location
        // or default to generic login if path is unclear
        const isEmployeeRoute = location.pathname.startsWith('/employee');
        return <Navigate to={isEmployeeRoute ? "/login/employee" : "/login/admin"} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Role authorized check
        // If logged in as employee but trying to access admin, 403 or redirect to their dashboard
        return <Navigate to={role === 'admin' ? "/admin/dashboard" : "/employee/dashboard"} replace />;
    }

    return children;
};

export default ProtectedRoute;
