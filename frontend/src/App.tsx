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
const MapExplorer = lazy(() => import('@/pages/MapExplorer'));
const RegionProfile = lazy(() => import('@/pages/RegionProfile'));
const Datasets = lazy(() => import('@/pages/Datasets'));
const DatasetDetail = lazy(() => import('@/pages/DatasetDetail'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Scenarios = lazy(() => import('@/pages/Scenarios'));
const Workspace = lazy(() => import('@/pages/Workspace'));
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'));
const Innovation = lazy(() => import('@/pages/Innovation'));
const Admin = lazy(() => import('@/pages/Admin'));

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
                <Route path="datasets" element={<ProtectedRoute><Datasets /></ProtectedRoute>} />
                <Route path="datasets/:id" element={<ProtectedRoute><DatasetDetail /></ProtectedRoute>} />
                <Route path="assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
                <Route path="map" element={<ProtectedRoute><MapExplorer /></ProtectedRoute>} />
                <Route path="regions/:id" element={<ProtectedRoute><RegionProfile /></ProtectedRoute>} />
                <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="scenarios" element={<ProtectedRoute permission="scenario:run"><Scenarios /></ProtectedRoute>} />
                <Route path="workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
                <Route path="workspace/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
                
                <Route path="innovation" element={<ProtectedRoute><Innovation /></ProtectedRoute>} />
                
                <Route path="admin" element={<Navigate to="/admin/queue" />} />
                <Route path="admin/:tab" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
