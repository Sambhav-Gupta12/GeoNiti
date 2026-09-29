import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LayoutGrid, List, FileText, Search, X } from 'lucide-react';
import { Document } from '@/types';

export default function Repository() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'newest';

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1'); // reset page on filter
    setSearchParams(next);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', { q, type, page, sort }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (type) params.set('type', type);
      params.set('page', page.toString());
      params.set('sort', sort);
      return api.get<{ items: Document[], total: number }>(`/documents?${params.toString()}`);
    }
  });

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = q || type;

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <PageHeader 
        title="Document Repository" 
        description={`Explore ${data?.total || 0} policy documents, research papers, and technical reports.`} 
      />

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Rail: Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input 
                placeholder="Keywords..." 
                className="pl-9" 
                value={q}
                onChange={(e) => updateParam('q', e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Document Type</h3>
            <div className="space-y-2">
              {['Policy', 'Research', 'Act', 'Gazette', 'Technical Report'].map(t => (
                <label key={t} className="flex items-center space-x-2">
                  <Checkbox 
                    checked={type === t} 
                    onChange={() => updateParam('type', type === t ? '' : t)} 
                  />
                  <span className="text-sm text-neutral-700">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 mb-3">Year Range</h3>
            <div className="flex items-center space-x-2">
              <Input placeholder="Min" type="number" className="w-full" />
              <span className="text-neutral-500">-</span>
              <Input placeholder="Max" type="number" className="w-full" />
            </div>
          </div>
        </div>

        {/* Right Rail: Results */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-2 rounded-lg border border-neutral-200">
            <div className="flex flex-wrap gap-2 px-2">
              {hasFilters ? (
                <>
                  {q && <Badge variant="secondary" className="pr-1">{q} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateParam('q', '')} /></Badge>}
                  {type && <Badge variant="secondary" className="pr-1">{type} <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => updateParam('type', '')} /></Badge>}
                  <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline ml-2">Clear all</button>
                </>
              ) : (
                <span className="text-sm text-neutral-500">No active filters</span>
              )}
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Select value={sort} onChange={e => updateParam('sort', e.target.value)} className="w-40 h-8 text-xs py-0">
                <option value="newest">Newest First</option>
                <option value="relevance">Relevance</option>
                <option value="title">Title A-Z</option>
              </Select>
              <div className="flex bg-neutral-100 rounded-md p-0.5">
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}>
                  <List className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-neutral-500'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className={`w-full ${viewMode === 'grid' ? 'h-48' : 'h-24'}`} />)}
            </div>
          ) : error ? (
            <ErrorState />
          ) : !data?.items.length ? (
            <EmptyState 
              title="No documents found" 
              description="Try adjusting your filters or search query." 
              action={{ label: 'Clear Filters', onClick: clearFilters }} 
            />
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
              {data.items.map((doc: Document) => (
                <Card 
                  key={doc.id} 
                  className={`cursor-pointer hover:border-primary-300 transition-colors ${viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'}`}
                  onClick={() => navigate(`/repository/${doc.id}`)}
                >
                  <CardContent className={`p-4 flex gap-4 ${viewMode === 'grid' ? 'flex-col h-full' : 'items-center w-full'}`}>
                    <div className={`flex items-center justify-center rounded-lg bg-primary-50 shrink-0 ${viewMode === 'grid' ? 'w-10 h-10' : 'w-12 h-12'}`}>
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 truncate">{doc.title}</h3>
                      <p className="text-xs text-neutral-500 truncate mt-1">
                        {doc.authors?.join(', ')} • {doc.year}
                      </p>
                      {viewMode === 'grid' && doc.abstract && (
                        <p className="text-xs text-neutral-600 mt-2 line-clamp-3">{doc.abstract}</p>
                      )}
                    </div>
                    <div className={`flex flex-wrap gap-1 ${viewMode === 'list' ? 'ml-auto justify-end w-48' : 'mt-auto pt-4'}`}>
                      <Badge variant="default">{doc.document_type}</Badge>
                      {doc.status === 'pending_review' && <Badge variant="warning">Pending</Badge>}
                      {doc.visibility === 'restricted' && <Badge variant="error">Restricted</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {data && data.total > 0 && (
            <div className="flex justify-center pt-6">
              <Pagination 
                currentPage={page} 
                totalPages={Math.ceil(data.total / 10)} 
                onPageChange={p => updateParam('page', p.toString())} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
