import { PoolClient } from 'pg';
import { ORG_IDS } from './01_organizations';
import { REGION_IDS } from './03_regions';
import { IND_IDS } from './04_indicators';

export const DS_IDS = {
  land_use_rs:   '55555555-0000-0000-0001-000000000001',
  road_infra:    '55555555-0000-0000-0001-000000000002',
  gw_depth:      '55555555-0000-0000-0001-000000000003',
  land_records:  '55555555-0000-0000-0001-000000000004', // restricted
  court_data:    '55555555-0000-0000-0001-000000000005', // restricted
  land_price:    '55555555-0000-0000-0001-000000000006',
  climate_risk:  '55555555-0000-0000-0001-000000000007',
  census_land:   '55555555-0000-0000-0001-000000000008',
  pending_ds:    '55555555-0000-0000-0001-000000000009', // pending_review
};

export const DV_IDS: Record<string, string> = {
  land_use_rs_v1: '55555555-0000-0000-0002-000000000001',
  road_infra_v1:  '55555555-0000-0000-0002-000000000002',
  gw_depth_v1:    '55555555-0000-0000-0002-000000000003',
  land_records_v1:'55555555-0000-0000-0002-000000000004',
  court_data_v1:  '55555555-0000-0000-0002-000000000005',
  land_price_v1:  '55555555-0000-0000-0002-000000000006',
  climate_risk_v1:'55555555-0000-0000-0002-000000000007',
  census_land_v1: '55555555-0000-0000-0002-000000000008',
  pending_ds_v1:  '55555555-0000-0000-0002-000000000009',
};

type DS = {
  id: string; title: string; description: string; org: string;
  region: string; time_start: string; time_end: string;
  freq: string; license: string; visibility: string; status: string;
  illustrative: boolean; provenance: string;
  version_id: string; version: string; row_count: number;
};

