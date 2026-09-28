# API Contract

**Base path:** `/api/v1`  
**Auth:** Bearer JWT in `Authorization` header. Refresh token in `bhuniti_refresh` httpOnly cookie.  
**Response envelope:** `{ "data": {}, "meta": {}, "error": null }`  
**Error shape:** `{ "code": "...", "message": "...", "details": {} }`  
**Pagination:** `{ "page": 1, "pageSize": 20, "total": 100 }` in `meta`  
**Dates:** ISO 8601 strings  

---

## Auth — `/api/v1/auth`

### POST /api/v1/auth/login
- **Auth:** None (rate-limited: 5 req / 15 min per IP)
- **Body:** `{ email: string, password: string }`
- **Response:** `{ data: { accessToken: string, user: { id, email, role, orgId } } }`
- **Errors:** `401 INVALID_CREDENTIALS`, `429 RATE_LIMITED`, `400 VALIDATION_ERROR`

### POST /api/v1/auth/refresh
- **Auth:** `bhuniti_refresh` httpOnly cookie
- **Response:** `{ data: { accessToken: string } }` + rotated refresh cookie
- **Errors:** `401 MISSING_TOKEN`, `401 INVALID_TOKEN`

### POST /api/v1/auth/logout
- **Auth:** Bearer (optional)
- **Response:** `{ data: { message: "Logged out." } }` — clears cookie
- **Audit:** Writes `user.logout`

### GET /api/v1/auth/me
- **Auth:** Bearer required
- **Response:** `{ data: { id, email, role, orgId } }`
- **Errors:** `401 UNAUTHORIZED`

### GET /api/v1/auth/permissions
- **Auth:** Bearer (optional; returns `public` permissions if not authenticated)
- **Response:** `{ data: { role: string, permissions: string[] } }`

---

## Admin — `/api/v1/admin`

> All admin routes require `admin:users` permission (system_admin only).

### GET /api/v1/admin/users
- **Auth:** Bearer + `admin:users`
- **Query:** `?page=1&pageSize=20`
- **Response:** `{ data: UserRow[], meta: { page, pageSize, total } }`

### GET /api/v1/admin/users/:id
- **Auth:** Bearer + `admin:users`
- **Response:** `{ data: UserRow }`
- **Errors:** `404 NOT_FOUND`

### PATCH /api/v1/admin/users/:id
- **Auth:** Bearer + `admin:users`
- **Body:** `{ is_active?: boolean, role_id?: string (uuid) }`
- **Response:** `{ data: UserRow }`
- **Audit:** Writes `admin.user.update`
- **Errors:** `400 BAD_REQUEST`, `404 NOT_FOUND`

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
| `RATE_LIMITED` | 429 | Login attempts exceeded |
| `BAD_REQUEST` | 400 | Invalid input |
| `VALIDATION_ERROR` | 422 | Zod schema failure |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

*Further endpoints will be documented as they are built (B3+).*
