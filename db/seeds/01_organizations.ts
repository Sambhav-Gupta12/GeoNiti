import { PoolClient } from 'pg';

export const ORG_IDS = {
  mord:    '11111111-0000-0000-0000-000000000001',
  delhi_rev: '11111111-0000-0000-0000-000000000002',
  haryana_rev: '11111111-0000-0000-0000-000000000003',
  up_rev:  '11111111-0000-0000-0000-000000000004',
  ilpru:   '11111111-0000-0000-0000-000000000005', // Illustrative Land Policy Research Unit
  ncrb:    '11111111-0000-0000-0000-000000000006', // NCR Planning Board Research Cell
  nilgs:   '11111111-0000-0000-0000-000000000007', // National Institute of Land Governance Studies
  lw_ngo:  '11111111-0000-0000-0000-000000000008', // Delhi-NCR Civil Society Land Watch
};

export async function seed(client: PoolClient): Promise<void> {
  const orgs = [
    { id: ORG_IDS.mord,        name: 'Ministry of Rural Development',            type: 'ministry' },
    { id: ORG_IDS.delhi_rev,   name: 'Delhi Revenue Department',                 type: 'state_dept' },
    { id: ORG_IDS.haryana_rev, name: 'Haryana Department of Revenue',            type: 'state_dept' },
    { id: ORG_IDS.up_rev,      name: 'UP Revenue Board',                         type: 'state_dept' },
    { id: ORG_IDS.ilpru,       name: 'Illustrative Land Policy Research Unit',   type: 'research_org' },
    { id: ORG_IDS.ncrb,        name: 'NCR Planning Board Research Cell',         type: 'research_org' },
    { id: ORG_IDS.nilgs,       name: 'National Institute of Land Governance Studies', type: 'university' },
    { id: ORG_IDS.lw_ngo,      name: 'Delhi-NCR Civil Society Land Watch',       type: 'ngo' },
  ];

  for (const o of orgs) {
    await client.query(
      `INSERT INTO organizations(id, name, type) VALUES($1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, updated_at=NOW()`,
      [o.id, o.name, o.type]
    );
  }
}
