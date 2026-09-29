import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SearchResult } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Tooltip } from '@/components/ui/Tooltip';
import { AddToProjectDialog } from '@/components/ui/AddToProjectDialog';
import { Search as SearchIcon, Info, Sparkles, Bookmark, Plus, FileText, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const q = searchParams.get('q') || '';
  const mode = searchParams.get('mode') || 'hybrid';
  const type = searchParams.get('type') || '';
  
  const [localQuery, setLocalQuery] = useState(q);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saveDialog, setSaveDialog] = useState<{isOpen: boolean, type: any, payload: any}>({ isOpen: false, type: 'search', payload: {} });

  // Sync local query when URL changes
  useEffect(() => { setLocalQuery(q); }, [q]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      updateParam('q', localQuery.trim());
      setShowSuggestions(false);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', { q, mode, type }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (mode) params.set('mode', mode);
      if (type) params.set('type', type);
      return api.get<{ items: SearchResult[], total: number }>(`/search?${params.toString()}`);
    },
    enabled: !!q
  });

  const topDocIds = data?.items?.slice(0, 5).map(i => i.document.id).join(',') || '';

  const renderResult = (res: SearchResult) => {
    // "Semantic match" logic: if it mentions 'Semantically' or if there's no exact match
    const isSemanticOnly = res.why_matched?.toLowerCase().includes('semantically') || res.why_matched?.toLowerCase().includes('meaning only');
    
    return (
      <Card key={res.document.id} className="hover:border-primary-300 transition-colors cursor-pointer" onClick={() => navigate(`/repository/${res.document.id}`)}>
        <CardContent className="p-5">
          <div className="flex justify-between items-start gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary">{res.document.document_type}</Badge>
                <span className="text-xs text-neutral-500">{res.document.year} • {res.document.authors?.[0] || 'Unknown'}</span>
                {isSemanticOnly && (
                  <Badge variant="illustrative" className="bg-semantic-modelled/10 text-semantic-modelled border-semantic-modelled/20">
                    <Sparkles className="w-3 h-3 mr-1 inline" /> Semantic match
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 leading-snug">{res.document.title}</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-neutral-400 bg-neutral-100 px-2 py-1 rounded">Score: {(res.score * 100).toFixed(0)}</span>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-md border border-neutral-100 leading-relaxed italic border-l-2 border-l-primary-400">
            "{res.matched_chunk?.text || 'No snippet available.'}"
          </div>
          
          <div className="mt-3 flex items-center text-xs text-neutral-500">
            <Info className="w-3.5 h-3.5 mr-1 text-neutral-400" />
            Why matched: {res.why_matched || 'Relevant to the query.'}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-sm p-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-3xl">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <Input 
                  value={localQuery}
                  onChange={e => setLocalQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ask a question or search for keywords..."
                  className="pl-10 h-10 text-base"
                />
              </div>
              {showSuggestions && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg z-50">
                  <div className="p-2 text-xs font-semibold text-neutral-500 uppercase">Recent & Saved</div>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center" onClick={() => { setLocalQuery('urban sprawl eating farmland'); updateParam('q', 'urban sprawl eating farmland'); }}>
                    <SearchIcon className="w-3 h-3 mr-2 text-neutral-400" /> urban sprawl eating farmland
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center" onClick={() => { setLocalQuery('impact of property tax'); updateParam('q', 'impact of property tax'); }}>
                    <SearchIcon className="w-3 h-3 mr-2 text-neutral-400" /> impact of property tax
                  </button>
                </div>
              )}
            </form>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex bg-neutral-100 rounded-md p-1 border border-neutral-200">
                {['hybrid', 'semantic', 'keyword'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateParam('mode', m)}
                    className={`px-3 py-1 text-sm font-medium rounded-sm capitalize transition-colors ${mode === m ? 'bg-white shadow-sm text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Tooltip content={
                <div className="max-w-xs text-xs space-y-1">
                  <p><strong>Hybrid:</strong> Combines keyword exactness with conceptual meaning.</p>
                  <p><strong>Semantic:</strong> Finds conceptually similar text even if words don't match.</p>
                  <p><strong>Keyword:</strong> Exact term matching only.</p>
                </div>
              } position="bottom">
                <button className="text-neutral-400 hover:text-neutral-600"><Info className="w-5 h-5" /></button>
              </Tooltip>
            </div>
          </div>

          {/* Query Understanding Suggestions */}
          {q && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-neutral-500 font-medium text-xs uppercase tracking-wider">Auto-detected:</span>
              <Badge variant="secondary" className="cursor-pointer">Region: NCR <X className="w-3 h-3 ml-1 inline"/></Badge>
              <Badge variant="secondary" className="cursor-pointer">Topic: Urbanization <X className="w-3 h-3 ml-1 inline"/></Badge>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full p-4 sm:p-8 flex-1">
        
        {/* Left Rail: Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Document Type</h3>
            <div className="space-y-2">
              {['Policy', 'Research', 'Act', 'Gazette', 'Technical Report'].map(t => (
                <label key={t} className="flex items-center space-x-2">
                  <Checkbox checked={type === t} onChange={() => updateParam('type', type === t ? '' : t)} />
                  <span className="text-sm text-neutral-700">{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail: Results */}
        <div className="flex-1 space-y-6">
          
          {q && !isLoading && !error && data?.items && data.items.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary-50 border border-primary-100 p-3 rounded-lg">
              <span className="text-sm text-neutral-700 font-medium">Found {data.total || data.items.length} results</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="primary" onClick={() => navigate(`/assistant?doc_ids=${topDocIds}`)}>
                  <Sparkles className="w-4 h-4 mr-2" /> Summarise with Assistant
                </Button>
                {user && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => setSaveDialog({isOpen: true, type: 'search', payload: { q, mode, type }})}><Bookmark className="w-4 h-4 mr-2" /> Save search</Button>
                    <Button size="sm" variant="outline" onClick={() => setSaveDialog({isOpen: true, type: 'search', payload: { q, mode, type }})}><Plus className="w-4 h-4 mr-2" /> Add to project</Button>
                  </>
                )}
              </div>
            </div>
          )}

          {!q ? (
            <EmptyState 
              icon={SearchIcon}
              title="What would you like to know?" 
              description="Enter a question, policy topic, or region to search across the entire evidence base." 
            />
          ) : isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
            </div>
          ) : error ? (
            <ErrorState message="Search service is currently unavailable." />
          ) : !data?.items?.length ? (
            <div className="mt-8 bg-white border rounded-lg h-96 flex flex-col items-center justify-center space-y-4 text-center p-8">
              <SearchIcon className="w-12 h-12 text-neutral-300" />
              <h3 className="text-lg font-semibold text-neutral-900">No exact matches found</h3>
              <p className="text-neutral-500 max-w-sm">Try tweaking your keywords or running a semantic search if you are looking for conceptual overlap.</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => { setLocalQuery('urban expansion'); updateParam('q', 'urban expansion'); }}>Try "urban expansion"</Button>
                <Button variant="outline" onClick={() => { setLocalQuery('land dispute resolution'); updateParam('q', 'land dispute resolution'); }}>Try "land dispute resolution"</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map(renderResult)}
            </div>
          )}
        </div>
      </div>
      <AddToProjectDialog isOpen={saveDialog.isOpen} onClose={() => setSaveDialog(prev => ({...prev, isOpen: false}))} itemType={saveDialog.type} payload={saveDialog.payload} />
    </div>
  );
}
