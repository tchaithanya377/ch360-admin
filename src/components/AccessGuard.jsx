import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDjangoAuth } from '../contexts/DjangoAuthContext';

const AccessGuard = ({ requireRole, requirePermission, fallback = null, children }) => {
	const { isAuthenticated, loading, user } = useDjangoAuth();

	if (loading) return null;
	if (!isAuthenticated) return <Navigate to="/login" replace />;

    const roles = Array.isArray(user?.roles) ? user.roles : [];
	const perms = Array.isArray(user?.permissions) ? user.permissions : [];
    const isAdminLike = (
        user?.is_superuser === true ||
        user?.is_staff === true ||
        roles.includes('admin') ||
        roles.includes('Admin') ||
        roles.includes('administrator')
    );

	let allowed = isAdminLike;
	if (!allowed && requireRole) allowed = roles.includes(requireRole);
	if (!allowed && requirePermission) allowed = perms.includes(requirePermission);

	if (!allowed) return fallback ?? (<div className="p-6"><h2 className="text-lg font-semibold">No access</h2><p className="text-gray-600">You do not have permission to view this page.</p></div>);

	return children;
};

export default AccessGuard;


