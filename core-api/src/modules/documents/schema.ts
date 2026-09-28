import { z } from 'zod';

export const listDocumentsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'year', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  type: z.string().optional(),
  topic: z.string().optional(),
  region: z.string().optional(),
  year_from: z.coerce.number().int().optional(),
  year_to: z.coerce.number().int().optional(),
  organization: z.string().uuid().optional(),
  keyword: z.string().optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
  query: z.string().optional(),
});

export type ListDocumentsQuery = z.infer<typeof listDocumentsSchema>;

export const uploadDocumentSchema = z.object({
  type: z.enum(['research_paper', 'policy', 'legal', 'case_study', 'report']),
  title: z.string().min(1),
  abstract: z.string().optional(),
  authors: z.string().optional(), // JSON array string
  organization_id: z.string().uuid().optional(),
  year: z.coerce.number().int().min(1900).max(2100),
  source_url: z.string().url().optional().or(z.literal('')),
  language: z.string().default('en'),
  keywords: z.string().optional(), // JSON array string
  topics: z.string().optional(), // JSON array string
  visibility: z.enum(['public', 'internal', 'restricted']).default('internal'),
  is_illustrative: z.coerce.boolean().default(false),
  provenance_note: z.string().optional(),
  regions: z.string().optional(), // JSON array string of UUIDs
});

export const patchDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  abstract: z.string().optional(),
  authors: z.array(z.string()).optional(),
  organization_id: z.string().uuid().optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  source_url: z.string().url().optional().nullable(),
  language: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  topics: z.array(z.string()).optional(),
  visibility: z.enum(['public', 'internal', 'restricted']).optional(),
  is_illustrative: z.boolean().optional(),
  provenance_note: z.string().optional().nullable(),
});

export const approveDocumentSchema = z.object({
  note: z.string().optional(),
});
