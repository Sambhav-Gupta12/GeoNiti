import { describe, it, expect } from 'vitest';
import { hasPermission, getAllowedVisibilities } from '../config/permissions';

describe('RBAC permission checks', () => {
  // Guest / public
  it('guest can read public documents', () => {
    expect(hasPermission('public', 'document:read_public')).toBe(true);
  });

  it('guest cannot read internal documents', () => {
    expect(hasPermission('public', 'document:read_internal')).toBe(false);
  });

  it('guest cannot read restricted documents', () => {
    expect(hasPermission('public', 'document:read_restricted')).toBe(false);
  });

  // Researcher
  it('researcher can read internal documents', () => {
    expect(hasPermission('researcher', 'document:read_internal')).toBe(true);
  });

  it('researcher cannot read restricted documents', () => {
    expect(hasPermission('researcher', 'document:read_restricted')).toBe(false);
  });

  it('researcher cannot approve documents', () => {
    expect(hasPermission('researcher', 'document:approve')).toBe(false);
  });

  it('researcher can run scenarios', () => {
    expect(hasPermission('researcher', 'scenario:run')).toBe(true);
  });

  // Policy Analyst
  it('policy_analyst cannot approve documents', () => {
    expect(hasPermission('policy_analyst', 'document:approve')).toBe(false);
  });

  it('policy_analyst cannot access admin:users', () => {
    expect(hasPermission('policy_analyst', 'admin:users')).toBe(false);
  });

  // Government Official
  it('govt_official cannot create documents', () => {
    expect(hasPermission('govt_official', 'document:create')).toBe(false);
  });

  it('govt_official cannot run scenarios', () => {
    expect(hasPermission('govt_official', 'scenario:run')).toBe(false);
  });

  // Data Admin
  it('data_admin can approve documents', () => {
    expect(hasPermission('data_admin', 'document:approve')).toBe(true);
  });

  it('data_admin can read restricted datasets', () => {
    expect(hasPermission('data_admin', 'dataset:read_restricted')).toBe(true);
  });

  it('data_admin cannot manage users', () => {
    expect(hasPermission('data_admin', 'admin:users')).toBe(false);
  });

  // System Admin
  it('system_admin can do everything', () => {
    const actions = [
      'document:approve', 'document:read_restricted',
      'dataset:approve', 'dataset:read_restricted',
      'admin:users', 'admin:audit', 'scenario:run',
    ] as const;
    for (const action of actions) {
      expect(hasPermission('system_admin', action)).toBe(true);
    }
  });

  // Visibility helpers
  it('public role sees only public visibility', () => {
    expect(getAllowedVisibilities('public')).toEqual(['public']);
  });

  it('researcher sees public and internal', () => {
    expect(getAllowedVisibilities('researcher')).toContain('internal');
    expect(getAllowedVisibilities('researcher')).not.toContain('restricted');
  });

  it('data_admin sees public, internal, and restricted', () => {
    expect(getAllowedVisibilities('data_admin')).toEqual(['public', 'internal', 'restricted']);
  });

  it('unknown role defaults to public visibility', () => {
    expect(getAllowedVisibilities('unknown_role')).toEqual(['public']);
  });
});
