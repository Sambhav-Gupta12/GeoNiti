import { PoolClient } from 'pg';
import { ORG_IDS } from './01_organizations';
import { REGION_IDS } from './03_regions';
import { IND_IDS } from './04_indicators';
import { DS_IDS } from './05_datasets';
import { DOC_IDS } from './06_documents';

const POL_IDS = {
  p1: 'aaaaaaaa-0000-0000-0001-000000000001',
  p2: 'aaaaaaaa-0000-0000-0001-000000000002',
  p3: 'aaaaaaaa-0000-0000-0001-000000000003',
  p4: 'aaaaaaaa-0000-0000-0001-000000000004',
  p5: 'aaaaaaaa-0000-0000-0001-000000000005',
  p6: 'aaaaaaaa-0000-0000-0001-000000000006',
};

export async function seed(client: PoolClient): Promise<void> {
  // ── Policies ──────────────────────────────────────────────────────────────
  const policies = [
    { id: POL_IDS.p1, name: 'DILRMP — Digital India Land Records Modernisation Programme', description: 'Centrally Sponsored Scheme for digitising land records, computerising registration, and integrating records.', level: 'national', start_year: 2008, end_year: null, status: 'active', region: REGION_IDS.india, source_doc: DOC_IDS.pd3 },
    { id: POL_IDS.p2, name: 'SVAMITVA — Survey of Villages Abadi and Mapping', description: 'Drone-survey-based property rights formalisation for rural abadi areas.', level: 'national', start_year: 2020, end_year: null, status: 'active', region: REGION_IDS.india, source_doc: DOC_IDS.pd4 },
    { id: POL_IDS.p3, name: 'LARR Act 2013 — Land Acquisition Framework', description: 'Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act 2013.', level: 'national', start_year: 2013, end_year: null, status: 'active', region: REGION_IDS.india, source_doc: DOC_IDS.ld1 },
    { id: POL_IDS.p4, name: 'NCR Regional Plan 2041 — Agricultural Land Protection Provisions', description: 'Agricultural Priority Zones and TDR instruments for farmland retention in NCR.', level: 'national', start_year: 2021, end_year: 2041, status: 'active', region: REGION_IDS.india, source_doc: DOC_IDS.pd1 },
    { id: POL_IDS.p5, name: 'Haryana Panchayati Raj Land Records Management Policy 2019', description: 'State-level land records management under Panchayati Raj framework.', level: 'state', start_year: 2019, end_year: null, status: 'active', region: REGION_IDS.haryana, source_doc: DOC_IDS.pd2 },
    { id: POL_IDS.p6, name: 'NCR Groundwater Conservation Directive (Illustrative)', description: 'Illustrative state-level directive for groundwater conservation in NCR over-exploited blocks.', level: 'state', start_year: 2015, end_year: null, status: 'active', region: REGION_IDS.india, source_doc: null },
  ];

  for (const p of policies) {
    await client.query(
      `INSERT INTO policies(id, name, description, level, start_year, end_year, status, region_id, source_document_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name, updated_at=NOW()`,
      [p.id, p.name, p.description, p.level, p.start_year, p.end_year, p.status, p.region, p.source_doc]
    );
  }

  // ── Evidence Links (knowledge graph edges) ────────────────────────────────
  // Policy -> Document
  const polDocLinks = [
    { src: 'policy', sid: POL_IDS.p1, tgt: 'document', tid: DOC_IDS.pd3, rel: 'implements' },
    { src: 'policy', sid: POL_IDS.p2, tgt: 'document', tid: DOC_IDS.pd4, rel: 'implements' },
    { src: 'policy', sid: POL_IDS.p3, tgt: 'document', tid: DOC_IDS.ld1, rel: 'implements' },
    { src: 'policy', sid: POL_IDS.p4, tgt: 'document', tid: DOC_IDS.pd1, rel: 'implements' },
    { src: 'policy', sid: POL_IDS.p1, tgt: 'document', tid: DOC_IDS.cs2, rel: 'evaluated_by' },
    { src: 'policy', sid: POL_IDS.p2, tgt: 'document', tid: DOC_IDS.rp4, rel: 'evaluated_by' },
    { src: 'policy', sid: POL_IDS.p3, tgt: 'document', tid: DOC_IDS.cs1, rel: 'evaluated_by' },
    { src: 'policy', sid: POL_IDS.p4, tgt: 'document', tid: DOC_IDS.rp1, rel: 'evaluated_by' },
    // Document -> Document (cites / conflicts)
    { src: 'document', sid: DOC_IDS.rp6, tgt: 'document', tid: DOC_IDS.rp5, rel: 'contradicts' },
    { src: 'document', sid: DOC_IDS.rp1, tgt: 'document', tid: DOC_IDS.rp5, rel: 'supports' },
    { src: 'document', sid: DOC_IDS.rp3, tgt: 'document', tid: DOC_IDS.cs1, rel: 'cites' },
    { src: 'document', sid: DOC_IDS.rp2, tgt: 'document', tid: DOC_IDS.cs3, rel: 'cites' },
    { src: 'document', sid: DOC_IDS.rp4, tgt: 'document', tid: DOC_IDS.pd4, rel: 'cites' },
    // Document -> Dataset
    { src: 'document', sid: DOC_IDS.rp1, tgt: 'dataset', tid: DS_IDS.land_use_rs, rel: 'uses' },
    { src: 'document', sid: DOC_IDS.rp2, tgt: 'dataset', tid: DS_IDS.gw_depth, rel: 'uses' },
    { src: 'document', sid: DOC_IDS.rp3, tgt: 'dataset', tid: DS_IDS.court_data, rel: 'uses' },
    { src: 'document', sid: DOC_IDS.rp5, tgt: 'dataset', tid: DS_IDS.road_infra, rel: 'uses' },
    { src: 'document', sid: DOC_IDS.rp6, tgt: 'dataset', tid: DS_IDS.census_land, rel: 'uses' },
    // Document -> Region
    { src: 'document', sid: DOC_IDS.cs3, tgt: 'region', tid: REGION_IDS.baghpat, rel: 'covers' },
    { src: 'document', sid: DOC_IDS.cs1, tgt: 'region', tid: REGION_IDS.gurugram, rel: 'covers' },
    { src: 'document', sid: DOC_IDS.rp2, tgt: 'region', tid: REGION_IDS.gnb, rel: 'covers' },
    // Dataset -> Indicator
    { src: 'dataset', sid: DS_IDS.land_use_rs, tgt: 'indicator', tid: IND_IDS.built_up, rel: 'measures' },
    { src: 'dataset', sid: DS_IDS.land_use_rs, tgt: 'indicator', tid: IND_IDS.cropland, rel: 'measures' },
    { src: 'dataset', sid: DS_IDS.gw_depth, tgt: 'indicator', tid: IND_IDS.gw_depth, rel: 'measures' },
    { src: 'dataset', sid: DS_IDS.road_infra, tgt: 'indicator', tid: IND_IDS.road_density, rel: 'measures' },
    { src: 'dataset', sid: DS_IDS.court_data, tgt: 'indicator', tid: IND_IDS.disputes, rel: 'measures' },
    // Region -> Indicator (covers relationship)
    { src: 'region', sid: REGION_IDS.gurugram, tgt: 'indicator', tid: IND_IDS.built_up, rel: 'has_high' },
    { src: 'region', sid: REGION_IDS.baghpat, tgt: 'indicator', tid: IND_IDS.gw_depth, rel: 'has_anomaly' },
  ];

  for (const lnk of polDocLinks) {
    await client.query(
      `INSERT INTO evidence_links(source_type, source_id, target_type, target_id, relation)
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT DO NOTHING`,
      [lnk.src, lnk.sid, lnk.tgt, lnk.tid, lnk.rel]
    );
  }

  // ── GeoLayers ─────────────────────────────────────────────────────────────
  const geoLayers = [
    { key: 'ncr_admin_boundaries', name: 'NCR Administrative Boundaries', category: 'land_use', source: 'BhuNiti Demo Seed', res: 'Schematic (bbox approximations)', illustrative: true, style: { color: '#1B4460', weight: 2, fillOpacity: 0.05 } },
    { key: 'ncr_land_cover_2024', name: 'NCR Land Cover 2024', category: 'land_use', source: 'Illustrative classification', res: '~100m illustrative', illustrative: true, style: { palette: 'land_cover' } },
    { key: 'ncr_groundwater_depth', name: 'NCR Groundwater Depth 2024', category: 'climate', source: 'CGWB (illustrative)', res: 'District-level', illustrative: true, style: { palette: 'blues_r' } },
    { key: 'ncr_road_network', name: 'NCR Road Network (Schematic)', category: 'infrastructure', source: 'OpenStreetMap (illustrative extract)', res: 'Schematic', illustrative: true, style: { color: '#C8891A', weight: 1 } },
    { key: 'ncr_disputes_density', name: 'NCR Land Dispute Density', category: 'socio_economic', source: 'Illustrative court data', res: 'District-level', illustrative: true, style: { palette: 'reds' } },
  ];

  for (const gl of geoLayers) {
    await client.query(
      `INSERT INTO geo_layers(key, name, category, source, resolution_note, is_illustrative, style)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT(key) DO UPDATE SET name=EXCLUDED.name, updated_at=NOW()`,
      [gl.key, gl.name, gl.category, gl.source, gl.res, gl.illustrative, JSON.stringify(gl.style)]
    );
  }
}
