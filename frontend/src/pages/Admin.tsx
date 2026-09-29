import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Tooltip } from '@/components/ui/Tooltip';
import { Drawer } from '@/components/ui/Drawer';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';
import { 
  UploadCloud, FileText, CheckCircle, XCircle, AlertTriangle, User, Shield, 
  Activity, Database, Brain, Code, Eye, Settings, Clock, Check
} from 'lucide-react';

// Mock Data
const MOCK_QUEUE = [
  { id: '1', title: 'Survey Roll 2024.pdf', uploader: 'ajay@gov.in', age: '2 hours ago', type: 'Document', confidence: 85 },
  { id: '2', title: 'Agri_Stats_Haryana.csv', uploader: 'data_team@gov.in', age: '1 day ago', type: 'Dataset', confidence: 60 }
];

const MOCK_USERS = [
  { id: '1', email: 'admin@gov.in', role: 'system_admin', active: true },
  { id: '2', email: 'analyst@research.org', role: 'researcher', active: true },
  { id: '3', email: 'guest@public.in', role: 'guest', active: false }
];

const MOCK_AUDIT = [
  { id: 'a1', actor: 'admin@gov.in', action: 'Approved Document', entity: 'doc_123', date: '2024-10-15 10:23', meta: { "doc_title": "Master Plan 2031", "confidence_score": 92 } },
  { id: 'a2', actor: 'analyst@research.org', action: 'Ran Scenario', entity: 'scen_45', date: '2024-10-15 09:12', meta: { "region": "DIST-002", "params": {"restriction": 10} } }
];

