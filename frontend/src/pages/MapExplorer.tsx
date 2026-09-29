import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Drawer } from '@/components/ui/Drawer';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { LineTrend } from '@/components/charts/LineTrend';
import { Tooltip } from '@/components/ui/Tooltip';
import { AddToProjectDialog } from '@/components/ui/AddToProjectDialog';
import { MapIcon, Search, Download, Bookmark, Play, Pause, RefreshCcw, Layers, Info, ExternalLink, FileText, Database, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/lib/auth';

const BASEMAP_STYLE = import.meta.env.VITE_BASEMAP_STYLE_URL || {
  version: 8,
  sources: { blank: { type: 'vector', url: '' } },
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f8f9fa' } }]
};

const CATEGORIES = {
  'Land use': [
    { id: 'built_up', label: 'Built-up Area %', source: 'NRSC', resolution: '1km', illustrative: false },
    { id: 'cropland', label: 'Cropland %', source: 'MoA', resolution: 'District', illustrative: false }
  ],
  'Infrastructure': [
    { id: 'road_density', label: 'Road Density', source: 'NHAI', resolution: 'District', illustrative: false }
  ],
  'Socio-economic': [
    { id: 'population_density', label: 'Population Density', source: 'Census', resolution: 'District', illustrative: true }
  ],
  'Disputes': [
    { id: 'disputes', label: 'Disputes per 100k', source: 'NJDG', resolution: 'District', illustrative: true }
  ]
};

export default function MapExplorer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const isOfficial = user?.role === 'official';

  const layer = searchParams.get('layer') || 'built_up';
  const year = parseInt(searchParams.get('year') || '2023', 10);
  const region = searchParams.get('region') || '';
  const compare = searchParams.get('compare') || '';
  
  const [opacity, setOpacity] = useState(0.8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveDialog, setSaveDialog] = useState(false);
  
  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) next.delete(k);
      else next.set(k, v);
    }
    setSearchParams(next);
  };

  // Fetch GeoJSON
  const { data: geojson, isLoading } = useQuery({
    queryKey: ['geojson', layer, year],
    queryFn: () => api.get<any>(`/regions/geojson?indicator=${layer}&year=${year}&level=district`),
  });

  // Fetch Region Profile if selected
  const { data: regionProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['region-summary', region],
    queryFn: () => api.get<any>(`/regions/${region}/summary`),
    enabled: !!region
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      center: [77.2, 28.6], // default to NCR roughly
      zoom: 7,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.current.on('load', () => {
      if (!map.current) return;
      
      map.current.addSource('regions', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      
      map.current.addLayer({
        id: 'regions-fill',
        type: 'fill',
        source: 'regions',
        paint: {
          'fill-color': [
            'interpolate', ['linear'], ['get', 'value'],
            0, '#f8fafc',
            100, '#0f766e' // teal scale default
          ],
          'fill-opacity': opacity
        }
      });

      map.current.addLayer({
        id: 'regions-line',
        type: 'line',
        source: 'regions',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1
        }
      });

      map.current.addLayer({
        id: 'regions-highlight',
        type: 'line',
        source: 'regions',
        paint: {
          'line-color': '#f59e0b',
          'line-width': 3,
          'line-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0]
        }
      });

      // Hover logic
      let hoveredId: string | null = null;
      
      map.current.on('mousemove', 'regions-fill', (e) => {
        if (e.features && e.features.length > 0 && map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
          if (hoveredId) {
            map.current.setFeatureState({ source: 'regions', id: hoveredId }, { hover: false });
          }
          hoveredId = e.features[0].id as string;
          map.current.setFeatureState({ source: 'regions', id: hoveredId }, { hover: true });

          // Tooltip update could happen here with a popup, or via React state overlay
          // For simplicity we will rely on native popups
        }
      });

      map.current.on('mouseleave', 'regions-fill', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
        if (hoveredId && map.current) {
          map.current.setFeatureState({ source: 'regions', id: hoveredId }, { hover: false });
        }
        hoveredId = null;
      });

      map.current.on('click', 'regions-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const id = e.features[0].properties.id;
          updateParams({ region: id });
        }
      });
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  // Update Map Data when GeoJSON changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !geojson) return;
    const src = map.current.getSource('regions') as maplibregl.GeoJSONSource;
    if (src) {
      src.setData(geojson);
      
      // Compute breaks for data-driven styling
      const values = geojson.features.map((f: any) => f.properties.value).filter((v: any) => v !== undefined && v !== null);
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        map.current.setPaintProperty('regions-fill', 'fill-color', [
          'interpolate', ['linear'], ['get', 'value'],
          min, '#f8fafc',
          max, '#0f766e'
        ]);
      }
    }
  }, [geojson]);

  // Update opacity
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && map.current.getLayer('regions-fill')) {
      map.current.setPaintProperty('regions-fill', 'fill-opacity', opacity);
    }
  }, [opacity]);

  // Playback year
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSearchParams(prev => {
          const y = parseInt(prev.get('year') || '2023', 10);
          const nextY = y < 2024 ? y + 1 : 2018;
          prev.set('year', nextY.toString());
          return prev;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, setSearchParams]);

  const handleExport = () => {
    if (!map.current) return;
    const canvas = map.current.getCanvas();
    const data = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = data;
    a.download = `bhuniti-map-${layer}-${year}.png`;
    a.click();
    addToast({ type: 'success', title: 'Map exported successfully' });
  };

  const handleZoomSearch = () => {
    if (!searchQuery.trim() || !geojson) return;
    const feature = geojson.features.find((f: any) => f.properties.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (feature && map.current) {
      // Very naive bounds calculation
      const coords = feature.geometry.coordinates.flat(Infinity);
      const lngs = coords.filter((_: any, i: number) => i % 2 === 0);
      const lats = coords.filter((_: any, i: number) => i % 2 === 1);
      map.current.fitBounds([
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)]
      ], { padding: 50 });
      updateParams({ region: feature.properties.id });
    }
  };

  const currentLayerInfo = Object.values(CATEGORIES).flat().find(l => l.id === layer);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-neutral-100 relative">
      
      {/* Left Control Panel */}
      <div className="w-80 bg-white border-r border-neutral-200 flex flex-col z-10 shadow-sm">
        <div className="p-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <h2 className="font-semibold flex items-center"><MapIcon className="w-4 h-4 mr-2" /> Map Explorer</h2>
          <IconButton icon={RefreshCcw} size="sm" variant="ghost" onClick={() => { updateParams({ layer: 'built_up', year: '2023', region: null }); map.current?.flyTo({center: [77.2, 28.6], zoom: 7}); }} />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-3 flex items-center"><Layers className="w-3 h-3 mr-1" /> Layers</h3>
            <div className="space-y-4">
              {Object.entries(CATEGORIES).map(([cat, layers]) => (
                <div key={cat}>
                  <h4 className="text-sm font-medium text-neutral-800 mb-2">{cat}</h4>
                  <div className="space-y-1">
                    {layers.map(l => (
                      <button 
                        key={l.id}
                        onClick={() => updateParams({ layer: l.id })}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${layer === l.id ? 'bg-primary-50 text-primary-700 font-medium border border-primary-100' : 'text-neutral-600 hover:bg-neutral-50 border border-transparent'}`}
                      >
                        <span className="truncate">{l.label}</span>
                        {l.illustrative && <Badge variant="illustrative" className="scale-75 origin-right">Demo</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-3">Time Period</h3>
            <div className="flex items-center space-x-3 mb-2">
              <IconButton icon={isPlaying ? Pause : Play} size="sm" variant="outline" onClick={() => setIsPlaying(!isPlaying)} className={isPlaying ? 'bg-primary-50 text-primary-600 border-primary-200' : ''} />
              <div className="flex-1 text-center font-semibold text-neutral-800 bg-neutral-100 py-1 rounded-md">{year}</div>
            </div>
            <input 
              type="range" 
              min="2018" max="2024" 
              value={year} 
              onChange={e => { setIsPlaying(false); updateParams({ year: e.target.value }); }}
              className="w-full accent-primary-600" 
            />
          </div>

          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase mb-3">Visualisation</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-neutral-500 mb-1">
                  <span>Opacity</span>
                  <span>{Math.round(opacity * 100)}%</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={opacity} 
                  onChange={e => setOpacity(parseFloat(e.target.value))} 
                  className="w-full accent-primary-600" 
                />
              </div>
            </div>
          </div>
        </div>

        {currentLayerInfo && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500 space-y-1">
            <div className="flex items-start"><Info className="w-3 h-3 mr-1 mt-0.5 shrink-0" /> <div><strong>Source:</strong> {currentLayerInfo.source} <br/> <strong>Resolution:</strong> {currentLayerInfo.resolution}</div></div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Floating Tools */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <div className="flex items-center bg-white rounded-md shadow-sm border border-neutral-200 overflow-hidden">
            <Input 
              placeholder="Find district..." 
              className="h-9 border-none focus:ring-0 w-48 text-sm bg-transparent" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleZoomSearch()}
            />
            <button className="px-3 text-neutral-400 hover:text-primary-600 bg-neutral-50 border-l" onClick={handleZoomSearch}><Search className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button variant="secondary" size="sm" onClick={handleExport} className="bg-white shadow-sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
          {user && <Button variant="secondary" size="sm" onClick={() => setSaveDialog(true)} className="bg-white shadow-sm"><Bookmark className="w-4 h-4 mr-2" /> Save View</Button>}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-4 bg-white p-3 rounded-lg shadow-md border border-neutral-200 z-10 w-64">
          <div className="text-xs font-semibold text-neutral-700 mb-2 truncate">{currentLayerInfo?.label}</div>
          <div className="h-2 w-full bg-gradient-to-r from-slate-50 to-teal-700 rounded-full mb-1" />
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Footnote Overlay */}
        <div className="absolute bottom-2 right-10 text-[10px] text-neutral-500 z-10 bg-white/80 px-2 py-1 rounded">
          * Schematic boundaries. {currentLayerInfo?.illustrative ? 'Illustrative data.' : ''}
        </div>
      </div>

      {/* Right Drawer: Region Profile */}
      <Drawer isOpen={!!region} onClose={() => updateParams({ region: null, compare: null })} position="right" title="District Profile">
        {isLoadingProfile ? (
          <div className="space-y-6"><Skeleton className="h-24"/><Skeleton className="h-48"/><Skeleton className="h-48"/></div>
        ) : regionProfile ? (
          <div className="flex flex-col h-full overflow-hidden -mt-4">
            <div className="px-1 pb-4 mb-4 border-b">
              <h2 className="text-xl font-bold text-neutral-900">{regionProfile.region?.name || region}</h2>
              <p className="text-sm text-neutral-500">Rank: 4th among peers • Population: 1.2M</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <Tabs 
                tabs={[
                  {
                    id: 'overview',
                    label: 'Overview',
                    content: (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-neutral-50 rounded-lg border">
                            <p className="text-xs text-neutral-500 uppercase mb-1">Built-up Area</p>
                            <p className="text-lg font-semibold">12.4% <span className="text-xs text-emerald-600 ml-1">↑ 1.2%</span></p>
                          </div>
                          <div className="p-3 bg-neutral-50 rounded-lg border">
                            <p className="text-xs text-neutral-500 uppercase mb-1">Disputes</p>
                            <p className="text-lg font-semibold">45 / 100k <span className="text-xs text-red-600 ml-1">↑ 5%</span></p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm">Indicator Trend</h4>
                            {compare ? (
                              <Badge variant="outline">Comparing {compare}</Badge>
                            ) : (
                              <button className="text-xs text-primary-600 hover:underline" onClick={() => updateParams({ compare: 'DIST-002' })}>Compare peer</button>
                            )}
                          </div>
                          <LineTrend 
                            data={[
                              { year: 2018, 'Selected': 10, 'Peer': 12 },
                              { year: 2019, 'Selected': 11, 'Peer': 12 },
                              { year: 2020, 'Selected': 11.5, 'Peer': 13 },
                              { year: 2021, 'Selected': 12, 'Peer': 13.5 },
                              { year: 2022, 'Selected': 12.4, 'Peer': 14 },
                            ]} 
                            xKey="year" 
                            lines={[{ key: 'Selected', color: '#0f766e' }, compare ? { key: 'Peer', color: '#94a3b8' } : null].filter(Boolean) as any}
                            className="h-48 border border-neutral-100 rounded-lg p-2"
                          />
                        </div>
                      </div>
                    )
                  },
                  {
                    id: 'evidence',
                    label: 'Evidence',
                    content: (
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg cursor-pointer hover:border-primary-300" onClick={() => navigate('/repository/doc-1')}>
                          <h5 className="font-medium text-sm text-neutral-900 mb-1 flex items-start"><FileText className="w-4 h-4 mr-2 text-primary-600 shrink-0"/> Master Plan 2031</h5>
                          <p className="text-xs text-neutral-500">Mentions this district 14 times.</p>
                        </div>
                        <div className="p-3 border rounded-lg cursor-pointer hover:border-primary-300" onClick={() => navigate('/repository/doc-2')}>
                          <h5 className="font-medium text-sm text-neutral-900 mb-1 flex items-start"><FileText className="w-4 h-4 mr-2 text-primary-600 shrink-0"/> Dispute Audit Report</h5>
                          <p className="text-xs text-neutral-500">High relevance match for {regionProfile.region?.name}.</p>
                        </div>
                      </div>
                    )
                  },
                  {
                    id: 'datasets',
                    label: 'Datasets',
                    content: (
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg cursor-pointer hover:border-primary-300">
                          <h5 className="font-medium text-sm text-neutral-900 mb-1 flex items-start"><Database className="w-4 h-4 mr-2 text-secondary-600 shrink-0"/> Property Tax Roll</h5>
                          <p className="text-xs text-neutral-500">Last updated 2023</p>
                        </div>
                      </div>
                    )
                  }
                ]}
              />
            </div>
            
            <div className="pt-4 mt-4 border-t border-neutral-200 flex flex-col gap-2 shrink-0">
              {isOfficial && (
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate(`/scenarios?region=${region}`)}>
                  <Sparkles className="w-4 h-4 mr-2" /> Model Scenarios
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate(`/regions/${region}`)}>
                <ExternalLink className="w-4 h-4 mr-2" /> Open Full Profile
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState title="No data found" description="Profile unavailable." />
        )}
      </Drawer>
      
      <AddToProjectDialog isOpen={saveDialog} onClose={() => setSaveDialog(false)} itemType="map_view" payload={{ layer, year, region }} />
    </div>
  );
}
