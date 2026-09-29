import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Tabs } from '@/components/ui/Tabs';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Banner } from '@/components/ui/Banner';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { Lightbulb, Calendar, Edit2, Users, FileText, Plus, X, Search, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_CHALLENGES = [
  { id: 'chal-1', title: 'Urban Sprawl Mitigation Hackathon', organiser: 'Ministry of Housing', type: 'Hackathons', status: 'Open', deadline: '2024-11-01', desc: 'Develop AI models to predict peri-urban expansion using satellite imagery.', tags: ['AI', 'GIS'], illustrative: true, isRegistered: false },
  { id: 'chal-2', title: 'Land Dispute Resolution Grant', organiser: 'Dept of Justice', type: 'Research grants', status: 'Upcoming', deadline: '2025-01-15', desc: 'Funding for research into procedural bottlenecks in property disputes.', tags: ['Legal', 'Policy'], illustrative: true, isRegistered: true },
  { id: 'chal-3', title: 'Digital Land Records Pilot', organiser: 'DILRMP', type: 'Pilot projects', status: 'Closed', deadline: '2023-12-01', desc: 'Blockchain registry proof of concept for rural titles.', tags: ['Blockchain', 'Records'], illustrative: true, isRegistered: false }
];

const schema = z.object({
  title: z.string().min(5),
  organiser: z.string().min(2),
  type: z.string(),
  status: z.enum(['Open', 'Upcoming', 'Closed']),
  deadline: z.string(),
  desc: z.string().min(10)
});

export default function Innovation() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('All');
  const [selectedChal, setSelectedChal] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [q, setQ] = useState('');
  
  const isOfficial = user?.role === 'official' || user?.role === 'system_admin';

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  const { data: challenges = MOCK_CHALLENGES } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return MOCK_CHALLENGES;
    }
  });

  const filtered = challenges.filter(c => {
    if (activeTab !== 'All' && c.type !== activeTab) return false;
    if (q && !c.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const featured = challenges.find(c => c.status === 'Open');

  const onSubmit = (data: any) => {
    addToast({ type: 'success', title: 'Challenge saved successfully.' });
    setIsEditing(false);
    reset();
  };

  const handleRegister = () => {
    if (!selectedChal) return;
    addToast({ type: 'success', title: 'Interest registered', message: "The organiser has been notified." });
    selectedChal.isRegistered = true;
    setSelectedChal({...selectedChal});
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200 pb-6">
        <PageHeader title="Innovation Portal" description="Discover grants, hackathons, and pilots pushing the boundary of land governance." />
        {isOfficial && <Button variant="primary" onClick={() => setIsEditing(true)}><Plus className="w-4 h-4 mr-2" /> Create Challenge</Button>}
      </div>

      {featured && (
        <div className="bg-primary-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg border border-primary-800">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Lightbulb className="w-48 h-48" /></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="text-primary-100 border-primary-400">Featured Deadline</Badge>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-300">{featured.type}</span>
              </div>
              <h2 className="text-2xl font-bold">{featured.title}</h2>
              <p className="text-primary-100 max-w-xl">{featured.desc}</p>
            </div>
            <div className="shrink-0 bg-white/10 backdrop-blur p-4 rounded-lg border border-white/20 text-center min-w-[160px]">
              <p className="text-xs text-primary-200 uppercase font-semibold mb-1">Closes In</p>
              <p className="text-3xl font-bold">14 Days</p>
              <Button variant="secondary" className="w-full mt-3 bg-white text-primary-900 hover:bg-neutral-100" onClick={() => setSelectedChal(featured)}>View Details</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          {['All', 'Hackathons', 'Research grants', 'Pilot projects', 'Knowledge competitions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <Input placeholder="Search..." className="pl-9 bg-white" value={q} onChange={e => setQ(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No challenges found" description="Try adjusting your filters or search query." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(chal => (
            <Card key={chal.id} className="flex flex-col hover:border-primary-300 transition-colors cursor-pointer group" onClick={() => setSelectedChal(chal)}>
              <CardContent className="p-5 flex flex-col h-full relative">
                {isOfficial && (
                  <button className="absolute top-4 right-4 p-1.5 bg-white border shadow-sm rounded-md text-neutral-400 hover:text-primary-600 hidden group-hover:block" onClick={(e) => { e.stopPropagation(); reset(chal); setIsEditing(true); }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-1 rounded">{chal.type}</span>
                  <div className="flex gap-1">
                    {chal.illustrative && <Badge variant="illustrative" className="text-[10px] py-0">Demo</Badge>}
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-neutral-900 leading-snug mb-2">{chal.title}</h3>
                <p className="text-sm text-neutral-500 mb-4 line-clamp-2 flex-1">{chal.desc}</p>
                
                <div className="pt-4 border-t border-neutral-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500 flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {chal.organiser}</span>
                    <span className={`font-semibold ${chal.status === 'Open' ? 'text-semantic-success' : chal.status === 'Upcoming' ? 'text-semantic-warning' : 'text-neutral-400'}`}>
                      {chal.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-500">
                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> Deadline</span>
                    <span className="font-medium text-neutral-700">{chal.deadline}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Drawer */}
      <Drawer isOpen={!!selectedChal} onClose={() => setSelectedChal(null)} position="right" title={selectedChal?.type || 'Details'}>
        {selectedChal && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pb-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedChal.status === 'Open' ? 'bg-semantic-success/10 text-semantic-success' : 'bg-neutral-100 text-neutral-600'}`}>{selectedChal.status}</span>
                  <span className="text-xs text-neutral-500 flex items-center"><Clock className="w-3 h-3 mr-1" /> Deadline: {selectedChal.deadline}</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 leading-tight mb-2">{selectedChal.title}</h2>
                <p className="text-sm text-neutral-500 font-medium">Organised by {selectedChal.organiser}</p>
              </div>

              <div className="space-y-6 text-sm text-neutral-700">
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Description</h4>
                  <p className="leading-relaxed">{selectedChal.desc} This is a placeholder for the extended description providing full context on the policy goals and expected outputs.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Eligibility & Rewards</h4>
                  <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                    <li>Open to researchers and tech startups.</li>
                    <li>Up to ₹50 Lakhs in seed funding.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2">Related Evidence</h4>
                  <div className="space-y-2">
                    <button className="flex items-center text-sm text-primary-600 hover:underline" onClick={() => navigate('/repository/doc-1')}><FileText className="w-4 h-4 mr-2" /> Master Plan 2031 Guidelines</button>
                    <button className="flex items-center text-sm text-primary-600 hover:underline" onClick={() => navigate('/datasets/ds-1')}><FileText className="w-4 h-4 mr-2" /> Historical Sprawl Dataset</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-neutral-200 mt-4 shrink-0">
              <Button 
                variant="primary" 
                className="w-full" 
                size="lg"
                onClick={handleRegister} 
                disabled={selectedChal.status !== 'Open' || selectedChal.isRegistered}
              >
                {selectedChal.status !== 'Open' ? 'Submissions Closed' : selectedChal.isRegistered ? 'Interest Registered ✓' : 'Express Interest'}
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create/Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
              <h2 className="font-semibold text-neutral-900">Manage Challenge</h2>
              <button onClick={() => { setIsEditing(false); reset(); }} className="p-1 text-neutral-400 hover:text-neutral-900"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                  <Input {...register('title')} className={errors.title ? 'border-semantic-error' : ''} />
                  {errors.title && <span className="text-xs text-semantic-error">Title required</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Organiser</label>
                    <Input {...register('organiser')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                    <select {...register('type')} className="w-full border-neutral-300 rounded-md shadow-sm text-sm">
                      <option value="Hackathons">Hackathon</option>
                      <option value="Research grants">Research Grant</option>
                      <option value="Pilot projects">Pilot Project</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                    <select {...register('status')} className="w-full border-neutral-300 rounded-md shadow-sm text-sm">
                      <option value="Open">Open</option><option value="Upcoming">Upcoming</option><option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Deadline</label>
                    <Input type="date" {...register('deadline')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description & Rules</label>
                  <textarea {...register('desc')} rows={5} className="w-full border-neutral-300 rounded-md shadow-sm text-sm resize-none" />
                </div>
              </div>
              <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-2 shrink-0">
                <Button variant="outline" type="button" onClick={() => { setIsEditing(false); reset(); }}>Cancel</Button>
                <Button variant="primary" type="submit">Save Challenge</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
