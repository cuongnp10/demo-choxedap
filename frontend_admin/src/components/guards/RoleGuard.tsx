import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: ('ADMIN' | 'INSPECTOR')[];
  fallbackPath?: string;
  children?: React.ReactNode;
}

const RoleGuard = ({ allowedRoles, fallbackPath, children }: RoleGuardProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen font-bold text-primary animate-pulse">Đang kiểm tra quyền truy cập...</div>;
  }

  if (!user) {
    console.log('RoleGuard: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('RoleGuard: User role is', user.role, 'Allowed roles:', allowedRoles);

  if (!allowedRoles.includes(user.role)) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
    
    console.warn('RoleGuard: Unauthorized role:', user.role);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-red-50 text-center">
        <h1 className="text-4xl font-black text-red-600 mb-4">KHÔNG CÓ QUYỀN TRUY CẬP</h1>
        <p className="text-lg font-bold text-red-800 max-w-md">
          Tài khoản của bạn ({user.email}) có quyền <span className="underline">{user.role || 'KHÔNG XÁC ĐỊNH'}</span>, 
          không thuộc nhóm có quyền quản trị hệ thống.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="mt-8 px-8 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-200"
        >
          Quay lại Đăng nhập
        </button>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;
