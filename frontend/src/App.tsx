import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorState } from '@/components/ui/ErrorState';
import { PageHeader } from '@/components/ui/PageHeader';

const Login = lazy(() => import('@/pages/Login'));
const Placeholder = lazy(() => import('@/pages/Placeholder'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Repository = lazy(() => import('@/pages/Repository'));
const DocumentDetail = lazy(() => import('@/pages/DocumentDetail'));
const Search = lazy(() => import('@/pages/Search'));
const Assistant = lazy(() => import('@/pages/Assistant'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NotFound() {
  return (
    <div className="p-8">
      <PageHeader title="Not Found" />
      <div className="mt-8 bg-white border rounded-lg h-96 flex items-center justify-center">
        <ErrorState message="The page you are looking for does not exist." />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<AppShell />}>
                <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="repository" element={<ProtectedRoute><Repository /></ProtectedRoute>} />
                <Route path="repository/:id" element={<ProtectedRoute><DocumentDetail /></ProtectedRoute>} />
                <Route path="datasets" element={<ProtectedRoute><Placeholder title="Datasets" description="Explore underlying tabular and vector datasets." /></ProtectedRoute>} />
                <Route path="datasets/:id" element={<ProtectedRoute><Placeholder title="Dataset Details" /></ProtectedRoute>} />
                <Route path="assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
                <Route path="map" element={<ProtectedRoute><Placeholder title="Map Explorer" description="Interactive GIS layers." /></ProtectedRoute>} />
                <Route path="regions/:id" element={<ProtectedRoute><Placeholder title="Region Profile" /></ProtectedRoute>} />
                <Route path="analytics" element={<ProtectedRoute><Placeholder title="Analytics" description="Indicator trends and comparisons." /></ProtectedRoute>} />
                
                <Route path="scenarios" element={<ProtectedRoute permission="scenario:run"><Placeholder title="Scenario Sandbox" description="Model policy impacts." /></ProtectedRoute>} />
                
                <Route path="workspace" element={<ProtectedRoute><Placeholder title="Workspaces" description="Manage your projects." /></ProtectedRoute>} />
                <Route path="workspace/:id" element={<ProtectedRoute><Placeholder title="Project Workspace" /></ProtectedRoute>} />
                
                <Route path="innovation" element={<ProtectedRoute><Placeholder title="Innovation Portal" description="Discover and register for challenges." /></ProtectedRoute>} />
                
                <Route path="admin/queue" element={<ProtectedRoute permission="document:approve"><Placeholder title="Approval Queue" description="Review uploaded documents and metadata." /></ProtectedRoute>} />
                <Route path="admin/users" element={<ProtectedRoute permission="admin:users"><Placeholder title="Users & Roles" /></ProtectedRoute>} />
                <Route path="admin/health" element={<ProtectedRoute permission="admin:audit"><Placeholder title="System Health" /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
