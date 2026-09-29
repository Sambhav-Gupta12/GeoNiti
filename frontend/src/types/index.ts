// User & Auth
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'policy_analyst' | 'data_administrator' | 'guest';
}

export interface AuthSession {
  access_token: string;
  user: User;
}

export type Permission = 
  | 'admin:users'
  | 'admin:audit'
  | 'document:read'
  | 'document:write'
  | 'document:approve'
  | 'dataset:read'
  | 'dataset:write'
  | 'scenario:run';

// Core entities (simplified for UI binding)
export interface Document {
  id: string;
  title: string;
  abstract?: string;
  authors: string[];
  document_type: string;
  year?: number;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  visibility: 'public' | 'internal' | 'restricted';
  created_at: string;
  url?: string;
}

export interface SearchResult {
  document: Document;
  score: number;
  matched_chunk: { text: string; chunk_index: number };
  why_matched: string;
}

// Error Format
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: any;
}
