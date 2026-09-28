# API Contract

**Base path:** `/api/v1`  
**Auth:** Bearer JWT in `Authorization` header. Refresh token in `bhuniti_refresh` httpOnly cookie.  
**Response envelope:** `{ "data": {}, "meta": {}, "error": null }`  
**Error shape:** `{ "code": "...", "message": "...", "details": {} }`  
**Pagination:** `{ "page": 1, "pageSize": 20, "total": 100 }` in `meta`  
**Dates:** ISO 8601 strings  

---

## Auth — `/api/v1/auth`
*(Documented in B3)*

---

## Admin — `/api/v1/admin`
*(Documented in B3)*

---

## Repository & Documents — `/api/v1/documents`

### GET /api/v1/documents
- **Auth:** Optional. Filters applied based on user role visibilities.
- **Query:** `?page=1&pageSize=20&sort=created_at&order=desc&type=&topic=&region=&year_from=&year_to=&organization=&keyword=&status=&query=`
- **Response:** `{ data: Document[], meta: { page, pageSize, total, facets: { type_counts, status_counts, topic_counts } } }`

### GET /api/v1/documents/:id
- **Auth:** Optional.
- **Response:** `{ data: Document }`

### GET /api/v1/documents/:id/file
- **Auth:** Optional.
- **Response:** Streams the file.

### POST /api/v1/documents
- **Auth:** Bearer + `document:create`
- **Content-Type:** `multipart/form-data`
- **Body:** `{ file: File, type, title, abstract, authors, organization_id, year, source_url, language, keywords, topics, visibility, is_illustrative, provenance_note, regions }`
- **Response:** `{ data: Document }`
- **Note:** Sets status to `pending_review`

### PATCH /api/v1/documents/:id
- **Auth:** Bearer + `document:create`
- **Body:** `{ ...fields }`
- **Response:** `{ data: Document }`

### POST /api/v1/documents/:id/approve
- **Auth:** Bearer + `document:approve`
- **Body:** `{ note?: string }`
- **Response:** `{ data: Document }`

### POST /api/v1/documents/:id/reject
- **Auth:** Bearer + `document:approve`
- **Body:** `{ note?: string }`
- **Response:** `{ data: Document }`

---

## Datasets — `/api/v1/datasets`

### GET /api/v1/datasets
- **Auth:** Optional.
- **Query:** `?page=1&pageSize=20&sort=title&order=desc&category=&region=&organization=&status=&visibility=&query=`
- **Response:** `{ data: Dataset[], meta: { page, pageSize, total } }`

### GET /api/v1/datasets/:id
- **Auth:** Optional.
- **Response:** `{ data: Dataset }`

### GET /api/v1/datasets/:id/versions
- **Auth:** Optional.
- **Response:** `{ data: DatasetVersion[] }`

### GET /api/v1/datasets/:id/download
- **Auth:** Optional.
- **Response:** Streams the file of the latest version.

### POST /api/v1/datasets
- **Auth:** Bearer + `dataset:create`
- **Body:** `{ title, description, organization_id, coverage_region_id, time_start, time_end, update_frequency, license, visibility, is_illustrative, provenance_note }`
- **Response:** `{ data: Dataset }`
- **Note:** Sets status to `pending_review`

### POST /api/v1/datasets/:id/versions
- **Auth:** Bearer + `dataset:create`
- **Content-Type:** `multipart/form-data`
- **Body:** `{ file: File, version, row_count, notes }`
- **Response:** `{ data: DatasetVersion }`

### PATCH /api/v1/datasets/:id
- **Auth:** Bearer + `dataset:create`
- **Body:** `{ ...fields }`
- **Response:** `{ data: Dataset }`

### POST /api/v1/datasets/:id/approve
- **Auth:** Bearer + `dataset:approve`
- **Body:** `{ note?: string }`
- **Response:** `{ data: Dataset }`

### POST /api/v1/datasets/:id/reject
- **Auth:** Bearer + `dataset:approve`
- **Body:** `{ note?: string }`
- **Response:** `{ data: Dataset }`

---

## Repository Summary — `/api/v1/repository`

### GET /api/v1/repository/summary
- **Auth:** Optional.
- **Response:** `{ data: { documents: { type, status, visibility, cnt }[], datasets: { status, visibility, cnt }[] } }`

---

## Health

### GET /api/v1/health
- **Auth:** None
- **Response:** `{ data: { service: "healthy", db: "connected"|"unreachable" } }`

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `UNAUTHORIZED` | 401 | No valid token |
| `INVALID_TOKEN` | 401 | Token invalid or expired |
| `MISSING_TOKEN` | 401 | No refresh cookie |
| `FORBIDDEN` | 403 | Insufficient permission |
| `NOT_FOUND` | 404 | Resource not found |
| `FILE_NOT_FOUND` | 404 | Attached file missing from disk |
| `NO_FILE` | 404 | Record has no attached file |
| `RATE_LIMITED` | 429 | Login attempts exceeded |
| `BAD_REQUEST` | 400 | Invalid input |
| `VALIDATION_ERROR` | 422 | Zod schema failure |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