export default function Admin() {
  const { tab = 'queue' } = useParams<{ tab: string }>();
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const { addToast } = useToast();

  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'review'>('idle');
  const [selectedAudit, setSelectedAudit] = useState<any>(null);
  const [reindexing, setReindexing] = useState(false);

  // Auth Guard
  if (!user || (!can('document:approve') && !can('admin:users'))) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-20 bg-red-50 text-red-800 rounded-xl border border-red-200">
        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">403 Forbidden</h2>
        <p>You do not have permission to access the administration portal.</p>
        <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const handleUpload = () => {
    setUploadState('uploading');
    setTimeout(() => setUploadState('review'), 1500);
  };

  const TABS = [
    { id: 'queue', label: 'Approval Queue', icon: FileText, show: can('document:approve') },
    { id: 'users', label: 'Users & Roles', icon: User, show: can('admin:users') },
    { id: 'audit', label: 'Audit Log', icon: Shield, show: can('admin:audit') },
    { id: 'health', label: 'System Health', icon: Activity, show: can('admin:audit') },
    { id: 'integrations', label: 'API Integrations', icon: Code, show: can('admin:audit') }
  ].filter(t => t.show);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-neutral-100">
      
      {/* Side Nav */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col shrink-0 z-10">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-800 flex items-center"><Settings className="w-5 h-5 mr-2" /> Administration</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => navigate(`/admin/${t.id}`)}
              className={`w-full text-left px-6 py-3 flex items-center text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600' : 'text-neutral-600 hover:bg-neutral-50'}`}
            >
              <t.icon className={`w-4 h-4 mr-3 ${tab === t.id ? 'text-primary-600' : 'text-neutral-400'}`} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {tab === 'queue' && (
            <div className="space-y-6">
              <PageHeader title="Upload & Approvals" description="Ingest new evidence and verify AI-extracted metadata." />
              
              {uploadState === 'idle' && (
                <div 
                  className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center bg-white hover:bg-primary-50 hover:border-primary-300 transition-colors cursor-pointer"
                  onClick={handleUpload}
                >
                  <UploadCloud className="w-12 h-12 mx-auto text-primary-500 mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">Drag and drop documents or datasets</h3>
                  <p className="text-sm text-neutral-500">Supports PDF, CSV, TXT (Max 50MB). Auto-extraction will begin immediately.</p>
                </div>
              )}

              {uploadState === 'uploading' && (
                <Card className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4" />
                  <h3 className="font-medium text-neutral-900">Extracting and analyzing with AI...</h3>
                </Card>
              )}

              {uploadState === 'review' && (
                <div className="flex h-[600px] border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {/* Left: Preview */}
                  <div className="w-1/2 bg-neutral-800 p-4 flex flex-col">
                    <div className="bg-neutral-900 rounded p-4 flex-1 text-neutral-300 font-mono text-xs overflow-y-auto leading-relaxed">
                      [Document Preview: District Gazette 2024]<br/><br/>
                      Section 1: Land Conversion Rates<br/>
                      The conversion of agricultural land to built-up area has accelerated...
                    </div>
                  </div>
                  {/* Right: AI Metadata Form */}
                  <div className="w-1/2 flex flex-col">
                    <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex justify-between items-center">
                      <h3 className="font-semibold flex items-center"><Brain className="w-4 h-4 mr-2 text-fuchsia-600" /> AI Extraction Review</h3>
                      <Badge variant="outline" className="border-fuchsia-200 text-fuchsia-700 bg-fuchsia-50">92% Confidence</Badge>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-5">
                      <div>
                        <label className="flex justify-between text-sm font-medium text-neutral-700 mb-1">
                          Title <Tooltip content="High confidence"><span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" /></Tooltip>
                        </label>
                        <Input defaultValue="District Gazette 2024" />
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 relative">
                        <label className="flex justify-between text-sm font-medium text-amber-900 mb-1">
                          Date <Tooltip content="Low confidence (Multiple dates found)"><span className="w-2 h-2 rounded-full bg-amber-500 mt-1 animate-pulse" /></Tooltip>
                        </label>
                        <Input defaultValue="2024-03-01" className="border-amber-300 bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Visibility</label>
                        <select className="w-full border-neutral-300 rounded-md text-sm bg-white">
                          <option value="public">Public</option>
                          <option value="internal">Internal Only</option>
                          <option value="restricted">Restricted</option>
                        </select>
                        <p className="text-xs text-neutral-500 mt-1 flex items-start"><AlertTriangle className="w-3 h-3 mr-1 mt-0.5 text-amber-500" /> Restricted items will never appear in public search or AI context.</p>
                      </div>
                    </div>
                    <div className="p-4 border-t border-neutral-200 flex justify-end gap-2 bg-neutral-50">
                      <Button variant="outline" onClick={() => setUploadState('idle')}><XCircle className="w-4 h-4 mr-2" /> Reject</Button>
                      <Button variant="primary" className="bg-emerald-600" onClick={() => { addToast({type:'success', title:'Approved & Ingested'}); setUploadState('idle'); }}><CheckCircle className="w-4 h-4 mr-2" /> Approve & Ingest</Button>
                    </div>
                  </div>
                </div>
              )}

              <Card>
                <CardHeader className="pb-3 border-b"><CardTitle>Pending Queue</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-500">
                      <tr><th className="px-6 py-3">File</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Uploader</th><th className="px-6 py-3">AI Confidence</th><th className="px-6 py-3">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {MOCK_QUEUE.map(q => (
                        <tr key={q.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 font-medium text-neutral-900">{q.title}<div className="text-xs text-neutral-500 font-normal">{q.age}</div></td>
                          <td className="px-6 py-4"><Badge variant="outline">{q.type}</Badge></td>
                          <td className="px-6 py-4 text-neutral-600">{q.uploader}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-16 h-1.5 bg-neutral-200 rounded-full mr-2"><div className={`h-full rounded-full ${q.confidence > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${q.confidence}%`}} /></div>
                              <span className="text-xs font-medium">{q.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4"><Button size="sm" variant="outline" onClick={() => setUploadState('review')}>Review</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-6">
              <PageHeader title="Users & Roles" description="Manage platform access and RBAC." />
              <Card>
                <CardHeader className="pb-3 border-b flex flex-row justify-between items-center">
                  <CardTitle>Directory</CardTitle>
                  <Button size="sm"><User className="w-4 h-4 mr-2" /> Invite User</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-500">
                      <tr><th className="px-6 py-3">Email</th><th className="px-6 py-3">Role</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {MOCK_USERS.map(u => (
                        <tr key={u.id}>
                          <td className="px-6 py-4 font-medium">{u.email}</td>
                          <td className="px-6 py-4">
                            <select className="border-neutral-300 rounded text-xs py-1" defaultValue={u.role}>
                              <option value="system_admin">System Admin</option>
                              <option value="data_admin">Data Admin</option>
                              <option value="researcher">Researcher</option>
                              <option value="official">Official</option>
                              <option value="guest">Guest</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            {u.active ? <Badge variant="success" className="bg-emerald-50 text-emerald-700">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                          </td>
                          <td className="px-6 py-4">
                            <Button size="sm" variant="ghost" className={u.active ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}>{u.active ? 'Deactivate' : 'Activate'}</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === 'audit' && (
            <div className="space-y-6">
              <PageHeader title="Audit Log" description="Immutable record of system actions." />
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-500">
                      <tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Actor</th><th className="px-6 py-3">Action</th><th className="px-6 py-3">Entity</th><th className="px-6 py-3"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {MOCK_AUDIT.map(a => (
                        <tr key={a.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-3 text-neutral-500 text-xs">{a.date}</td>
                          <td className="px-6 py-3">{a.actor}</td>
                          <td className="px-6 py-3 font-medium">{a.action}</td>
                          <td className="px-6 py-3"><Badge variant="outline">{a.entity}</Badge></td>
                          <td className="px-6 py-3 text-right"><Button size="sm" variant="ghost" onClick={() => setSelectedAudit(a)}><Eye className="w-4 h-4" /></Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Drawer isOpen={!!selectedAudit} onClose={() => setSelectedAudit(null)} position="right" title="Audit Payload">
                {selectedAudit && (
                  <div className="bg-neutral-900 rounded-lg p-4 overflow-auto text-emerald-400 font-mono text-xs whitespace-pre-wrap h-[500px]">
                    {JSON.stringify(selectedAudit.meta, null, 2)}
                  </div>
                )}
              </Drawer>
            </div>
          )}

          {tab === 'health' && (
            <div className="space-y-6">
              <PageHeader title="System Health" description="Infrastructure metrics and vector store synchronization." />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-4 flex items-center"><Database className="w-8 h-8 text-emerald-500 mr-4" /><div><p className="text-xs text-neutral-500 font-medium">PostgreSQL</p><p className="font-bold">Healthy (12ms)</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center"><Brain className="w-8 h-8 text-emerald-500 mr-4" /><div><p className="text-xs text-neutral-500 font-medium">AI Service</p><p className="font-bold">Healthy (45ms)</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center"><Layers className="w-8 h-8 text-blue-500 mr-4" /><div><p className="text-xs text-neutral-500 font-medium">Vector Chunks</p><p className="font-bold">142,504</p></div></CardContent></Card>
                <Card><CardContent className="p-4 flex items-center"><Clock className="w-8 h-8 text-neutral-500 mr-4" /><div><p className="text-xs text-neutral-500 font-medium">Last Ingest</p><p className="font-bold">2 hours ago</p></div></CardContent></Card>
              </div>

              <Card className="border-red-200">
                <CardHeader className="bg-red-50 pb-3 border-b border-red-100"><CardTitle className="text-red-900 text-sm">Danger Zone</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-neutral-900 mb-1">Rebuild Vector Index</h4>
                  <p className="text-sm text-neutral-600 mb-4">This will clear and regenerate all pgvector embeddings. This process is intensive and may cause temporary search degradation.</p>
                  <Button variant="primary" className="bg-red-600 hover:bg-red-700 border-none" onClick={() => { setReindexing(true); setTimeout(() => { setReindexing(false); addToast({type:'success', title:'Index rebuilt'}); }, 2000); }} disabled={reindexing}>
                    {reindexing ? 'Reindexing...' : 'Trigger Reindex'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="space-y-6">
              <PageHeader title="Integrations (REST API)" description="Integration-ready APIs for other government systems." />
              
              <div className="flex gap-4">
                <Button variant="primary" onClick={() => window.open('/api/v1/docs', '_blank')}><ExternalLink className="w-4 h-4 mr-2" /> Open Swagger UI</Button>
                <Button variant="outline"><Code className="w-4 h-4 mr-2" /> Generate API Key</Button>
              </div>

              <Card>
                <CardHeader className="pb-2 border-b bg-neutral-50"><CardTitle className="text-sm font-mono flex items-center"><Badge className="mr-2 bg-blue-100 text-blue-800">GET</Badge> /api/v1/regions/:id/summary</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="bg-neutral-900 text-neutral-300 font-mono text-xs p-4 overflow-x-auto rounded-b-lg">
                    curl -X GET "https://api.bhuniti.gov.in/v1/regions/DIST-002/summary" \<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY"
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
