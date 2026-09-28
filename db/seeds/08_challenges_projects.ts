import { PoolClient } from 'pg';
import { ORG_IDS } from './01_organizations';
import { USER_IDS } from './02_users';
import { REGION_IDS } from './03_regions';
import { DOC_IDS } from './06_documents';
import { DS_IDS } from './05_datasets';

export async function seed(client: PoolClient): Promise<void> {
  // ── Challenges (Innovation Portal) ───────────────────────────────────────
  const challenges = [
    { type: 'hackathon',   title: 'Land Records AI Hackathon 2024',                    status: 'closed', deadline: '2024-03-31', org: ORG_IDS.nilgs,   desc: 'Build AI tools for automated metadata extraction from land records documents.' },
    { type: 'grant',       title: 'Peri-Urban Land Governance Research Grant',          status: 'open',   deadline: '2025-06-30', org: ORG_IDS.ilpru,   desc: 'Research grants of up to ₹25 lakhs for studies on peri-urban land governance in NCR.' },
    { type: 'pilot',       title: 'Drone Survey Pilot for NCR Fringe Villages',         status: 'open',   deadline: '2025-04-30', org: ORG_IDS.mord,    desc: 'Pilot programme for drone-based cadastral survey in 50 NCR fringe villages.' },
    { type: 'competition', title: 'Land Data Visualisation Challenge',                  status: 'open',   deadline: '2025-02-28', org: ORG_IDS.ncrb,    desc: 'Design effective data visualisations for land governance indicators for public communication.' },
    { type: 'hackathon',   title: 'GIS for Land Dispute Mapping Hackathon',             status: 'open',   deadline: '2025-05-15', org: ORG_IDS.lw_ngo,  desc: 'Develop open-source tools for mapping and analysing land dispute patterns in NCR.' },
    { type: 'grant',       title: 'Groundwater-Land Nexus Research Fellowship',         status: 'open',   deadline: '2025-08-31', org: ORG_IDS.nilgs,   desc: 'Doctoral fellowships for interdisciplinary research on water-land governance linkages.' },
    { type: 'pilot',       title: 'Dispute Resolution Fast Track Court Integration Pilot', status: 'draft', deadline: null,          org: ORG_IDS.mord,  desc: 'Pilot for integrating land records with court case management systems for faster resolution.' },
    { type: 'competition', title: 'Best District Land Governance Scorecard Design',     status: 'closed', deadline: '2024-01-31', org: ORG_IDS.ncrb,    desc: 'Competition to design a replicable district land governance scorecard for NCR.' },
  ];

  for (const c of challenges) {
    await client.query(
      `INSERT INTO challenges(type, title, description, status, deadline, org_id, created_by)
       VALUES($1,$2,$3,$4,$5::timestamptz,$6,$7)
       ON CONFLICT DO NOTHING`,
      [c.type, c.title, c.desc, c.status, c.deadline ? `${c.deadline}T23:59:59Z` : null, c.org, USER_IDS.sysadmin]
    );
  }

  // ── Sample Projects ────────────────────────────────────────────────────────
  const proj1Id = 'bbbbbbbb-0000-0000-0001-000000000001';
  const proj2Id = 'bbbbbbbb-0000-0000-0001-000000000002';

  await client.query(
    `INSERT INTO projects(id, name, description, owner_id, is_public)
     VALUES($1,$2,$3,$4,$5), ($6,$7,$8,$9,$10)
     ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name, updated_at=NOW()`,
    [
      proj1Id, 'NCR Farmland Conversion Study', 'Research project analysing drivers of farmland conversion in NCR fringe districts.', USER_IDS.researcher, false,
      proj2Id, 'Delhi Land Governance Dashboard', 'Policy analysis project building a district-level governance scorecard for Delhi.', USER_IDS.analyst, true,
    ]
  );

  // Project members
  await client.query(
    `INSERT INTO project_members(project_id, user_id, role) VALUES($1,$2,'editor'), ($3,$4,'viewer')
     ON CONFLICT DO NOTHING`,
    [proj1Id, USER_IDS.analyst, proj2Id, USER_IDS.official]
  );

  // Project items
  const items = [
    { proj: proj1Id, type: 'document', id: DOC_IDS.rp1, note: 'Primary reference' },
    { proj: proj1Id, type: 'document', id: DOC_IDS.rp5, note: 'Infrastructure driver hypothesis' },
    { proj: proj1Id, type: 'document', id: DOC_IDS.rp6, note: 'Contradicting demand-side view' },
    { proj: proj1Id, type: 'dataset',  id: DS_IDS.land_use_rs, note: 'Main indicator dataset' },
    { proj: proj2Id, type: 'document', id: DOC_IDS.pd3, note: 'DILRMP programme reference' },
    { proj: proj2Id, type: 'document', id: DOC_IDS.cs2, note: 'Delhi DILRMP case study' },
    { proj: proj2Id, type: 'dataset',  id: DS_IDS.census_land, note: 'Holding size distribution' },
  ];

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    await client.query(
      `INSERT INTO project_items(project_id, item_type, item_id, note, position)
       VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [it.proj, it.type, it.id, it.note, i]
    );
  }

  // ── Saved Searches ─────────────────────────────────────────────────────────
  await client.query(
    `INSERT INTO saved_searches(user_id, name, query, filters)
     VALUES($1,$2,$3,$4), ($5,$6,$7,$8)
     ON CONFLICT DO NOTHING`,
    [
      USER_IDS.researcher, 'Farmland conversion NCR',
      'farmland conversion peri-urban NCR', JSON.stringify({ topics: ['peri-urbanisation'], year_from: 2018 }),
      USER_IDS.analyst, 'DILRMP SVAMITVA land records',
      'DILRMP SVAMITVA land records digitisation', JSON.stringify({ type: 'policy' }),
    ]
  );

  // ── Audit Events (sample) ─────────────────────────────────────────────────
  await client.query(
    `INSERT INTO audit_events(actor_id, action, entity_type, entity_id, meta, ip)
     VALUES
       ($1,'document.approved','document',$2,'{"status":"approved"}'::jsonb,'127.0.0.1'),
       ($3,'document.approved','document',$4,'{"status":"approved"}'::jsonb,'127.0.0.1'),
       ($5,'user.login','user',$6,'{"method":"password"}'::jsonb,'127.0.0.1')`,
    [
      USER_IDS.dataadmin, DOC_IDS.rp1,
      USER_IDS.dataadmin, DOC_IDS.pd3,
      USER_IDS.researcher, USER_IDS.researcher,
    ]
  );
}
