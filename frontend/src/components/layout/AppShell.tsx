import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ErrorBoundary } from './ErrorBoundary';
import { Spinner } from '@/components/ui/Spinner';

export function AppShell() {
  return (
    <div className="flex h-screen w-full bg-neutral-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="h-full w-full flex items-center justify-center">
                <Spinner size="lg" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
