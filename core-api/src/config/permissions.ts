// Permission map: role -> list of allowed action strings.
// RBAC is declarative; adding a new role only requires entries here.

export type Role =
  | 'public'
  | 'researcher'
  | 'policy_analyst'
  | 'govt_official'
  | 'data_admin'
  | 'system_admin';

export type Action =
  | 'document:read_public'
  | 'document:read_internal'
  | 'document:read_restricted'
  | 'document:create'
  | 'document:approve'
  | 'document:delete'
  | 'dataset:read_public'
  | 'dataset:read_internal'
  | 'dataset:read_restricted'
  | 'dataset:create'
  | 'dataset:approve'
  | 'scenario:run'
  | 'project:create'
  | 'project:read'
  | 'chat:create'
  | 'admin:users'
  | 'admin:audit';

export type Visibility = 'public' | 'internal' | 'restricted';

const PERMISSIONS: Record<Role, Action[]> = {
  public: [
    'document:read_public',
    'dataset:read_public',
  ],
  researcher: [
    'document:read_public', 'document:read_internal', 'document:create',
    'dataset:read_public', 'dataset:read_internal',
    'scenario:run', 'project:create', 'project:read', 'chat:create',
  ],
  policy_analyst: [
    'document:read_public', 'document:read_internal', 'document:create',
    'dataset:read_public', 'dataset:read_internal',
    'scenario:run', 'project:create', 'project:read', 'chat:create',
  ],
  govt_official: [
    'document:read_public', 'document:read_internal',
    'dataset:read_public', 'dataset:read_internal',
    'project:read',
  ],
  data_admin: [
    'document:read_public', 'document:read_internal', 'document:read_restricted',
    'document:create', 'document:approve', 'document:delete',
    'dataset:read_public', 'dataset:read_internal', 'dataset:read_restricted',
    'dataset:create', 'dataset:approve',
    'project:read', 'chat:create', 'admin:audit',
  ],
  system_admin: [
    'document:read_public', 'document:read_internal', 'document:read_restricted',
    'document:create', 'document:approve', 'document:delete',
    'dataset:read_public', 'dataset:read_internal', 'dataset:read_restricted',
    'dataset:create', 'dataset:approve',
    'scenario:run', 'project:create', 'project:read', 'chat:create',
    'admin:users', 'admin:audit',
  ],
};

export function hasPermission(role: string, action: Action): boolean {
  const normalised = (PERMISSIONS[role as Role] ?? PERMISSIONS.public);
  return normalised.includes(action);
}

export function getPermissions(role: string): Action[] {
  return PERMISSIONS[role as Role] ?? PERMISSIONS.public;
}

/** Visibility levels this role may read. Every list/search/detail query must apply this filter. */
export function getAllowedVisibilities(role: string): Visibility[] {
  switch (role as Role) {
    case 'data_admin':
    case 'system_admin':
      return ['public', 'internal', 'restricted'];
    case 'researcher':
    case 'policy_analyst':
    case 'govt_official':
      return ['public', 'internal'];
    default:
      return ['public'];
  }
}

export function getAllowedStatuses(role: string): string[] {
  switch (role as Role) {
    case 'data_admin':
    case 'system_admin':
      return ['draft', 'pending_review', 'approved', 'rejected'];
    default:
      return ['approved'];
  }
}
