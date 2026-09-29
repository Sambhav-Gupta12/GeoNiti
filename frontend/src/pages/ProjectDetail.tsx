import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Folder, Users, FileText, Database, MapIcon, Sparkles, Download, MessageSquare, DragHandleDots2Icon } from 'lucide-react';

const MOCK_ITEMS = [
  { id: '1', type: 'document', title: 'Master Plan 2031', date: 'Oct 12', payload: { id: 'doc-1' } },
  { id: '2', type: 'map_view', title: 'Built-up Area Expansion NCR', date: 'Oct 14', payload: { layer: 'built_up', year: '2023', region: 'DIST-002' } },
  { id: '3', type: 'scenario_run', title: 'Conversion Restriction 5yr', date: 'Oct 15', payload: { region: 'DIST-002' } },
  { id: '4', type: 'chat_answer', title: 'Summary of dispute drivers', date: 'Oct 15', payload: { text: 'Disputes are primarily driven by unclear inheritance lines...' } }
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('items');

  // Simple hardcoded checks
  const isViewer = id === 'proj-3'; 
  const projName = id === 'proj-1' ? 'Urban Sprawl Analysis NCR' : id === 'proj-2' ? 'Dispute Resolution Policies' : 'Haryana Dataset Collection';

  const handleReopen = (item: any) => {
    switch(item.type) {
      case 'document': navigate(`/repository/${item.payload.id}`); break;
      case 'map_view': navigate(`/map?layer=${item.payload.layer}&year=${item.payload.year}&region=${item.payload.region}`); break;
      case 'scenario_run': navigate(`/scenarios?region=${item.payload.region}`); break;
      default: break;
    }
  };

  const exportSummary = () => {
    // Generate Markdown export
    const content = `# Project: ${projName}\n\n## Evidence Collected\n- Master Plan 2031\n- Built-up Area map view\n- Scenario Run: Restriction 5yr\n\nGenerated via Antigravity Ideation Portal.`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${id}.md`;
    a.click();
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <Breadcrumbs items={[{label: 'Workspaces', href: '/workspace'}, {label: projName}]} className="mb-2" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-primary-100 flex items-center justify-center shrink-0">
              <Folder className="w-6 h-6 text-primary-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{projName}</h1>
              <div className="flex items-center text-sm text-neutral-500 mt-1">
                {isViewer ? <Badge variant="outline" className="mr-2 border-semantic-warning/20 text-semantic-warning bg-semantic-warning/10">View Only</Badge> : <Badge variant="outline" className="mr-2">Editor</Badge>}
                <Users className="w-4 h-4 mr-1" /> 2 members
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSummary}><Download className="w-4 h-4 mr-2" /> Export Summary</Button>
        </div>
      </div>

      <Tabs 
        activeId={activeTab}
        onChange={setActiveTab}
        tabs={[
          {
            id: 'items',
            label: 'Saved Items',
            content: (
              <div className="space-y-4">
                {MOCK_ITEMS.map((item, i) => (
                  <div key={item.id} className="flex bg-white border border-neutral-200 rounded-lg p-3 items-center hover:border-primary-300 transition-colors group">
                    <div className="cursor-grab text-neutral-300 hover:text-neutral-500 p-2 -ml-2 mr-1">
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3C5.5 3.82843 4.82843 4.5 4 4.5C3.17157 4.5 2.5 3.82843 2.5 3C2.5 2.17157 3.17157 1.5 4 1.5C4.82843 1.5 5.5 2.17157 5.5 3ZM12.5 3C12.5 3.82843 11.8284 4.5 11 4.5C10.1716 4.5 9.5 3.82843 9.5 3C9.5 2.17157 10.1716 1.5 11 1.5C11.8284 1.5 12.5 2.17157 12.5 3ZM5.5 7.5C5.5 8.32843 4.82843 9 4 9C3.17157 9 2.5 8.32843 2.5 7.5C2.5 6.67157 3.17157 6 4 6C4.82843 6 5.5 6.67157 5.5 7.5ZM11 9C11.8284 9 12.5 8.32843 12.5 7.5C12.5 6.67157 11.8284 6 11 6C10.1716 6 9.5 6.67157 9.5 7.5C9.5 8.32843 10.1716 9 11 9ZM5.5 12C5.5 12.8284 4.82843 13.5 4 13.5C3.17157 13.5 2.5 12.8284 2.5 12C2.5 11.1716 3.17157 10.5 4 10.5C4.82843 10.5 5.5 11.1716 5.5 12ZM11 13.5C11.8284 13.5 12.5 12.8284 12.5 12C12.5 11.1716 11.8284 10.5 11 10.5C10.1716 10.5 9.5 11.1716 9.5 12C9.5 12.8284 10.1716 13.5 11 13.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </div>
                    
                    <div className="w-8 h-8 rounded bg-neutral-100 flex items-center justify-center mr-3 shrink-0">
                      {item.type === 'document' && <FileText className="w-4 h-4 text-primary-600" />}
                      {item.type === 'map_view' && <MapIcon className="w-4 h-4 text-secondary-600" />}
                      {item.type === 'scenario_run' && <Sparkles className="w-4 h-4 text-semantic-modelled" />}
                      {item.type === 'chat_answer' && <MessageSquare className="w-4 h-4 text-semantic-info" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-neutral-900 truncate">{item.title}</h4>
                      {item.type === 'chat_answer' ? (
                        <p className="text-xs text-neutral-500 truncate mt-0.5">{item.payload.text}</p>
                      ) : (
                        <p className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider mt-1">{item.type.replace('_', ' ')}</p>
                      )}
                    </div>
                    
                    <div className="text-xs text-neutral-400 mr-4 whitespace-nowrap">{item.date}</div>
                    
                    <div className="flex gap-2">
                      {!isViewer && <Button variant="ghost" size="sm" className="hidden group-hover:flex">Comment</Button>}
                      {item.type !== 'chat_answer' && <Button variant="secondary" size="sm" onClick={() => handleReopen(item)}>Reopen</Button>}
                    </div>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: 'notes',
            label: 'Project Notes',
            content: (
              <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                <div className="p-2 border-b bg-neutral-50 text-xs text-neutral-500 font-medium">Markdown Supported • Autosaves</div>
                <textarea 
                  className="w-full h-96 p-4 border-none focus:ring-0 text-sm font-mono leading-relaxed resize-none" 
                  placeholder="Jot down hypotheses, research directions, and synthesis notes..."
                  disabled={isViewer}
                  defaultValue="# Initial Hypotheses\n- Urban expansion is predominantly occurring along the NH-48 corridor.\n- Check dispute rates mapped to these exact geometries."
                />
              </div>
            )
          },
          {
            id: 'activity',
            label: 'Activity',
            content: (
              <div className="space-y-4">
                <div className="flex gap-4 text-sm">
                  <div className="w-8 text-neutral-400 text-xs font-semibold pt-1">Today</div>
                  <div className="border-l-2 border-neutral-200 pl-4 pb-4">
                    <p><span className="font-semibold text-neutral-900">You</span> added <span className="font-medium">Scenario Run: Restriction 5yr</span></p>
                    <p className="text-xs text-neutral-500 mt-0.5">2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="w-8 text-neutral-400 text-xs font-semibold pt-1">Oct 14</div>
                  <div className="border-l-2 border-neutral-200 pl-4 pb-4">
                    <p><span className="font-semibold text-neutral-900">Alex</span> annotated <span className="font-medium">Master Plan 2031</span></p>
                    <div className="bg-neutral-50 p-2 mt-2 rounded border text-neutral-600 text-xs italic border-l-2 border-l-primary-400">"This section on peri-urban zoning directly contradicts the 2018 gazette."</div>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: 'members',
            label: 'Members',
            content: (
              <div className="max-w-2xl space-y-6">
                {!isViewer && (
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm">Add Member</CardTitle></CardHeader>
                    <CardContent className="flex gap-2">
                      <Input placeholder="Email address..." className="flex-1" />
                      <select className="border-neutral-300 rounded-md text-sm"><option>Editor</option><option>Viewer</option></select>
                      <Button>Invite</Button>
                    </CardContent>
                  </Card>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm">ME</div>
                      <div><p className="font-semibold text-sm text-neutral-900">You</p><p className="text-xs text-neutral-500">Owner</p></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-sm">AL</div>
                      <div><p className="font-semibold text-sm text-neutral-900">Alex L.</p><p className="text-xs text-neutral-500">Editor</p></div>
                    </div>
                    {!isViewer && <Button variant="ghost" size="sm" className="text-semantic-error hover:text-semantic-error hover:bg-semantic-error/10">Remove</Button>}
                  </div>
                </div>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
