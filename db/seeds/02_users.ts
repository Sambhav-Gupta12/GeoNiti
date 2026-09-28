import { PoolClient } from 'pg';
import bcrypt from 'bcryptjs';
import { ORG_IDS } from './01_organizations';

const HASH = bcrypt.hashSync('Demo@1234', 10);

export const USER_IDS = {
  researcher: '22222222-0000-0000-0000-000000000001',
  analyst:    '22222222-0000-0000-0000-000000000002',
  official:   '22222222-0000-0000-0000-000000000003',
  dataadmin:  '22222222-0000-0000-0000-000000000004',
  sysadmin:   '22222222-0000-0000-0000-000000000005',
};

export async function seed(client: PoolClient): Promise<void> {
  // Fetch role IDs by name
  const roleRes = await client.query(`SELECT id, name FROM roles`);
  const roleMap: Record<string, string> = {};
  for (const r of roleRes.rows) roleMap[r.name] = r.id;

  const users = [
    { id: USER_IDS.researcher, email: 'researcher@bhuniti.demo', full_name: 'Demo Researcher',      role: 'researcher',     org: ORG_IDS.nilgs },
    { id: USER_IDS.analyst,    email: 'analyst@bhuniti.demo',    full_name: 'Demo Policy Analyst',   role: 'policy_analyst', org: ORG_IDS.ilpru },
    { id: USER_IDS.official,   email: 'official@bhuniti.demo',   full_name: 'Demo Govt Official',    role: 'govt_official',  org: ORG_IDS.mord },
    { id: USER_IDS.dataadmin,  email: 'dataadmin@bhuniti.demo',  full_name: 'Demo Data Admin',       role: 'data_admin',     org: ORG_IDS.mord },
    { id: USER_IDS.sysadmin,   email: 'sysadmin@bhuniti.demo',   full_name: 'Demo System Admin',     role: 'system_admin',   org: ORG_IDS.mord },
  ];

  for (const u of users) {
    await client.query(
      `INSERT INTO users(id, email, password_hash, full_name, role_id, organization_id)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET email=EXCLUDED.email, updated_at=NOW()`,
      [u.id, u.email, HASH, u.full_name, roleMap[u.role], u.org]
    );
  }
}
