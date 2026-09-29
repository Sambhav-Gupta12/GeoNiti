import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, Can } from '@/lib/auth';
import { Permission } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission;
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, can } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !can(permission)) {
    return (
      <div className="p-8">
        <PageHeader title="Access Denied" />
        <div className="mt-8 bg-white border rounded-lg h-96 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">403 Forbidden</h3>
            <p className="mt-1 text-sm text-neutral-500 max-w-sm">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
