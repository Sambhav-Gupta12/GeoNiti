import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Folder, Search, Plus, Users, Clock, Edit2, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const MOCK_PROJECTS = [
  { id: 'proj-1', title: 'Urban Sprawl Analysis NCR', desc: 'Evaluating the conversion of cropland to built-up area around Delhi.', role: 'owner', items: 12, updated: '2 hours ago', members: ['me', 'user2'] },
  { id: 'proj-2', title: 'Dispute Resolution Policies', desc: 'Synthesizing gazettes and dispute rates for Northern districts.', role: 'editor', items: 5, updated: '1 day ago', members: ['user3', 'me'] },
  { id: 'proj-3', title: 'Haryana Dataset Collection', desc: 'Raw data dumps and preliminary correlations.', role: 'viewer', items: 23, updated: '1 week ago', members: ['admin', 'me'] }
];

export default function Workspace() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: projects = MOCK_PROJECTS, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return MOCK_PROJECTS;
    }
  });

  const filtered = projects.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Workspaces" description="Organize your evidence, datasets, map views, and scenarios." />
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Project</Button>
      </div>

      <div className="flex gap-4 items-center bg-white p-2 rounded-lg border border-neutral-200 shadow-sm max-w-md">
        <Search className="w-4 h-4 ml-2 text-neutral-400 shrink-0" />
        <Input placeholder="Search projects..." value={q} onChange={e => setQ(e.target.value)} className="border-none h-8 shadow-none focus:ring-0 px-0" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState 
          icon={Folder}
          title={q ? "No projects found" : "Start your first project"} 
          description="Projects help you collect evidence, save map views, and collaborate with your team."
          action={{ label: 'Create Project', onClick: () => setIsCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(proj => (
            <Card key={proj.id} className="cursor-pointer hover:border-primary-400 transition-colors" onClick={() => navigate(`/workspace/${proj.id}`)}>
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded bg-primary-50 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex bg-neutral-100 rounded px-2 py-1 text-[10px] font-semibold uppercase text-neutral-500 items-center">
                    {proj.role === 'viewer' ? <Lock className="w-3 h-3 mr-1" /> : <Edit2 className="w-3 h-3 mr-1" />}
                    {proj.role}
                  </div>
                </div>
                <h3 className="font-semibold text-neutral-900 leading-snug mb-1">{proj.title}</h3>
                <p className="text-xs text-neutral-500 mb-4 line-clamp-2">{proj.desc}</p>
                <div className="mt-auto pt-4 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-400 font-medium">
                  <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {proj.members.length} members</span>
                  <span>{proj.items} items</span>
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {proj.updated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 p-6">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Project Name</label>
                <Input placeholder="e.g. Land Use Committee 2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea className="w-full border-neutral-300 rounded-md shadow-sm text-sm" rows={3} placeholder="What is this project about?" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsCreateOpen(false)}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
