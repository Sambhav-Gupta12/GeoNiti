import React from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Wrench } from 'lucide-react';

export default function Placeholder({ title, description }: { title: string, description?: string }) {
  return (
    <div className="p-8">
      <PageHeader title={title} description={description} />
      <div className="mt-8 bg-white border rounded-lg h-96 flex items-center justify-center">
        <EmptyState 
          icon={Wrench}
          title="Under Construction" 
          description="This page is being built and will be available soon." 
        />
      </div>
    </div>
  );
}