const datasets: DS[] = [
  {
    id: DS_IDS.land_use_rs, org: ORG_IDS.nilgs, region: REGION_IDS.india,
    title: 'Delhi-NCR Land-Use / Land-Cover Time Series 2005-2024',
    description: 'Annual land-cover classification for 12 Delhi-NCR districts derived from multi-temporal analysis. Includes built-up, cropland, water, forest, and fallow categories.',
    time_start: '2005-01-01', time_end: '2024-12-31', freq: 'annual', license: 'CC BY 4.0',
    visibility: 'public', status: 'approved', illustrative: true,
    provenance: 'Illustrative dataset generated for BhuNiti demo. Values approximate observed NCR urbanisation trends but are not official survey data.',
    version_id: DV_IDS.land_use_rs_v1, version: '1.0', row_count: 2400,
  },
  {
    id: DS_IDS.road_infra, org: ORG_IDS.mord, region: REGION_IDS.india,
    title: 'NCR Road Density Estimates 2005-2024',
    description: 'District-level road density estimates (km of road per km² of area) for NCR districts, derived from planning reports.',
    time_start: '2005-01-01', time_end: '2024-12-31', freq: 'annual', license: 'CC BY 4.0',
    visibility: 'public', status: 'approved', illustrative: true,
    provenance: 'Illustrative estimates. Real road length data should be sourced from NRIDA or state PWD departments.',
    version_id: DV_IDS.road_infra_v1, version: '1.0', row_count: 240,
  },
  {
    id: DS_IDS.gw_depth, org: ORG_IDS.ilpru, region: REGION_IDS.india,
    title: 'NCR Groundwater Depth Annual Observations 2005-2024',
    description: 'Pre-monsoon groundwater depth observations for NCR districts, 2005-2024. Illustrative trend data based on published depletion rates.',
    time_start: '2005-01-01', time_end: '2024-12-31', freq: 'annual', license: 'CC BY 4.0',
    visibility: 'public', status: 'approved', illustrative: true,
    provenance: 'Illustrative data. Real data available from Central Ground Water Board (CGWB) state groundwater reports.',
    version_id: DV_IDS.gw_depth_v1, version: '1.0', row_count: 240,
  },
  {
    id: DS_IDS.land_records, org: ORG_IDS.delhi_rev, region: REGION_IDS.delhi_s,
    title: 'Delhi Land Records Digitisation Status (Internal)',
    description: 'Internal administrative dataset tracking parcel-level digitisation progress across Delhi revenue circles. Contains PII-adjacent administrative identifiers.',
    time_start: '2018-01-01', time_end: '2024-12-31', freq: 'quarterly', license: 'Restricted',
    visibility: 'restricted', status: 'approved', illustrative: false,
    provenance: 'Official Delhi Revenue Department internal dataset. Restricted: contains administrative identifiers. Must not enter public search or RAG.',
    version_id: DV_IDS.land_records_v1, version: '2024-Q4', row_count: 85000,
  },
  {
    id: DS_IDS.court_data, org: ORG_IDS.ilpru, region: REGION_IDS.india,
    title: 'NCR Land Dispute Court Cases Dataset (Confidential)',
    description: 'Court case registry extract for land disputes in NCR districts. Restricted due to ongoing legal proceedings.',
    time_start: '2010-01-01', time_end: '2023-12-31', freq: 'annual', license: 'Restricted',
    visibility: 'restricted', status: 'approved', illustrative: true,
    provenance: 'Illustrative court case counts derived from published district judiciary reports. Restricted flag applied out of caution.',
    version_id: DV_IDS.court_data_v1, version: '1.0', row_count: 12000,
  },
  {
    id: DS_IDS.land_price, org: ORG_IDS.ncrb, region: REGION_IDS.india,
    title: 'NCR Land Price Index 2005-2024',
    description: 'Illustrative composite land price index for NCR districts. Base year 2010 = 100.',
    time_start: '2005-01-01', time_end: '2024-12-31', freq: 'annual', license: 'CC BY 4.0',
    visibility: 'public', status: 'approved', illustrative: true,
    provenance: 'Illustrative index based on reported trends in stamp duty valuations and registration data. Not official DLC rates.',
    version_id: DV_IDS.land_price_v1, version: '1.0', row_count: 240,
  },
  {
    id: DS_IDS.climate_risk, org: ORG_IDS.nilgs, region: REGION_IDS.india,
    title: 'NCR Climate Vulnerability Index 2005-2024',
    description: 'Composite climate vulnerability index for NCR districts combining heat stress, flood risk, groundwater stress and cropland exposure.',
    time_start: '2005-01-01', time_end: '2024-12-31', freq: 'annual', license: 'CC BY 4.0',
    visibility: 'public', status: 'approved', illustrative: true,
    provenance: 'Illustrative composite index. Component weights are illustrative and not from an official methodology.',
    version_id: DV_IDS.climate_risk_v1, version: '1.0', row_count: 240,
  },
  {
    id: DS_IDS.census_land, org: ORG_IDS.mord, region: REGION_IDS.india,
    title: 'NCR Agricultural Census Land Holding Summary',
    description: 'District-level summary of land holding size distribution from agricultural census rounds (2005-06, 2010-11, 2015-16, 2020-21).',
    time_start: '2005-01-01', time_end: '2021-12-31', freq: 'quinquennial', license: 'Government Open Data',
    visibility: 'public', status: 'approved', illustrative: true,
    provenance: 'Illustrative summary modelled on Agriculture Census published tables. District-level figures are illustrative.',
    version_id: DV_IDS.census_land_v1, version: '1.0', row_count: 48,
  },
  {
    id: DS_IDS.pending_ds, org: ORG_IDS.lw_ngo, region: REGION_IDS.india,
    title: 'NCR Informal Settlement Land Tenure Survey 2023',
    description: 'Ground-truthed survey of land tenure security in NCR peri-urban informal settlements. Pending data quality review.',
    time_start: '2023-01-01', time_end: '2023-12-31', freq: 'one-off', license: 'CC BY-NC 4.0',
    visibility: 'internal', status: 'pending_review', illustrative: true,
    provenance: 'Illustrative survey data. Survey methodology document attached. Under review by data admin.',
    version_id: DV_IDS.pending_ds_v1, version: '0.9-draft', row_count: 3200,
  },
];

export async function seed(client: PoolClient): Promise<void> {
  for (const d of datasets) {
    // Insert version first (no FK to dataset yet)
    await client.query(
      `INSERT INTO dataset_versions(id, dataset_id, version, row_count, notes, created_at)
       VALUES($1,$2,$3,$4,$5,NOW())
       ON CONFLICT(id) DO NOTHING`,
      [d.version_id, d.id, d.version, d.row_count, `Initial version for BhuNiti demo seed.`]
    );

    await client.query(
      `INSERT INTO datasets(id, title, description, organization_id, coverage_region_id,
         time_start, time_end, update_frequency, license, visibility, status,
         is_illustrative, provenance_note, current_version_id)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title, updated_at=NOW()`,
      [d.id, d.title, d.description, d.org, d.region,
       d.time_start, d.time_end, d.freq, d.license,
       d.visibility, d.status, d.illustrative, d.provenance, d.version_id]
    );
  }

  // Link datasets to indicators via source_dataset_id updates
  const indDatasetMap: Array<[string, string]> = [
    [IND_IDS.built_up,     DS_IDS.land_use_rs],
    [IND_IDS.cropland,     DS_IDS.land_use_rs],
    [IND_IDS.pop_density,  DS_IDS.census_land],
    [IND_IDS.road_density, DS_IDS.road_infra],
    [IND_IDS.gw_depth,     DS_IDS.gw_depth],
    [IND_IDS.disputes,     DS_IDS.court_data],
    [IND_IDS.land_price,   DS_IDS.land_price],
    [IND_IDS.climate_vul,  DS_IDS.climate_risk],
  ];
  for (const [indId, dsId] of indDatasetMap) {
    await client.query(`UPDATE indicators SET source_dataset_id=$1 WHERE id=$2`, [dsId, indId]);
  }
}
