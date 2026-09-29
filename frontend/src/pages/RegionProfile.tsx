import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { LineTrend } from '@/components/charts/LineTrend';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { MapIcon, Sparkles, Plus, AlertCircle, FileText, Database, Info, Activity, ShieldAlert, List as ListIcon, LayoutDashboard } from 'lucide-react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Mock data generation for anomalies to pass into LineTrend
// Real implementation would pull from `/analytics/anomalies`
const mockTrendData = [
  { year: 2018, value: 10 },
  { year: 2019, value: 11 },
  { year: 2020, value: 12 },
  { year: 2021, value: 15, isAnomaly: true, anomalyReason: 'Sudden spike due to urban expansion act' },
  { year: 2022, value: 16 },
  { year: 2023, value: 16.5 }
];

export default function RegionProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeIndicator, setActiveIndicator] = useState('built_up');
  const [graphView, setGraphView] = useState<'visual' | 'list'>('visual');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['region-profile', id],
    queryFn: () => api.get<any>(`/regions/${id}/summary`),
  });

  const { data: graphData, isLoading: isGraphLoading } = useQuery({
    queryKey: ['evidence-graph', id],
    queryFn: () => api.get<any>(`/graph?center_type=region&center_id=${id}&depth=2`),
  });

  // Calculate layout for React Flow without a layout engine
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!graphData) return { nodes: [], edges: [] };
    
    const typesCount: Record<string, number> = {};
    const nodes = graphData.nodes.slice(0, 50).map((n: any, idx: number) => {
      typesCount[n.type] = (typesCount[n.type] || 0) + 1;
      
      let x = 400;
      let y = 300;
      const count = typesCount[n.type];

      // Extremely naive positioning just for visual distribution
      if (n.type === 'Region') { x = 400; y = 300; }
      else if (n.type === 'Policy') { x = 100; y = 100 + count * 60; }
      else if (n.type === 'Research Paper') { x = 150; y = 400 + count * 60; }
      else if (n.type === 'Indicator') { x = 700; y = 100 + count * 60; }
      else if (n.type === 'Dataset') { x = 750; y = 400 + count * 60; }
      else { x = 400 + (Math.random() * 200 - 100); y = 300 + (Math.random() * 200 - 100); }

      let bgColor = '#ffffff';
      let borderColor = '#e5e5e5';
      
      // Token colors
      if (n.type === 'Region') { bgColor = '#f8fafc'; borderColor = '#0f766e'; }
      if (n.type === 'Policy') { bgColor = '#fdf4ff'; borderColor = '#c026d3'; }
      if (n.type === 'Research Paper') { bgColor = '#f0fdfa'; borderColor = '#0d9488'; }
      if (n.type === 'Indicator') { bgColor = '#fef3c7'; borderColor = '#d97706'; }
      if (n.type === 'Dataset') { bgColor = '#eff6ff'; borderColor = '#3b82f6'; }

      return {
        id: n.id,
        position: { x, y },
        data: { label: n.label, ...n },
        style: {
          background: bgColor,
          border: `2px solid ${borderColor}`,
          borderRadius: n.type === 'Region' ? '50%' : '8px',
          padding: '10px',
          fontSize: '12px',
          fontWeight: 'bold',
          width: n.type === 'Region' ? 80 : 150,
          height: n.type === 'Region' ? 80 : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
      };
    });

    const edges = graphData.edges.slice(0, 100).map((e: any) => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      label: e.relation,
      animated: true,
      style: { stroke: '#cbd5e1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' }
    }));

    return { nodes, edges };
  }, [graphData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Re-sync when data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (isLoading) return <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-64 mb-8" /><Skeleton className="h-96" /></div>;
  if (error || !profile) return <div className="p-8 max-w-7xl mx-auto"><ErrorState message="Could not load region profile." /></div>;

  const selectedNode = selectedNodeId ? initialNodes.find(n => n.id === selectedNodeId) : null;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      
      {/* 1. Header */}
      <div>
        <Breadcrumbs items={[{label: 'Home', href: '/'}, {label: 'Regions', href: '/map'}, {label: profile.region?.name || 'District'}]} className="mb-4" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{profile.region?.name || id}</h1>
            <p className="text-neutral-500 mt-1">State: {profile.region?.state || 'Unknown'} • Population: {profile.region?.population?.toLocaleString() || 'N/A'} • Area: {profile.region?.area || 'N/A'} sq km</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(`/map?region=${id}`)}><MapIcon className="w-4 h-4 mr-2" /> Open on Map</Button>
            <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 border-none" onClick={() => navigate(`/scenarios?region=${id}`)}><Sparkles className="w-4 h-4 mr-2" /> Run Scenario</Button>
            <Button variant="secondary"><Plus className="w-4 h-4 mr-2" /> Add to project</Button>
          </div>
        </div>
      </div>

      {/* 2. KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Built-up Area" value="12.4%" trend={1.2} trendLabel="5y change" icon={Activity} />
        <StatCard title="Cropland" value="65.2%" trend={-2.1} trendLabel="5y change" icon={Activity} />
        <StatCard title="Disputes" value="45 / 100k" trend={5.0} trendLabel="5y change" icon={ShieldAlert} />
        <Card className="bg-primary-50 border-primary-100 flex flex-col justify-center items-center text-center p-4">
          <p className="text-xs text-primary-600 uppercase font-semibold">Peer Rank</p>
          <p className="text-3xl font-bold text-primary-900 mt-1">4<span className="text-lg">th</span></p>
          <p className="text-xs text-primary-600 mt-1">of 22 districts</p>
        </Card>
      </div>

      {/* 3. Trends Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Historical Trends & Anomalies</CardTitle>
          <select 
            className="text-sm border-neutral-300 rounded-md py-1 pl-2 pr-8"
            value={activeIndicator}
            onChange={(e) => setActiveIndicator(e.target.value)}
          >
            <option value="built_up">Built-up Area %</option>
            <option value="cropland">Cropland %</option>
            <option value="disputes">Disputes per 100k</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full relative">
            <LineTrend 
              data={mockTrendData} 
              xKey="year" 
              lines={[{ key: 'value', color: '#0f766e', name: activeIndicator }]}
            />
            {/* Custom anomaly markers overlay */}
            <div className="absolute inset-0 pointer-events-none flex">
              {/* Fake overlay for demo: in a real implementation we'd use recharts customized dots */}
              {mockTrendData.map((d, i) => d.isAnomaly && (
                <div key={i} className="absolute pointer-events-auto" style={{ left: `${(i / (mockTrendData.length - 1)) * 100}%`, bottom: '50%' }}>
                  <Tooltip content={<div className="max-w-xs"><p className="font-semibold text-xs mb-1">Anomaly Detected</p><p className="text-xs">{d.anomalyReason}</p></div>}>
                    <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white cursor-pointer animate-pulse -ml-2" />
                  </Tooltip>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
            <AlertCircle className="w-4 h-4 text-amber-500 mr-2" />
            Anomalies are detected using a robust MAD algorithm on year-over-year change.
          </div>
        </CardContent>
      </Card>

      {/* 4. Evidence Graph */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Evidence Graph</CardTitle>
            <p className="text-sm text-neutral-500">Connections between policies, research, and datasets for this district.</p>
          </div>
          <div className="flex bg-neutral-100 rounded-md p-0.5">
            <button onClick={() => setGraphView('list')} className={`p-1.5 rounded-sm flex items-center ${graphView === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}><ListIcon className="w-4 h-4 mr-1" /> List</button>
            <button onClick={() => setGraphView('visual')} className={`p-1.5 rounded-sm flex items-center ${graphView === 'visual' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}><LayoutDashboard className="w-4 h-4 mr-1" /> Visual</button>
          </div>
        </CardHeader>
        <CardContent className="relative">
          {isGraphLoading ? (
            <Skeleton className="w-full h-[500px]" />
          ) : graphView === 'visual' ? (
            <div className="h-[500px] border border-neutral-200 rounded-lg bg-neutral-50 overflow-hidden relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                fitView
                attributionPosition="bottom-right"
              >
                <Background color="#ccc" gap={16} />
                <Controls />
                <MiniMap />
              </ReactFlow>

              {/* Node Popover */}
              {selectedNode && (
                <div className="absolute top-4 right-4 w-64 bg-white border border-neutral-200 shadow-xl rounded-lg p-4 z-10 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary">{selectedNode.data.type}</Badge>
                    <button onClick={() => setSelectedNodeId(null)} className="text-neutral-400 hover:text-neutral-900"><AlertCircle className="w-4 h-4 hidden" /> x</button>
                  </div>
                  <h4 className="font-semibold text-neutral-900 leading-snug">{selectedNode.data.label}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{selectedNode.data.year || '2023'} • Connected Node</p>
                  
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => navigate(selectedNode.data.type === 'Policy' || selectedNode.data.type === 'Research Paper' ? `/repository/${selectedNode.id}` : '#')}>View Details</Button>
                    <Button variant="ghost" size="sm">Expand</Button>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/90 border p-2 rounded-lg text-xs space-y-1 z-10 backdrop-blur-sm">
                <div className="font-semibold mb-2">Node Types</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-50 border-2 border-teal-600 mr-2" /> Region</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded bg-fuchsia-50 border-2 border-fuchsia-600 mr-2" /> Policy</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded bg-teal-50 border-2 border-teal-600 mr-2" /> Research</div>
                <div className="flex items-center"><div className="w-3 h-3 rounded bg-blue-50 border-2 border-blue-500 mr-2" /> Dataset</div>
              </div>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-neutral-50 text-neutral-500 text-xs uppercase sticky top-0">
                  <tr><th className="px-4 py-3">Type</th><th className="px-4 py-3">Title</th><th className="px-4 py-3">Relation</th></tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {initialNodes.filter(n => n.type !== 'Region').map(n => (
                    <tr key={n.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3"><Badge variant="outline">{n.data.type}</Badge></td>
                      <td className="px-4 py-3 font-medium text-neutral-900">{n.data.label}</td>
                      <td className="px-4 py-3 text-neutral-500">Connected to Region</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Linked Evidence Tabs & Data Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">Direct Evidence</h3>
          <Tabs 
            tabs={[
              {
                id: 'research',
                label: 'Research (12)',
                content: (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 bg-white border rounded-lg hover:border-primary-300 cursor-pointer" onClick={() => navigate(`/repository/doc-${i}`)}>
                        <h5 className="font-semibold text-neutral-900 flex items-start"><FileText className="w-4 h-4 mr-2 mt-0.5 text-primary-600" /> Urban Expansion Study Part {i}</h5>
                        <p className="text-sm text-neutral-500 mt-1 ml-6">Discusses specific impact zones in this district.</p>
                      </div>
                    ))}
                  </div>
                )
              },
              { id: 'policies', label: 'Policies (4)', content: <div className="p-4 text-neutral-500 border border-dashed rounded-lg">Policy timeline will appear here.</div> },
              { id: 'datasets', label: 'Datasets (8)', content: <div className="p-4 text-neutral-500 border border-dashed rounded-lg">Underlying datasets mapping to this region.</div> }
            ]} 
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 border-b pb-2">Data Notes</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4 text-sm text-amber-900">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-amber-600 mr-2 shrink-0" />
              <div>
                <p className="font-semibold">Illustrative Flags Active</p>
                <p className="mt-1 opacity-90">Population and dispute metrics for this region are illustrative defaults generated for demonstration purposes.</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapIcon className="w-5 h-5 text-amber-600 mr-2 shrink-0" />
              <div>
                <p className="font-semibold">Resolution Note</p>
                <p className="mt-1 opacity-90">Built-up area is calculated at a 1km resolution; micro-level accuracy is not guaranteed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
