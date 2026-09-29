import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Banner } from '@/components/ui/Banner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Drawer } from '@/components/ui/Drawer';
import { Select } from '@/components/ui/Select';
import { Tooltip } from '@/components/ui/Tooltip';
import { 
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar 
} from 'recharts';
import { useToast } from '@/components/ui/Toast';
import { Activity, Beaker, Save, Copy, FileText, Download, Play, Info, ArrowRight, Settings2, GitCompare } from 'lucide-react';

const REGIONS = [
  { id: 'DIST-001', name: 'Faridabad' },
  { id: 'DIST-002', name: 'Gurugram' },
  { id: 'DIST-003', name: 'Rohtak' }
];

const PARAMS = [
  { id: 'peri_urban_conversion_restriction_pct', label: 'Conversion Restriction', unit: '%', default: 0, min: 0, max: 100, desc: 'Caps the maximum allowable conversion of peri-urban cropland to built-up area.' },
  { id: 'irrigation_coverage_increase_pp', label: 'Irrigation Increase', unit: 'pp', default: 0, min: 0, max: 20, desc: 'Percentage point increase in canal/tube-well irrigation coverage.' },
  { id: 'infrastructure_investment_index_change_pct', label: 'Infra Investment', unit: '%', default: 0, min: -20, max: 50, desc: 'Change in baseline infrastructure spending index.' }
];

const MOCK_HISTORY = [
  { year: 2018, actual: 10 },
  { year: 2019, actual: 11.2 },
  { year: 2020, actual: 11.9 },
  { year: 2021, actual: 12.8 },
  { year: 2022, actual: 13.5 },
  { year: 2023, actual: 14.1 }
];

