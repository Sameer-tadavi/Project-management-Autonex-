import { Navigate, useLocation } from 'react-router-dom';

/**
 * Decode a JWT payload without verifying signature (browser-side).
 * Falls back to localStorage 'role' for backward compat.
 */
const parseJwt = (token) => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
};

const useAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) return { isAuthenticated: false, role: null, user: null };

    const payload = parseJwt(token);
    if (!payload) return { isAuthenticated: false, role: null, user: null };

    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        return { isAuthenticated: false, role: null, user: null };
    }

    const role = payload.role || localStorage.getItem('role');
    return { isAuthenticated: true, role, user: payload };
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        const isEmployeeRoute = location.pathname.startsWith('/employee');
        const isPMRoute = location.pathname.startsWith('/pm');
        const loginPath = isEmployeeRoute
            ? '/login/employee'
            : isPMRoute
                ? '/login/pm'
                : '/login/admin';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to the correct dashboard for their role
        const dashboardMap = {
            admin: '/admin/dashboard',
            pm: '/pm/dashboard',
            employee: '/employee/dashboard',
        };
        return <Navigate to={dashboardMap[role] || '/login/admin'} replace />;
    }

    return children;
};

export { useAuth };
export default ProtectedRoute;
