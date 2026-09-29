import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/components/ui/Banner';
import { Skeleton } from '@/components/ui/Skeleton';
import { AddToProjectDialog } from '@/components/ui/AddToProjectDialog';
import { ArrowLeft, MapIcon, BarChart3, Download, Plus, Lock, CheckCircle2, ShieldAlert, GitCommit } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [saveDialog, setSaveDialog] = useState(false);

  const { data: ds, isLoading } = useQuery({
    queryKey: ['dataset', id],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      return {
        id,
        title: id === 'ds-2' ? 'Property Tax Roll - High Resolution' : 'Land Dispute Records 2023',
        org: id === 'ds-2' ? 'Municipal Corp' : 'NJDG',
        description: 'Comprehensive tabular records containing temporal indicators mapped to geographic identifiers.',
        visibility: id === 'ds-2' ? 'restricted' : 'public',
        is_illustrative: id !== 'ds-2',
        indicators: ['tax_collection', 'property_value'],
        startYear: 2020,
        endYear: 2024
      };
    }
  });

  if (isLoading) return <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-40 mb-8" /><Skeleton className="h-96" /></div>;
  if (!ds) return null;

  const isRestricted = ds.visibility === 'restricted';
  const hasAccess = !isRestricted || can('dataset:read');

  if (!hasAccess) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <Card className="max-w-2xl mx-auto mt-12 overflow-hidden border-amber-200">
          <div className="bg-amber-50 p-6 flex flex-col items-center text-center border-b border-amber-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-amber-100">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">{ds.title}</h2>
            <p className="text-amber-800 mt-2 font-medium">Restricted Dataset</p>
          </div>
          <CardContent className="p-8 text-center space-y-6">
            <p className="text-neutral-600 max-w-md mx-auto">
              This dataset is marked as restricted and is only accessible to authorised officials. Your current role does not have the <code className="bg-neutral-100 px-1 rounded">dataset:read</code> permission.
            </p>
            <div className="bg-neutral-50 p-4 rounded-lg text-sm text-left max-w-md mx-auto space-y-2">
              <p className="font-semibold text-neutral-900">How to gain access:</p>
              <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                <li>Request elevation from a System Administrator</li>
                <li>Submit a data usage application outlining your research</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Permitted view
  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to datasets
      </button>

      {ds.is_illustrative && <Banner variant="caveat" message="This is an illustrative dataset generated for demonstration purposes." />}

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-8">
          <div>
            <div className="flex gap-2 mb-3">
              {ds.is_illustrative ? <Badge variant="illustrative">Illustrative</Badge> : <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sourced</Badge>}
              <Badge variant="outline">v2.1</Badge>
              {isRestricted && <Badge variant="error" className="bg-red-50 text-red-700 border-red-200"><Lock className="w-3 h-3 mr-1 inline" /> Restricted</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">{ds.title}</h1>
            <p className="text-neutral-500 mt-2 font-medium">{ds.org}</p>
          </div>

          <Tabs 
            tabs={[
              {
                id: 'overview',
                label: 'Overview',
                content: (
                  <div className="space-y-6">
                    <p className="text-neutral-700 leading-relaxed">{ds.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 bg-neutral-50">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Coverage Area</h4>
                        <div className="h-24 bg-primary-100 rounded-md border border-primary-200 flex items-center justify-center text-primary-700 text-xs font-semibold">
                          [Mini Map Thumbnail]
                        </div>
                      </div>
                      <div className="border rounded-lg p-4 bg-neutral-50">
                        <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">Indicators included</h4>
                        <div className="flex flex-wrap gap-2">
                          {ds.indicators.map(i => <Badge key={i} variant="secondary">{i}</Badge>)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'preview',
                label: 'Preview',
                content: (
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-3 border-b">region_id <Badge variant="outline" className="ml-2 text-[10px]">string</Badge></th>
                            <th className="px-4 py-3 border-b">year <Badge variant="outline" className="ml-2 text-[10px]">int</Badge></th>
                            <th className="px-4 py-3 border-b">value <Badge variant="outline" className="ml-2 text-[10px]">float</Badge></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {[1,2,3,4,5].map(i => (
                            <tr key={i} className="hover:bg-neutral-50">
                              <td className="px-4 py-3 font-medium">IND-DEL-{i.toString().padStart(3,'0')}</td>
                              <td className="px-4 py-3">2023</td>
                              <td className="px-4 py-3">{(Math.random() * 100).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3 bg-neutral-50 border-t text-xs text-neutral-500 text-center">Showing first 5 rows of 1,245</div>
                  </div>
                )
              },
              {
                id: 'versions',
                label: 'Versions',
                content: (
                  <div className="space-y-6">
                    <div className="relative pl-6 border-l-2 border-neutral-200 space-y-8">
                      <div>
                        <div className="absolute w-4 h-4 bg-primary-600 rounded-full -left-[9px]" />
                        <h4 className="font-bold text-neutral-900">v2.1 <span className="text-neutral-400 font-normal text-sm ml-2">Current • Sep 2024</span></h4>
                        <p className="text-sm text-neutral-600 mt-1">Added 2023 temporal data points and fixed null region IDs.</p>
                        <div className="mt-2 text-xs font-mono bg-neutral-100 px-2 py-1 rounded inline-block text-neutral-500 border">sha256: 8f4e...9a21</div>
                      </div>
                      <div className="opacity-60">
                        <div className="absolute w-3 h-3 bg-neutral-400 rounded-full -left-[7px]" />
                        <h4 className="font-bold text-neutral-900">v2.0 <span className="text-neutral-400 font-normal text-sm ml-2">Jan 2024</span></h4>
                        <p className="text-sm text-neutral-600 mt-1">Major schema update merging separate tables.</p>
                      </div>
                    </div>
                  </div>
                )
              },
              {
                id: 'quality',
                label: 'Quality',
                content: (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Completeness Matrix</h4>
                    <div className="grid grid-cols-4 gap-1 max-w-sm">
                      {['', '2021', '2022', '2023', 'region_id', '100%', '100%', '100%', 'value', '98%', '99%', '95%'].map((v, i) => (
                        <div key={i} className={`p-2 text-center text-xs ${i < 4 || i % 4 === 0 ? 'font-semibold text-neutral-500 bg-neutral-50' : 'bg-emerald-100 text-emerald-800 font-medium'}`}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              }
            ]} 
          />
        </div>

        {/* Right Rail */}
        <div className="w-full xl:w-80 shrink-0 space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="primary" className="w-full justify-start"><Download className="w-4 h-4 mr-3" /> Download CSV</Button>
              <Button variant="outline" className="w-full justify-start text-neutral-700" onClick={() => navigate('/map')}><MapIcon className="w-4 h-4 mr-3" /> Open in Map</Button>
              <Button variant="outline" className="w-full justify-start text-neutral-700" onClick={() => navigate('/analytics')}><BarChart3 className="w-4 h-4 mr-3" /> Open in Analytics</Button>
              <Button variant="ghost" className="w-full justify-start text-neutral-600" onClick={() => setSaveDialog(true)}><Plus className="w-4 h-4 mr-3" /> Add to Workspace</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Lineage</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-3">
              <div className="flex items-start text-neutral-600">
                <GitCommit className="w-4 h-4 mr-2 mt-0.5 text-neutral-400" />
                <div><span className="font-medium text-neutral-900 block">Derived from</span> Raw Survey Roll 2020-2024</div>
              </div>
              <div className="flex items-start text-neutral-600">
                <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-emerald-500" />
                <div><span className="font-medium text-neutral-900 block">Referenced by</span> 3 Policy Documents</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <AddToProjectDialog isOpen={saveDialog} onClose={() => setSaveDialog(false)} itemType="dataset" payload={{ id }} />
    </div>
  );
}
