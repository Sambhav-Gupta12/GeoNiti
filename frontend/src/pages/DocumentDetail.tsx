import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Document } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/components/ui/Banner';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { AddToProjectDialog } from '@/components/ui/AddToProjectDialog';
import { ArrowLeft, Sparkles, MessageSquare, Download, Share2, Bookmark, Quote } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [saveDialog, setSaveDialog] = useState(false);

  const { data: doc, isLoading, error } = useQuery({
    queryKey: ['document', id],
    queryFn: () => api.get<Document & { is_illustrative?: boolean; abstract?: string; keywords?: string[]; topics?: string[]; regions?: string[]; language?: string; source_url?: string }>(`/documents/${id}`)
  });

  const { data: summary, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['document-summary', id],
    queryFn: () => api.post<{ summary: string }>('/assistant/answer', { 
      question: 'Summarise this document in 3 bullet points.', 
      scope: { document_ids: [id] }
    }),
    enabled: !!doc // Only fetch if we have the doc
  });

  if (isLoading) {
    return <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-40 mb-8" /><Skeleton className="h-96" /></div>;
  }

  if (error || !doc) {
    return <div className="p-8 max-w-7xl mx-auto"><ErrorState message="Could not load document details." /></div>;
  }

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to repository
      </button>

      {doc.is_illustrative && (
        <Banner variant="caveat" message="This is an illustrative document. The content may be AI-generated or synthetic for demonstration purposes." />
      )}
      
      {doc.status === 'pending_review' && (
        <Banner variant="warning" message="This document is pending administrative review. Metadata may be incomplete." />
      )}

      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left Main Content */}
        <div className="flex-1 min-w-0 space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="primary">{doc.document_type}</Badge>
              {doc.visibility === 'restricted' && <Badge variant="error">Restricted Access</Badge>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
              {doc.title}
            </h1>
            
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 border rounded-lg">
              <div><p className="text-xs text-neutral-500 uppercase">Authors</p><p className="text-sm font-medium">{doc.authors?.join(', ') || 'Unknown'}</p></div>
              <div><p className="text-xs text-neutral-500 uppercase">Year</p><p className="text-sm font-medium">{doc.year || 'N/A'}</p></div>
              <div><p className="text-xs text-neutral-500 uppercase">Language</p><p className="text-sm font-medium">{doc.language || 'English'}</p></div>
              <div><p className="text-xs text-neutral-500 uppercase">Regions</p><p className="text-sm font-medium">{doc.regions?.join(', ') || 'National'}</p></div>
            </div>
          </div>

          <Tabs 
            tabs={[
              {
                id: 'overview',
                label: 'Overview',
                content: (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Abstract</h3>
                      <p className="text-neutral-700 leading-relaxed">{doc.abstract || 'No abstract available.'}</p>
                    </div>
                    {doc.keywords && doc.keywords.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-2">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {doc.keywords.map(k => <Badge key={k} variant="secondary">{k}</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'preview',
                label: 'Preview',
                content: (
                  <div className="h-[600px] bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center text-neutral-500">
                    PDF Viewer Placeholder
                  </div>
                )
              },
              {
                id: 'annotations',
                label: 'Annotations',
                content: (
                  <div className="space-y-4">
                    {can('document:write') ? (
                      <Button variant="secondary"><MessageSquare className="w-4 h-4 mr-2" /> Add Annotation</Button>
                    ) : (
                      <p className="text-sm text-neutral-500">You do not have permission to annotate this document.</p>
                    )}
                    <div className="text-center text-neutral-500 p-8 border border-dashed rounded-lg">
                      No annotations yet.
                    </div>
                  </div>
                )
              }
            ]} 
          />
        </div>

        {/* Right Rail */}
        <div className="w-full xl:w-80 shrink-0 space-y-6">
          <Card className="border-primary-200 shadow-sm overflow-hidden">
            <div className="bg-primary-50 px-4 py-3 border-b border-primary-100 flex items-center">
              <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
              <h3 className="font-semibold text-primary-900">AI Summary</h3>
            </div>
            <CardContent className="p-4 bg-white text-sm">
              {isSummaryLoading ? (
                <div className="space-y-2"><Skeleton className="h-4 w-full"/><Skeleton className="h-4 w-5/6"/><Skeleton className="h-4 w-4/6"/></div>
              ) : (
                <div className="prose prose-sm text-neutral-700 prose-p:leading-snug">
                  {summary?.summary || 'Failed to generate summary.'}
                </div>
              )}
              <div className="mt-4 pt-4 border-t">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/assistant?doc_id=${id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask about this document
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-neutral-600" onClick={() => setSaveDialog(true)}><Bookmark className="w-4 h-4 mr-3" /> Save to Workspace</Button>
              <Button variant="ghost" className="w-full justify-start text-neutral-600"><Share2 className="w-4 h-4 mr-3" /> Share Link</Button>
              <Button variant="ghost" className="w-full justify-start text-neutral-600"><Quote className="w-4 h-4 mr-3" /> Cite Document</Button>
              <Button variant="ghost" className="w-full justify-start text-neutral-600" disabled={doc.visibility === 'restricted'}><Download className="w-4 h-4 mr-3" /> Download Source</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Related Research</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-500">
              Recommendations will appear here.
            </CardContent>
          </Card>
        </div>
      </div>
      <AddToProjectDialog isOpen={saveDialog} onClose={() => setSaveDialog(false)} itemType="document" payload={{ id }} />
    </div>
  );
}
