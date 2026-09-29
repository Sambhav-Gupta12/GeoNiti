import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorState } from '@/components/ui/ErrorState';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  // Catch AI_UNAVAILABLE explicitly if needed, although it might just be a standard error
  if (error.name === 'ApiError' && (error as any).code === 'AI_UNAVAILABLE') {
    return (
      <div className="p-8">
        <ErrorState 
          message="The AI Service is currently unavailable. Please try again later." 
          onRetry={resetErrorBoundary} 
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <ErrorState 
        message={error.message || 'An unexpected error occurred.'} 
        onRetry={resetErrorBoundary} 
      />
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