export default function Scenarios() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const initialRegion = searchParams.get('region') || 'DIST-002';
  
  const [step, setStep] = useState(1);
  const [loadingStage, setLoadingStage] = useState<'preparing' | 'running' | 'computing' | null>(null);
  
  // Form State
  const [region, setRegion] = useState(initialRegion);
  const [indicator, setIndicator] = useState('cropland');
  const [horizon, setHorizon] = useState(5);
  const [name, setName] = useState('My Policy Scenario');
  const [params, setParams] = useState<Record<string, number>>(
    PARAMS.reduce((acc, p) => ({ ...acc, [p.id]: p.default }), {})
  );

  const [historyDrawer, setHistoryDrawer] = useState(false);

  const runScenario = async () => {
    setStep(3);
    setLoadingStage('preparing');
    await new Promise(r => setTimeout(r, 800));
    setLoadingStage('running');
    await new Promise(r => setTimeout(r, 1200));
    setLoadingStage('computing');
    await new Promise(r => setTimeout(r, 1000));
    setLoadingStage(null);
    setStep(4);
  };

  const resetParams = () => {
    setParams(PARAMS.reduce((acc, p) => ({ ...acc, [p.id]: p.default }), {}));
  };

  const handleExport = () => {
    const md = `# Scenario Summary: ${name}
**Region:** ${REGIONS.find(r=>r.id===region)?.name}
**Target:** ${indicator}
*Scenario estimate based on historical patterns and illustrative data. Not a guaranteed policy outcome.*

## Projections
...`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-${name.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    addToast({ type: 'success', title: 'Exported Markdown summary' });
  };

  // Mock Result Data
  const generateChartData = () => {
    const data = [...MOCK_HISTORY];
    let base = 14.1;
    let scen = 14.1;
    
    // Impact calculation mock
    const restrictImpact = (params.peri_urban_conversion_restriction_pct / 100) * 0.5;
    const invImpact = (params.infrastructure_investment_index_change_pct / 100) * 0.8;
    
    for (let i = 1; i <= horizon; i++) {
      const year = 2023 + i;
      base -= 0.6; // baseline cropland loss
      scen = scen - 0.6 + restrictImpact - invImpact;
      
      data.push({
        year,
        actual: undefined as any,
        baseline: parseFloat(base.toFixed(2)),
        scenario: parseFloat(scen.toFixed(2)),
        band: [
          parseFloat((scen - 0.8 - (i*0.2)).toFixed(2)), 
          parseFloat((scen + 0.8 + (i*0.2)).toFixed(2))
        ] as any
      });
    }
    return data;
  };

  const resultData = step === 4 ? generateChartData() : [];
  const horizonResult = resultData[resultData.length - 1];

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader title="Policy Scenario Sandbox" description="Model policy impacts up to 10 years ahead using random forest regressions." />
        <Button variant="outline" onClick={() => setHistoryDrawer(true)}><FileText className="w-4 h-4 mr-2" /> Past Runs</Button>
      </div>

      {step === 4 && (
        <Banner 
          variant="caveat" 
          message="Scenario estimate based on historical patterns and illustrative data. Not a guaranteed policy outcome." 
        />
      )}

      {step < 4 ? (
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="border-b bg-neutral-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle>Scenario Configuration</CardTitle>
              <span className="text-sm font-medium text-neutral-500">Step {step} of 2</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Region Context</label>
                  <Select value={region} onChange={e => setRegion(e.target.value)} className="w-full">
                    {REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Target Indicator</label>
                  <Select value={indicator} onChange={e => setIndicator(e.target.value)} className="w-full">
                    <option value="cropland">Cropland Area %</option>
                    <option value="built_up">Built-up Area %</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Projection Horizon</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2"><input type="radio" checked={horizon===5} onChange={()=>setHorizon(5)} className="text-primary-600"/> <span>5 Years</span></label>
                    <label className="flex items-center space-x-2"><input type="radio" checked={horizon===10} onChange={()=>setHorizon(10)} className="text-primary-600"/> <span>10 Years</span></label>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-neutral-50 border rounded-lg">
                  <p className="text-xs font-semibold text-neutral-500 uppercase mb-2">Historical Baseline (Last 5 Years)</p>
                  <div className="h-24 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={MOCK_HISTORY}>
                        <Line type="monotone" dataKey="actual" stroke="#0f766e" strokeWidth={2} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setStep(2)}>Next: Define Policy <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Scenario Name</label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-neutral-900">Policy Interventions</h3>
                    <button className="text-xs text-primary-600 hover:underline" onClick={resetParams}>Reset to baseline</button>
                  </div>
                  
                  {PARAMS.map(p => (
                    <div key={p.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-neutral-700 flex items-center">
                          {p.label}
                          <Tooltip content={<div className="max-w-xs">{p.desc}</div>}><Info className="w-3.5 h-3.5 ml-1 text-neutral-400" /></Tooltip>
                        </label>
                        <span className="text-sm font-semibold">{params[p.id]} {p.unit}</span>
                      </div>
                      <div className="relative pt-2">
                        <input 
                          type="range" min={p.min} max={p.max} 
                          value={params[p.id]} 
                          onChange={e => setParams({...params, [p.id]: parseInt(e.target.value)})}
                          className="w-full accent-primary-600" 
                        />
                        <div className="absolute top-0 w-1 h-3 bg-neutral-400" style={{ left: `${((p.default - p.min) / (p.max - p.min)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-primary-50 border border-primary-100 rounded-lg">
                  <p className="text-sm text-primary-800">
                    <strong>Live Summary:</strong> This scenario will simulate the effect of a {params.peri_urban_conversion_restriction_pct}% conversion restriction and a {params.infrastructure_investment_index_change_pct}% change in infrastructure investment over a {horizon}-year horizon.
                  </p>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="primary" onClick={runScenario} className="bg-emerald-600 hover:bg-emerald-700 border-none"><Play className="w-4 h-4 mr-2" /> Run Model</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="py-12 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <Beaker className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                    {loadingStage === 'preparing' ? 'Preparing feature matrix...' : 
                     loadingStage === 'running' ? 'Running Random Forest regression...' : 
                     'Computing 80% uncertainty bands...'}
                  </h3>
                  <p className="text-sm text-neutral-500">This may take a few moments.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Results View */
        <div className="space-y-6">
          
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{name}</h2>
              <p className="text-neutral-500">{REGIONS.find(r=>r.id===region)?.name} • {indicator} • {horizon}-Year Horizon</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(2)}><Settings2 className="w-4 h-4 mr-2" /> Tweak</Button>
              <Button variant="outline" size="sm"><GitCompare className="w-4 h-4 mr-2" /> Compare</Button>
              <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export</Button>
              <Button variant="primary" size="sm" className="bg-emerald-600 border-none"><Save className="w-4 h-4 mr-2" /> Save to Project</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Chart */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center">Projection Trajectory <Badge variant="illustrative" className="ml-3">Modelled</Badge></CardTitle></CardHeader>
                <CardContent>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={resultData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        <XAxis dataKey="year" tick={{fontSize: 12}} />
                        <YAxis tick={{fontSize: 12}} domain={['auto', 'auto']} />
                        <RechartsTooltip 
                          contentStyle={{fontSize: '12px', borderRadius: '8px'}}
                          formatter={(value: any, name: string) => {
                            if (name === 'band') return [`${value[0]} - ${value[1]}`, '80% Confidence'];
                            return [value, name.charAt(0).toUpperCase() + name.slice(1)];
                          }}
                        />
                        
                        <Area type="monotone" dataKey="band" stroke="none" fill="#ecfdf5" />
                        <ReferenceLine x={2023} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Projection Starts', fontSize: 10, fill: '#64748b' }} />
                        
                        <Line type="monotone" dataKey="actual" stroke="#0f766e" strokeWidth={3} dot={{r:3}} />
                        <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        <Line type="monotone" dataKey="scenario" stroke="#10b981" strokeWidth={3} dot={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-neutral-600">
                    <span className="flex items-center"><div className="w-3 h-3 bg-[#0f766e] rounded-sm mr-2" /> Actual History</span>
                    <span className="flex items-center"><div className="w-3 h-0.5 bg-[#94a3b8] mr-2" /> Baseline (Do Nothing)</span>
                    <span className="flex items-center"><div className="w-3 h-0.5 bg-[#10b981] mr-2" /> Scenario Projection</span>
                    <span className="flex items-center"><div className="w-3 h-3 bg-[#ecfdf5] border border-[#10b981] rounded-sm mr-2" /> 80% Uncertainty Band</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Explanation */}
              <Card className="border-emerald-200">
                <CardHeader className="bg-emerald-50 pb-2 flex flex-row items-center justify-between border-b border-emerald-100">
                  <CardTitle className="text-emerald-900 text-sm flex items-center"><Sparkles className="w-4 h-4 mr-2" /> AI Analysis</CardTitle>
                  <Badge variant="illustrative" className="bg-white border-emerald-200 text-emerald-700">Modelled Output</Badge>
                </CardHeader>
                <CardContent className="pt-4 text-sm text-neutral-700 leading-relaxed space-y-3">
                  <p>
                    Under this scenario, the restriction on peri-urban conversion forces a stabilisation of cropland loss. The baseline projection estimates cropland would fall to <strong>{horizonResult?.baseline}%</strong> by 2028, but the intervention preserves it at <strong>{horizonResult?.scenario}%</strong>.
                  </p>
                  <p>
                    The 80% confidence interval ranges between <strong>{horizonResult?.band[0]}% and {horizonResult?.band[1]}%</strong>, reflecting inherent uncertainty in macro-economic forces and historical variance.
                  </p>
                  <p className="text-xs text-neutral-500 italic mt-4 pt-3 border-t">Note: This explanation interprets the mathematical model output. It does not introduce new factual evidence.</p>
                </CardContent>
              </Card>
            </div>

            {/* Right Rail Panels */}
            <div className="col-span-1 space-y-6">
              
              <Card className="bg-neutral-900 text-white">
                <CardContent className="p-6">
                  <h3 className="text-neutral-400 text-sm font-semibold mb-1">Delta at Year {horizon}</h3>
                  <div className="flex items-end mb-2">
                    <span className="text-4xl font-bold text-white">+{(horizonResult?.scenario - horizonResult?.baseline).toFixed(2)}%</span>
                    <span className="text-sm ml-2 text-neutral-400 mb-1">vs Baseline</span>
                  </div>
                  <div className="bg-neutral-800 p-2 rounded text-xs text-neutral-400 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1" />
                    Range: {(horizonResult?.band[0] - horizonResult?.baseline).toFixed(2)}% to {(horizonResult?.band[1] - horizonResult?.baseline).toFixed(2)}%
                  </div>
                  <Badge variant="illustrative" className="mt-4 bg-neutral-800 border-neutral-700 text-neutral-300">Modelled</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Model Assumptions</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2 text-neutral-600">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Demographic growth rates remain constant.</li>
                    <li>No major external macroeconomic shocks.</li>
                    <li>Assumes full policy compliance.</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Feature Importance</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-32 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{name: 'Infra', val: 0.45}, {name: 'Pop Den', val: 0.30}, {name: 'Zoning', val: 0.15}, {name: 'Lags', val: 0.10}]} layout="vertical" margin={{top:0, right:0, bottom:0, left:20}}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{fontSize: '10px', padding: '4px 8px'}} />
                        <Bar dataKey="val" fill="#0f766e" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Model Provenance</CardTitle></CardHeader>
                <CardContent className="text-xs text-neutral-500 space-y-2">
                  <p><strong>Architecture:</strong> RandomForestRegressor</p>
                  <p><strong>Training Window:</strong> 2010 - 2020</p>
                  <p><strong>Validation:</strong> Holdout (2021-2023) MAE: 0.8% (vs Naive 1.5%)</p>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      <Drawer isOpen={historyDrawer} onClose={() => setHistoryDrawer(false)} position="right" title="Past Scenario Runs">
        <div className="space-y-4">
          <div className="p-3 border rounded-lg hover:border-primary-300 cursor-pointer">
            <h4 className="font-semibold text-sm text-neutral-900">Max Infrastructure Invest</h4>
            <p className="text-xs text-neutral-500 mb-2">Gurugram • Built-up Area • 10 Yr</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px]">Saved</Badge>
              <Badge variant="secondary" className="text-[10px]">Yesterday</Badge>
            </div>
          </div>
          <div className="p-3 border rounded-lg hover:border-primary-300 cursor-pointer">
            <h4 className="font-semibold text-sm text-neutral-900">Green Belt Strict Protection</h4>
            <p className="text-xs text-neutral-500 mb-2">Faridabad • Cropland • 5 Yr</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px]">Auto-saved</Badge>
              <Badge variant="secondary" className="text-[10px]">3 days ago</Badge>
            </div>
          </div>
        </div>
      </Drawer>

    </div>
  );
}
