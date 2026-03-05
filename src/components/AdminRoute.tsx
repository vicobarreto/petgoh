import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute: React.FC = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        // Not logged in -> Redirect to Login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== 'admin') {
        // Logged in but not admin -> Redirect to Security/Unauthorized Page
        // This satisfies the requirement: "nao ser deslogado" and "pagina de segurança"
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
