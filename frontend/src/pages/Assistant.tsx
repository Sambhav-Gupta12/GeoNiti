import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { CitationPill } from '@/components/ui/CitationPill';
import { Tooltip } from '@/components/ui/Tooltip';
import { Banner } from '@/components/ui/Banner';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { AddToProjectDialog } from '@/components/ui/AddToProjectDialog';
import { 
  Send, Plus, MessageSquare, Search, FileText, 
  Copy, Bookmark, Flag, ExternalLink, X, Settings2
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Source {
  id: string;
  title: string;
  year?: number;
  authors?: string[];
  relevance: number;
  snippet: string;
  is_illustrative?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  grounded?: boolean;
}

export default function Assistant() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const docIds = searchParams.get('doc_ids');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'retrieving' | 'drafting' | null>(null);
  const [activeSources, setActiveSources] = useState<Source[]>([]);
  const [saveDialog, setSaveDialog] = useState<{isOpen: boolean, payload: any}>({ isOpen: false, payload: null });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);
    setLoadingStage('retrieving');
    setActiveSources([]); // clear right panel temporarily

    try {
      // Simulate staging
      setTimeout(() => setLoadingStage('drafting'), 1000);
      
      const payload: any = { 
        question: text,
        session_context: messages.slice(-5) 
      };
      if (docIds) payload.scope = { document_ids: docIds.split(',') };

      const res = await api.post<any>('/assistant/answer', payload);
      
      const asstMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.answer,
        sources: res.sources || [],
        grounded: res.grounded
      };
      setMessages(prev => [...prev, asstMsg]);
      if (res.sources) setActiveSources(res.sources);

    } catch (e: any) {
      if (e.code === 'AI_UNAVAILABLE') {
        addToast({ type: 'error', title: 'AI Unavailable', message: 'The assistant service is currently down.' });
      } else {
        addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to get answer.' });
      }
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error and could not process your request.',
        grounded: false
      }]);
    } finally {
      setIsLoading(false);
      setLoadingStage(null);
    }
  };

  const renderContentWithCitations = (content: string, sources?: Source[]) => {
    if (!sources || sources.length === 0) return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    
    // Replace [1], [2] with Tooltip-wrapped CitationPills
    const parts = content.split(/(\[\d+\])/g);
    
    return (
      <div className="whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none text-neutral-800">
        {parts.map((part, i) => {
          const match = part.match(/\[(\d+)\]/);
          if (match) {
            const idx = parseInt(match[1], 10);
            const source = sources[idx - 1];
            if (source) {
              return (
                <Tooltip 
                  key={i} 
                  content={
                    <div className="w-64 space-y-2 p-1">
                      <p className="font-semibold text-white leading-tight">{source.title}</p>
                      <p className="text-xs text-neutral-300">{source.year} • {source.authors?.[0]}</p>
                      <p className="text-xs text-neutral-400 line-clamp-3 italic">"{source.snippet}"</p>
                      {source.is_illustrative && <Badge variant="illustrative" className="mt-1">Illustrative</Badge>}
                    </div>
                  }
                >
                  <span className="inline-flex cursor-pointer mx-0.5" onClick={() => setActiveSources(sources)}>
                    <CitationPill index={idx} active={false} />
                  </span>
                </Tooltip>
              );
            }
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-neutral-50">
      
      {/* LEFT: Session List */}
      <div className="hidden lg:flex w-72 flex-col border-r border-neutral-200 bg-white">
        <div className="p-4 border-b border-neutral-200">
          <Button className="w-full justify-start" variant="primary" onClick={() => { setMessages([]); setActiveSources([]); }}>
            <Plus className="w-4 h-4 mr-2" /> New Chat
          </Button>
        </div>
        <div className="p-4 border-b border-neutral-200">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <Input placeholder="Search sessions..." className="pl-8 h-9 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase">Today</div>
          <button className="w-full text-left px-3 py-2 rounded-md bg-primary-50 text-primary-900 text-sm font-medium flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-primary-600 shrink-0" />
            <span className="truncate">Comparing farmland drivers</span>
          </button>
          <button className="w-full text-left px-3 py-2 rounded-md hover:bg-neutral-100 text-neutral-700 text-sm flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-neutral-400 shrink-0" />
            <span className="truncate">Dispute resolution NCR</span>
          </button>
        </div>
      </div>

      {/* CENTRE: Conversation */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-sm z-10 relative">
        <div className="h-14 border-b border-neutral-200 flex items-center px-4 sm:px-6 justify-between bg-white shrink-0">
          <h2 className="font-semibold text-neutral-800">Research Assistant</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-500">Scope:</span>
            {docIds ? (
              <Badge variant="secondary" className="flex items-center">
                {docIds.split(',').length} documents selected
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => { setSearchParams(new URLSearchParams()); }} />
              </Badge>
            ) : (
              <Badge variant="outline" className="text-neutral-500 bg-neutral-50 border-dashed">All approved sources</Badge>
            )}
            <IconButton icon={Settings2} size="sm" variant="ghost" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-neutral-900 mb-2">How can I help with your research?</h3>
                <p className="text-neutral-500 max-w-md mx-auto">I can synthesise documents, compare policies, and extract structured data. My answers are strictly grounded in the approved repository.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <Card className="cursor-pointer hover:border-primary-300 transition-colors bg-neutral-50 text-left" onClick={() => handleSend('Compare findings on farmland conversion drivers')}>
                  <CardContent className="p-4 text-sm font-medium text-neutral-700">"Compare findings on farmland conversion drivers"</CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary-300 transition-colors bg-neutral-50 text-left" onClick={() => handleSend('Summarise evidence on land dispute resolution')}>
                  <CardContent className="p-4 text-sm font-medium text-neutral-700">"Summarise evidence on land dispute resolution"</CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary-300 transition-colors bg-neutral-50 text-left" onClick={() => handleSend('Where do sources disagree on urban sprawl impacts?')}>
                  <CardContent className="p-4 text-sm font-medium text-neutral-700">"Where do sources disagree on urban sprawl impacts?"</CardContent>
                </Card>
                <Card className="cursor-pointer hover:border-primary-300 transition-colors bg-neutral-50 text-left" onClick={() => handleSend('What datasets are available for Haryana?')}>
                  <CardContent className="p-4 text-sm font-medium text-neutral-700">"What datasets are available for Haryana?"</CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8 pb-4">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center shrink-0 mr-4 mt-1">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-primary-50 text-primary-900 px-5 py-3 rounded-2xl rounded-tr-sm' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="mb-2">
                        {msg.grounded ? (
                          <Badge variant="success" className="bg-semantic-success/10 text-semantic-success border-semantic-success/20">Source-backed</Badge>
                        ) : msg.grounded === false ? (
                          <Badge variant="warning" className="bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20">No grounded answer found</Badge>
                        ) : null}
                      </div>
                    )}
                    
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="space-y-4">
                        {renderContentWithCitations(msg.content, msg.sources)}
                        
                        {msg.grounded === false && (
                          <div className="mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-600">
                            <p className="font-medium text-neutral-900 mb-1">Suggestions:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Try rephrasing your question.</li>
                              <li>Remove document filters to widen the scope.</li>
                              <li>Search the repository directly for keywords.</li>
                            </ul>
                          </div>
                        )}

                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-neutral-100">
                            <div className="flex flex-wrap gap-2">
                              {msg.sources.map((src, idx) => (
                                <button key={src.id} onClick={() => setActiveSources(msg.sources!)} className="inline-flex items-center space-x-1 px-2 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-xs text-neutral-600 transition-colors">
                                  <span className="font-semibold">[{idx + 1}]</span>
                                  <span className="truncate max-w-[150px]">{src.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1 mt-2 text-neutral-400">
                          <IconButton icon={Copy} size="sm" variant="ghost" onClick={() => addToast({ type: 'success', title: 'Copied to clipboard' })} />
                          <IconButton icon={Bookmark} size="sm" variant="ghost" onClick={() => setSaveDialog({isOpen: true, payload: { text: msg.content }})} />
                          <IconButton icon={Flag} size="sm" variant="ghost" onClick={() => addToast({ type: 'info', title: 'Feedback recorded' })} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mr-4 mt-1">
                    <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
                  </div>
                  <div className="bg-white border border-neutral-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm min-w-[200px]">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm font-medium text-neutral-500">
                        {loadingStage === 'retrieving' ? 'Retrieving sources...' : 'Drafting answer...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-white border-t border-neutral-200">
          <div className="max-w-3xl mx-auto">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="relative flex items-end bg-white border border-neutral-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-shadow"
            >
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask a question about the evidence base..."
                className="w-full max-h-48 min-h-[56px] py-4 pl-4 pr-12 bg-transparent border-0 focus:ring-0 resize-none text-sm placeholder:text-neutral-400 leading-tight"
                rows={1}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-primary-600 text-white disabled:bg-neutral-100 disabled:text-neutral-400 hover:bg-primary-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-xs text-neutral-400 mt-3">
              Answers are summaries of approved sources, not official advice. Always verify with original documents.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT: Sources Panel */}
      <div className="hidden xl:flex w-80 flex-col bg-neutral-50 border-l border-neutral-200">
        <div className="h-14 border-b border-neutral-200 flex items-center px-4 bg-neutral-50 shrink-0">
          <h2 className="font-semibold text-neutral-700 flex items-center"><FileText className="w-4 h-4 mr-2" /> Sources</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeSources.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <FileText className="w-8 h-8 text-neutral-300 mb-2" />
              <p className="text-sm text-neutral-500">Ask a question to see the retrieved documents here.</p>
            </div>
          ) : (
            activeSources.map((src, idx) => (
              <Card key={`${src.id}-${idx}`} className="bg-white hover:border-primary-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded bg-primary-100 text-primary-700 text-xs font-bold shrink-0">{idx + 1}</span>
                    <span className="text-xs font-medium text-semantic-success bg-semantic-success/10 px-1.5 py-0.5 rounded ml-2 shrink-0">
                      {(src.relevance * 100).toFixed(0)}% match
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-neutral-900 leading-tight mb-1">{src.title}</h4>
                  <p className="text-xs text-neutral-500 mb-2">{src.year} • {src.authors?.[0]}</p>
                  
                  {src.is_illustrative && <Badge variant="illustrative" className="mb-2">Illustrative</Badge>}
                  
                  <div className="text-xs text-neutral-600 bg-neutral-50 p-2 rounded border border-neutral-100 mb-3 italic line-clamp-4">
                    "{src.snippet}"
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => navigate(`/repository/${src.id}`)}>
                      <ExternalLink className="w-3 h-3 mr-1" /> View doc
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AddToProjectDialog isOpen={saveDialog.isOpen} onClose={() => setSaveDialog(prev => ({...prev, isOpen: false}))} itemType="chat_answer" payload={saveDialog.payload} />
    </div>
  );
}
