import React, { useState } from 'react';
import { Button } from './Button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from './Toast';
import { FolderPlus, X, Check, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'document' | 'dataset' | 'region' | 'search' | 'analysis' | 'scenario_run' | 'map_view' | 'chat_answer' | 'note';
  payload: any;
}

export function AddToProjectDialog({ isOpen, onClose, itemType, payload }: Props) {
  const { addToast } = useToast();
  const [savingId, setSavingId] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: async () => {
      // Mock API
      await new Promise(r => setTimeout(r, 400));
      return [
        { id: 'proj-1', title: 'Urban Sprawl Analysis NCR', role: 'owner' },
        { id: 'proj-2', title: 'Dispute Resolution Policies', role: 'editor' },
        { id: 'proj-3', title: 'Haryana Dataset Collection', role: 'viewer' } // cannot add to viewer
      ];
    },
    enabled: isOpen
  });

  const handleAdd = async (projectId: string) => {
    setSavingId(projectId);
    try {
      // Mock API post to /projects/:id/items
      await new Promise(r => setTimeout(r, 600));
      addToast({ type: 'success', title: 'Added to project successfully.' });
      onClose();
    } catch (e: any) {
      addToast({ type: 'error', title: 'Failed to add item.' });
    } finally {
      setSavingId(null);
    }
  };

  if (!isOpen) return null;

  const validProjects = projects?.filter(p => p.role !== 'viewer') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900 flex items-center"><FolderPlus className="w-5 h-5 mr-2 text-primary-600" /> Save to Workspace</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900 rounded-md hover:bg-neutral-100 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-4 bg-neutral-50 border-b border-neutral-100 text-sm text-neutral-600">
          Saving <span className="font-semibold text-neutral-900 uppercase text-xs">{itemType.replace('_', ' ')}</span> to a project.
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
          ) : validProjects.length === 0 ? (
            <div className="text-center p-6 text-neutral-500 text-sm">
              You don't have any projects with edit access yet.<br/>
              <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => { onClose(); window.location.href = '/workspace'; }}>Create a Project</Button>
            </div>
          ) : (
            validProjects.map(proj => (
              <button 
                key={proj.id} 
                onClick={() => handleAdd(proj.id)}
                disabled={!!savingId}
                className="w-full text-left p-3 border rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors flex items-center justify-between group disabled:opacity-50"
              >
                <div>
                  <div className="font-medium text-sm text-neutral-900">{proj.title}</div>
                  <div className="text-xs text-neutral-500 capitalize">{proj.role}</div>
                </div>
                {savingId === proj.id ? <Loader2 className="w-4 h-4 animate-spin text-primary-600" /> : <PlusCircle className="w-4 h-4 text-neutral-300 group-hover:text-primary-600 hidden group-hover:block" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PlusCircle(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
}
