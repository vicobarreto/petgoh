import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PartnerRoute: React.FC = () => {
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
        return <Navigate to="/partner" state={{ from: location }} replace />;
    }

    if (user.role !== 'partner' && user.role !== 'admin') {
        // Just redirect them to /partner so the portal can show them the exact "You are a Tutor" error
        return <Navigate to="/partner" replace />;
    }

    return <Outlet />;
};

export default PartnerRoute;
