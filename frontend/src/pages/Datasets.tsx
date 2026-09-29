import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Search, X, List, LayoutGrid, Database, Lock, Clock, MapPin, Tag } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';

// Mock datasets for frontend dev
const MOCK_DATASETS = [
  { id: 'ds-1', title: 'Land Dispute Records 2023', org: 'NJDG', region: 'NCR', startYear: 2018, endYear: 2023, freq: 'Annual', licence: 'Open Data', indicators: ['disputes'], is_illustrative: true, version: 'v2.1', visibility: 'public' },
  { id: 'ds-2', title: 'Property Tax Roll - High Resolution', org: 'Municipal Corp', region: 'Delhi', startYear: 2020, endYear: 2024, freq: 'Quarterly', licence: 'Internal', indicators: ['tax_collection'], is_illustrative: false, version: 'v1.0', visibility: 'restricted' },
  { id: 'ds-3', title: 'Built-up Area Satellite Survey', org: 'NRSC', region: 'National', startYear: 2010, endYear: 2023, freq: 'Biannual', licence: 'Open Data', indicators: ['built_up'], is_illustrative: false, version: 'v4.0', visibility: 'public' },
];

export default function Datasets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['datasets', q, category],
    queryFn: async () => {
      // Simulate API call
      await new Promise(r => setTimeout(r, 600));
      let filtered = [...MOCK_DATASETS];
      if (q) filtered = filtered.filter(d => d.title.toLowerCase().includes(q.toLowerCase()));
      
      // Guests don't see restricted datasets
      if (!user) filtered = filtered.filter(d => d.visibility !== 'restricted');
      
      return filtered;
    }
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <PageHeader title="Datasets Explorer" description="Browse foundational GIS, tabular, and administrative data layers." />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Rail: Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input placeholder="Keywords..." className="pl-9" value={q} onChange={e => updateParam('q', e.target.value)} />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Category</h3>
            <div className="space-y-2">
              {['Land Use', 'Socio-economic', 'Infrastructure', 'Disputes'].map(c => (
                <label key={c} className="flex items-center space-x-2">
                  <Checkbox checked={category === c} onChange={() => updateParam('category', category === c ? '' : c)} />
                  <span className="text-sm text-neutral-700">{c}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Visibility</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2"><Checkbox /> <span className="text-sm text-neutral-700">Public</span></label>
              <label className="flex items-center space-x-2"><Checkbox /> <span className="text-sm text-neutral-700">Restricted</span></label>
            </div>
          </div>
        </div>

        {/* Right Rail: Results */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-neutral-200">
            <span className="text-sm text-neutral-500 pl-2">{data?.length || 0} datasets found</span>
            <div className="flex items-center space-x-2">
              <Select className="h-8 text-xs py-0 w-32"><option>Newest</option><option>A-Z</option></Select>
              <div className="flex bg-neutral-100 rounded-md p-0.5">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}><List className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}><LayoutGrid className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-24'}`} />)}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
              {data?.map(ds => (
                <Card key={ds.id} className="cursor-pointer hover:border-primary-300 transition-colors" onClick={() => navigate(`/datasets/${ds.id}`)}>
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 mb-2">
                        {ds.is_illustrative ? <Badge variant="illustrative">Illustrative</Badge> : <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sourced</Badge>}
                        <Badge variant="outline">{ds.version}</Badge>
                      </div>
                      {ds.visibility === 'restricted' && <Tooltip content="Restricted access"><Lock className="w-4 h-4 text-amber-500" /></Tooltip>}
                    </div>
                    
                    <h3 className="font-semibold text-lg text-neutral-900 leading-snug mb-1">{ds.title}</h3>
                    <p className="text-sm text-neutral-500 mb-4">{ds.org}</p>
                    
                    <div className="mt-auto pt-4 border-t border-neutral-100 space-y-2">
                      <div className="flex items-center justify-between text-xs text-neutral-600">
                        <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {ds.region}</span>
                        <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> {ds.freq}</span>
                      </div>
                      
                      {/* Time coverage mini-bar */}
                      <div className="flex items-center mt-2 group">
                        <span className="text-[10px] text-neutral-400 w-8">{ds.startYear}</span>
                        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden mx-2">
                          <div className="h-full bg-primary-200" style={{ width: '100%' }} />
                        </div>
                        <span className="text-[10px] text-neutral-400 w-8 text-right">{ds.endYear}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {ds.indicators.map(i => <Badge key={i} variant="secondary" className="text-[10px] py-0">{i}</Badge>)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="flex justify-center pt-6"><Pagination currentPage={1} totalPages={1} onPageChange={() => {}} /></div>
        </div>
      </div>
    </div>
  );
}
