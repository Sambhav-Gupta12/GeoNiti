import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Tooltip } from '@/components/ui/Tooltip';
import { BarCompare } from '@/components/charts/BarCompare';
import { RankList } from '@/components/charts/RankList';
import { Sparkles, FileText, Database, Map as MapIcon, ShieldAlert } from 'lucide-react';

const EXAMPLE_QUERIES = [
  "Impact of urban expansion on agricultural land in NCR",
  "Dispute resolution times in northern districts",
  "SVAMITVA drone survey progress 2023",
  "Policies restricting industrial conversion"
];

function MiniMapSvg({ indicator }: { indicator: string }) {
  // Simple illustrative SVG of an NCR-like region map
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full max-h-64" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round">
      <path d="M 20 20 L 50 10 L 80 20 L 90 50 L 70 80 L 40 90 L 10 70 Z" fill={indicator === 'built_up' ? '#5ba9a9' : indicator === 'cropland' ? '#10b981' : '#ef4444'} className="transition-colors opacity-80 hover:opacity-100 cursor-pointer" />
      <path d="M 20 20 L 40 40 L 50 10" fill="none" stroke="#fff" />
      <path d="M 40 40 L 70 80" fill="none" stroke="#fff" />
      <path d="M 40 40 L 90 50" fill="none" stroke="#fff" />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, can } = useAuth();
  const [mapIndicator, setMapIndicator] = useState('built_up');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch dashboard data
  const { data: publicOverview, isLoading: isLoadingPublic, error: errorPublic } = useQuery({
    queryKey: ['publicOverview'],
    queryFn: () => api.get<any>('/public/overview')
  });

  const { data: adminQueue, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ['adminQueue'],
    queryFn: () => api.get<any[]>('/admin/queue'),
    enabled: !!user && can('document:approve')
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleExampleSearch = (q: string) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const isGuest = !user;
  const isOfficial = user?.role === 'official';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 sm:p-8 space-y-12 max-w-7xl mx-auto pb-24">
      
      {/* 1. Hero Band */}
      <section className="bg-primary-950 text-white rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden shadow-lg border border-primary-900">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
            Spatial intelligence for land policy
          </h1>
          <p className="text-lg text-primary-200">
            Search evidence, policies, and datasets to power decision making.
          </p>
          <div className="flex items-center space-x-2 mt-8">
            <SearchInput 
              placeholder="Search evidence, policies and datasets..." 
              className="h-14 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <Button size="lg" className="h-14 shrink-0 bg-primary-600 hover:bg-primary-500 text-white shadow-none" onClick={() => navigate('/assistant')}>
              <Sparkles className="w-5 h-5 mr-2" />
              Ask Assistant
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {EXAMPLE_QUERIES.map(q => (
              <button 
                key={q} 
                onClick={() => handleExampleSearch(q)}
                className="px-3 py-1.5 rounded-full bg-primary-900/50 hover:bg-primary-800 text-primary-200 text-sm transition-colors border border-primary-800/50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Admin specific row */}
      {isAdmin && (
        <section className="bg-semantic-warning/10 border border-semantic-warning/20 p-6 rounded-xl flex items-center justify-between">
          <div className="flex items-center">
            <ShieldAlert className="w-8 h-8 text-semantic-warning mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Pending Approvals</h3>
              <p className="text-neutral-700 text-sm">Documents and datasets awaiting review.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-semantic-warning">
              {isLoadingAdmin ? <Skeleton className="w-12 h-8" /> : adminQueue?.length || 0}
            </span>
            <Button onClick={() => navigate('/admin/queue')} variant="secondary" className="bg-semantic-warning hover:bg-semantic-warning/90 border-none">Review Queue</Button>
          </div>
        </section>
      )}

      {/* 2. KPI Row */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-neutral-900 px-1 border-b pb-2">National Key Metrics</h2>
        
        {isLoadingPublic ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
          </div>
        ) : errorPublic ? (
          <ErrorState message="Could not load KPIs." />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-neutral-500">DILRMP Rural Records Digitised</p>
                    <Tooltip content="Verify latest data in repository"><Badge variant="illustrative">MoRD 2023</Badge></Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-neutral-900 mt-4">94.5%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-neutral-500">SVAMITVA Villages Surveyed</p>
                    <Tooltip content="Verify latest data in repository"><Badge variant="illustrative">MoPR 2024</Badge></Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-neutral-900 mt-4">2.4<span className="text-xl text-neutral-500 font-medium">L</span></p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-neutral-500">Civil Cases that are Land Disputes</p>
                    <Tooltip content="Verify latest data in repository"><Badge variant="illustrative">NJDG 2023</Badge></Tooltip>
                  </div>
                  <p className="text-3xl font-bold text-neutral-900 mt-4">66%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border rounded-lg p-4 flex items-center">
                <FileText className="w-5 h-5 text-primary-500 mr-3" />
                <div><p className="text-xs text-neutral-500 uppercase tracking-wider">Documents</p><p className="font-semibold">{publicOverview?.counts?.documents || 0}</p></div>
              </div>
              <div className="bg-white border rounded-lg p-4 flex items-center">
                <Database className="w-5 h-5 text-secondary-500 mr-3" />
                <div><p className="text-xs text-neutral-500 uppercase tracking-wider">Datasets</p><p className="font-semibold">{publicOverview?.counts?.datasets || 0}</p></div>
              </div>
              <div className="bg-white border rounded-lg p-4 flex items-center">
                <MapIcon className="w-5 h-5 text-semantic-success mr-3" />
                <div><p className="text-xs text-neutral-500 uppercase tracking-wider">Regions</p><p className="font-semibold">32</p></div>
              </div>
              <div className="bg-white border rounded-lg p-4 flex items-center">
                <Sparkles className="w-5 h-5 text-semantic-warning mr-3" />
                <div><p className="text-xs text-neutral-500 uppercase tracking-wider">Challenges</p><p className="font-semibold">{publicOverview?.counts?.challenges || 0}</p></div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* 3. Two Column Map & Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-5 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle>Regional Overview</CardTitle>
              <p className="text-sm text-neutral-500">National Capital Region Mini-Map</p>
            </div>
            <select 
              className="text-sm border-neutral-300 rounded-md py-1 pl-2 pr-8 focus:ring-primary-500 focus:border-primary-500 bg-neutral-50"
              value={mapIndicator}
              onChange={(e) => setMapIndicator(e.target.value)}
            >
              <option value="built_up">Built-up %</option>
              <option value="cropland">Cropland %</option>
              <option value="disputes">Disputes per 100k</option>
            </select>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-6 bg-neutral-50">
            <MiniMapSvg indicator={mapIndicator} />
            <div className="mt-6 w-full flex justify-between items-center text-xs text-neutral-500">
              <span>Low</span>
              <div className="h-2 flex-1 mx-4 bg-gradient-to-r from-neutral-200 to-primary-500 rounded-full" />
              <span>High</span>
            </div>
            <Button variant="outline" className="w-full mt-6" onClick={() => navigate('/map')}>
              Open Full Map Explorer
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-7 space-y-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Land Disputes by District</CardTitle>
            </CardHeader>
            <CardContent>
              <BarCompare 
                data={[
                  { region: 'Dist A', value: 120 },
                  { region: 'Dist B', value: 95 },
                  { region: 'Dist C', value: 80 },
                  { region: 'Dist D', value: 65 },
                ]} 
                xKey="region" 
                bars={[{ key: 'value', color: '#5a82a1', name: 'Disputes' }]} 
                className="h-64"
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top Movers (YoY Change)</CardTitle>
            </CardHeader>
            <CardContent>
              <RankList 
                data={[
                  { name: 'Dist C - Built Up', val: 8.5 },
                  { name: 'Dist A - Built Up', val: 6.2 },
                  { name: 'Dist D - Cropland', val: -4.1 },
                ]} 
                xKey="val" 
                yKey="name" 
                color="#5ba9a9"
                className="h-48"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. Recent & Trending */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4 border-b pb-2">Recent Research</h2>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/repository/doc-${i}`)}>
                <div>
                  <h4 className="font-medium text-neutral-900">Land Use Change Analysis Report 202{i}</h4>
                  <p className="text-sm text-neutral-500">NCR Region • Authored by Admin</p>
                </div>
                <Badge variant="default">{2024 - i}</Badge>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 border-b pb-2">Trending Topics</h2>
            <div className="flex flex-wrap gap-2">
              {['Urban Sprawl', 'Agri-conversion', 'Drone Surveys', 'Encroachment', 'Title regularisation'].map(t => (
                <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-secondary-200" onClick={() => navigate(`/search?q=${t}`)}>
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          {!isGuest && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 border-b pb-2">Jump Back In</h2>
              <div className="space-y-3">
                <Card className="cursor-pointer hover:border-primary-300 transition-colors" onClick={() => navigate('/workspace')}>
                  <CardContent className="p-4 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3 shrink-0">
                      <Database className="w-4 h-4 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">NCR Expansion Study</p>
                      <p className="text-xs text-neutral-500">Last edited 2 hours ago</p>
                    </div>
                  </CardContent>
                </Card>
                {isOfficial && (
                  <Card className="cursor-pointer hover:border-primary-300 transition-colors" onClick={() => navigate('/scenarios')}>
                    <CardContent className="p-4 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-semantic-success/10 flex items-center justify-center mr-3 shrink-0">
                        <Sparkles className="w-4 h-4 text-semantic-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Industrial Policy Scenario</p>
                        <p className="text-xs text-neutral-500">Run completed yesterday</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="text-center pt-8 border-t border-neutral-200">
        <p className="text-sm text-neutral-500 italic">
          * Demo uses illustrative data unless marked as sourced. Values shown are for demonstration purposes.
        </p>
      </footer>
      
    </div>
  );
}
