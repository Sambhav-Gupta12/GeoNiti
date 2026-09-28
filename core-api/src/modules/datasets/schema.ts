import { z } from 'zod';

export const listDatasetsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['created_at', 'title']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  category: z.string().optional(),
  region: z.string().optional(),
  organization: z.string().uuid().optional(),
  visibility: z.enum(['public', 'internal', 'restricted']).optional(),
  status: z.enum(['draft', 'pending_review', 'approved', 'rejected']).optional(),
  query: z.string().optional(),
});

export type ListDatasetsQuery = z.infer<typeof listDatasetsSchema>;

export const createDatasetSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  coverage_region_id: z.string().uuid().optional(),
  time_start: z.string().optional(), // Date string
  time_end: z.string().optional(),
  update_frequency: z.string().optional(),
  license: z.string().optional(),
  visibility: z.enum(['public', 'internal', 'restricted']).default('internal'),
  is_illustrative: z.coerce.boolean().default(false),
  provenance_note: z.string().optional(),
});

export const createDatasetVersionSchema = z.object({
  version: z.string().min(1),
  row_count: z.coerce.number().int().optional(),
  notes: z.string().optional(),
});

export const patchDatasetSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  organization_id: z.string().uuid().optional().nullable(),
  coverage_region_id: z.string().uuid().optional().nullable(),
  time_start: z.string().optional().nullable(),
  time_end: z.string().optional().nullable(),
  update_frequency: z.string().optional().nullable(),
  license: z.string().optional().nullable(),
  visibility: z.enum(['public', 'internal', 'restricted']).optional(),
  is_illustrative: z.boolean().optional(),
  provenance_note: z.string().optional().nullable(),
});

export const approveDatasetSchema = z.object({
  note: z.string().optional(),
});
