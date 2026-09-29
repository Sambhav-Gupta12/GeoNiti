import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LineTrend } from '@/components/charts/LineTrend';
import { Tooltip } from '@/components/ui/Tooltip';
import { Select } from '@/components/ui/Select';
import { AddToProjectDialog } from '@/components/ui/AddToProjectDialog';
import { BarChart3, TrendingUp, Search, Download, Bookmark, Sparkles, AlertCircle, Info, ScatterChart as ScatterIcon, Layers, Settings2 } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';

// Mock Data
const INDICATORS = [
  { id: 'built_up', label: 'Built-up Area %', category: 'Land Use', illustrative: false },
  { id: 'cropland', label: 'Cropland Area %', category: 'Land Use', illustrative: false },
  { id: 'disputes', label: 'Disputes per 100k', category: 'Disputes', illustrative: true },
  { id: 'population_density', label: 'Population Density', category: 'Socio-economic', illustrative: true }
];

const MOCK_REGIONS = [
  { id: 'DIST-001', name: 'Faridabad' },
  { id: 'DIST-002', name: 'Gurugram' },
  { id: 'DIST-003', name: 'Rohtak' }
];

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const indicator = searchParams.get('indicator') || 'built_up';
  const regionsStr = searchParams.get('regions') || 'DIST-001,DIST-002';
  const regions = regionsStr.split(',').filter(Boolean);
  const startYear = searchParams.get('from') || '2018';
  const endYear = searchParams.get('to') || '2023';
  const chartType = searchParams.get('type') || 'trend'; // trend, compare, ranking
  
  const [nlQuery, setNlQuery] = useState('');
  const [nlPlan, setNlPlan] = useState<{operation: string, indicator: string, regions: string[], years: string} | null>(null);
  const [nlError, setNlError] = useState<string | null>(null);
  const [isNlLoading, setIsNlLoading] = useState(false);

  const [corrX, setCorrX] = useState('built_up');
  const [corrY, setCorrY] = useState('disputes');
  const [saveDialog, setSaveDialog] = useState(false);

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next);
  };

  const handleRegionToggle = (rId: string) => {
    const next = new Set(regions);
    if (next.has(rId)) next.delete(rId);
    else next.add(rId);
    updateParams({ regions: Array.from(next).join(',') || null });
  };

  // Main Chart Query
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['analytics', chartType, indicator, regionsStr, startYear, endYear],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 600));
      if (!regions.length) return { series: [], stats: null };
      
      // Generate mock trend lines for selected regions
      const series = [];
      for (let y = parseInt(startYear); y <= parseInt(endYear); y++) {
        const point: any = { year: y };
        regions.forEach((r, idx) => {
          let base = indicator === 'built_up' ? 10 : 50;
          let val = base + (y - 2018) * (idx + 1) * 1.5 + (Math.random() * 2);
          point[r] = parseFloat(val.toFixed(2));
        });
        
        // Inject seeded anomaly
        if (y === 2021 && indicator === 'cropland' && regions.includes('DIST-002')) {
          point.isAnomaly = true;
          point.anomalyReason = 'Sudden -5% drop in Cropland outside normal variance';
        }
        series.push(point);
      }
      return {
        series,
        stats: {
          cagr: '4.2%',
          totalChange: '+12.4%',
          slope: '1.5 units/yr',
          descriptor: 'Steady upward trend observed across selected regions, with Gurugram showing the steepest rate of change.'
        }
      };
    }
  });

  // Correlation Query
  const { data: corrData, isLoading: isLoadingCorr } = useQuery({
    queryKey: ['correlation', corrX, corrY],
    queryFn: async () => {
      await new Promise(r => setTimeout(r, 400));
      const pts = Array.from({length: 30}).map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      return {
        points: pts,
        coef: 0.72,
        n: 124
      };
    }
  });

  const handleNlSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    
    setIsNlLoading(true);
    setNlPlan(null);
    setNlError(null);
    
    try {
      await new Promise(r => setTimeout(r, 1000));
      
      if (nlQuery.toLowerCase().includes('drop table') || nlQuery.toLowerCase().includes('ignore previous')) {
        throw new Error('I could not map this query to analytical dimensions. Please ensure you are asking about indicators, regions, and dates.');
      }
      
      setNlPlan({
        operation: 'compare',
        indicator: 'cropland',
        regions: ['DIST-002', 'DIST-001'],
        years: '2010-2023'
      });
      
    } catch(err: any) {
      setNlError(err.message || 'Failed to interpret query.');
    } finally {
      setIsNlLoading(false);
    }
  };

  const indInfo = INDICATORS.find(i => i.id === indicator);

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Analytics Workspace" description="Multi-indicator trends, comparisons, and anomaly detection." />
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
          {user && <Button variant="secondary" size="sm" onClick={() => setSaveDialog(true)}><Bookmark className="w-4 h-4 mr-2" /> Save to Project</Button>}
        </div>
      </div>

      {indInfo?.illustrative && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm flex items-center">
          <Info className="w-4 h-4 mr-2 shrink-0" />
          The currently selected indicator ({indInfo.label}) contains illustrative data for demonstration.
        </div>
      )}

      {/* Ask a Question Bar */}
      <Card className="border-primary-200 shadow-sm overflow-visible z-20 relative">
        <CardContent className="p-1">
          <form onSubmit={handleNlSearch} className="flex items-center">
            <div className="pl-4 text-primary-500"><Sparkles className="w-5 h-5" /></div>
            <Input 
              className="border-none focus:ring-0 shadow-none bg-transparent h-12 text-base flex-1" 
              placeholder='e.g. "Compare cropland loss in Gurugram and Faridabad since 2010"' 
              value={nlQuery}
              onChange={e => setNlQuery(e.target.value)}
            />
            <Button type="submit" variant="ghost" disabled={isNlLoading || !nlQuery.trim()} className="mr-2">Analyze</Button>
          </form>
          
          {isNlLoading && <div className="px-5 pb-3 text-sm text-neutral-500 flex items-center"><Sparkles className="w-3 h-3 mr-2 animate-pulse" /> Interpreting query...</div>}
          
          {nlError && (
            <div className="px-5 pb-3 pt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" /> {nlError}
            </div>
          )}

          {nlPlan && (
            <div className="px-5 pb-4 pt-2 border-t border-primary-50 bg-primary-50/50 rounded-b-lg">
              <p className="text-xs font-semibold text-primary-800 mb-2">INTERPRETED PLAN (Editable):</p>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="primary" className="cursor-pointer">{nlPlan.operation} <Settings2 className="w-3 h-3 ml-1 inline" /></Badge>
                <span className="text-xs text-neutral-400">indicator</span>
                <Badge variant="secondary" className="cursor-pointer">{INDICATORS.find(i=>i.id===nlPlan.indicator)?.label || nlPlan.indicator}</Badge>
                <span className="text-xs text-neutral-400">in</span>
                <Badge variant="secondary" className="cursor-pointer">{nlPlan.regions.length} regions</Badge>
                <span className="text-xs text-neutral-400">for</span>
                <Badge variant="secondary" className="cursor-pointer">{nlPlan.years}</Badge>
                
                <Button size="sm" className="ml-auto bg-primary-600 hover:bg-primary-700 h-7 text-xs" onClick={() => {
                  updateParams({ type: nlPlan.operation, indicator: nlPlan.indicator, regions: nlPlan.regions.join(','), from: '2010', to: '2023' });
                  setNlPlan(null);
                }}>Apply & Run</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Bar */}
      <div className="bg-white p-4 border border-neutral-200 rounded-lg flex flex-wrap gap-4 items-end shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase">Indicator</label>
          <select className="block w-full border-neutral-300 rounded-md text-sm" value={indicator} onChange={e => updateParams({indicator: e.target.value})}>
            <optgroup label="Land Use">
              {INDICATORS.filter(i => i.category === 'Land Use').map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
            </optgroup>
            <optgroup label="Disputes">
              {INDICATORS.filter(i => i.category === 'Disputes').map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
            </optgroup>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase">Regions</label>
          <div className="relative">
            <select className="block w-full border-neutral-300 rounded-md text-sm min-w-[200px]" onChange={e => {
              if (e.target.value === 'all') updateParams({regions: MOCK_REGIONS.map(r=>r.id).join(',')});
              else handleRegionToggle(e.target.value);
            }} value="">
              <option value="" disabled>Select districts...</option>
              <option value="all">All districts in state</option>
              {MOCK_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{regions.includes(r.id) ? '✓ ' : ''}{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-neutral-500 uppercase">Time Range</label>
          <div className="flex items-center space-x-2">
            <Input type="number" className="w-20 h-[38px]" value={startYear} onChange={e => updateParams({from: e.target.value})} />
            <span className="text-neutral-400">-</span>
            <Input type="number" className="w-20 h-[38px]" value={endYear} onChange={e => updateParams({to: e.target.value})} />
          </div>
        </div>

        <div className="space-y-1 ml-auto">
          <label className="text-xs font-semibold text-neutral-500 uppercase">View</label>
          <div className="flex bg-neutral-100 p-0.5 rounded-md">
            <button onClick={() => updateParams({type: 'trend'})} className={`px-3 py-1.5 text-sm rounded-sm font-medium ${chartType === 'trend' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>Trend</button>
            <button onClick={() => updateParams({type: 'compare'})} className={`px-3 py-1.5 text-sm rounded-sm font-medium ${chartType === 'compare' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>Compare</button>
            <button onClick={() => updateParams({type: 'ranking'})} className={`px-3 py-1.5 text-sm rounded-sm font-medium ${chartType === 'ranking' ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500'}`}>Ranking</button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle>{indInfo?.label} Analysis</CardTitle>
              {regions.length > 0 && <Button variant="outline" size="sm" onClick={() => navigate(`/scenarios?region=${regions[0]}`)}>Open Scenario</Button>}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-80" />
              ) : regions.length === 0 ? (
                <EmptyState title="No regions selected" description="Please select at least one district to view data." />
              ) : error ? (
                <ErrorState />
              ) : chartType === 'ranking' ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-500 uppercase text-xs">
                      <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">District</th><th className="px-4 py-3">Latest Value</th><th className="px-4 py-3">Trend</th></tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {regions.map((rId, i) => {
                        const reg = MOCK_REGIONS.find(r => r.id === rId);
                        return (
                          <tr key={rId}>
                            <td className="px-4 py-3 font-semibold">{i + 1}</td>
                            <td className="px-4 py-3">{reg?.name || rId}</td>
                            <td className="px-4 py-3 font-medium text-neutral-900">{(Math.random()*100).toFixed(1)}</td>
                            <td className="px-4 py-3">
                              <div className="w-16 h-4 bg-neutral-100 rounded overflow-hidden relative">
                                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary-200" />
                                {/* Mock sparkline */}
                                <svg width="100%" height="100%" preserveAspectRatio="none"><polyline points="0,16 16,10 32,12 48,6 64,2" fill="none" stroke="#0f766e" strokeWidth="1.5"/></svg>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-80 w-full relative">
                  <LineTrend 
                    data={chartData?.series || []} 
                    xKey="year" 
                    lines={regions.map((r, i) => ({
                      key: r,
                      name: MOCK_REGIONS.find(mr=>mr.id===r)?.name || r,
                      color: i === 0 ? '#0f766e' : i === 1 ? '#d97706' : '#6366f1'
                    }))}
                  />
                  {/* Anomaly markers rendering */}
                  <div className="absolute inset-0 pointer-events-none flex">
                    {chartData?.series.map((d: any, i: number) => d.isAnomaly && (
                      <div key={i} className="absolute pointer-events-auto" style={{ left: `${(i / (chartData.series.length - 1)) * 100}%`, bottom: '60%' }}>
                        <Tooltip content={<div className="max-w-xs"><p className="font-semibold text-xs mb-1">Anomaly Detected</p><p className="text-xs">{d.anomalyReason}</p></div>}>
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white cursor-pointer animate-pulse -ml-2 shadow-sm" />
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {chartData?.stats && (
                <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-sm text-neutral-700 leading-relaxed mb-4 font-medium">{chartData.stats.descriptor}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div><p className="text-xs text-neutral-500 uppercase">CAGR</p><p className="font-semibold text-neutral-900">{chartData.stats.cagr}</p></div>
                    <div><p className="text-xs text-neutral-500 uppercase">Total Change</p><p className="font-semibold text-neutral-900">{chartData.stats.totalChange}</p></div>
                    <div><p className="text-xs text-neutral-500 uppercase">Linear Slope</p><p className="font-semibold text-neutral-900">{chartData.stats.slope}</p></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Correlation Explorer */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center"><ScatterIcon className="w-4 h-4 mr-2 text-primary-600" /> Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase">X-Axis</label>
                  <Select value={corrX} onChange={e => setCorrX(e.target.value)} className="text-sm h-8 mt-1">
                    {INDICATORS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase">Y-Axis</label>
                  <Select value={corrY} onChange={e => setCorrY(e.target.value)} className="text-sm h-8 mt-1">
                    {INDICATORS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                  </Select>
                </div>
              </div>

              {isLoadingCorr ? (
                <Skeleton className="h-48 w-full mb-4" />
              ) : (
                <div className="h-48 w-full border border-neutral-100 rounded-lg p-2 bg-neutral-50/50 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                      <XAxis type="number" dataKey="x" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <YAxis type="number" dataKey="y" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                      <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Scatter name="Regions" data={corrData?.points} fill="#0f766e" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="flex justify-between items-end border-b pb-4 mb-4">
                <div>
                  <p className="text-xs text-neutral-500 uppercase">Coefficient (r)</p>
                  <p className="text-2xl font-bold text-neutral-900">{corrData?.coef}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500 uppercase">Sample (n)</p>
                  <p className="text-lg font-semibold text-neutral-700">{corrData?.n}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs flex items-start leading-relaxed">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                <span><strong>Caution:</strong> Correlation is not causation. Confounding variables or non-linear relationships may exist.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddToProjectDialog isOpen={saveDialog} onClose={() => setSaveDialog(false)} itemType="analysis" payload={{ indicator, regions: regionsStr, startYear, endYear, chartType }} />
    </div>
  );
}
