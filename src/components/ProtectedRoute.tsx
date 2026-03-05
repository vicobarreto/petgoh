import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login.
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        // If logged in but not an admin, redirect to home page
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;