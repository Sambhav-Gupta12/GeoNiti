# API Contract

(Placeholder: Filled in as endpoints are built)

## Conventions
- Base Path: `/api/v1`
- JSON Envelope: `{ "data": {}, "meta": {}, "error": null }`
- Error Shape: `{ "code": "...", "message": "...", "details": {} }`
- Pagination: `{ "page": 1, "pageSize": 20, "total": 100 }`
- Dates: ISO 8601 strings
- Authentication: Bearer JWT
