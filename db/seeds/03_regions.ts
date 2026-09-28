import { PoolClient } from 'pg';

// Simplified rectangular MultiPolygon WKT from approximate bounding boxes.
// These are schematic boundaries. UI must footnote "Schematic boundaries – not official survey data."
function bbox(minLon: number, minLat: number, maxLon: number, maxLat: number): string {
  return `MULTIPOLYGON (((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat})))`;
}
function centroid(minLon: number, minLat: number, maxLon: number, maxLat: number): string {
  return `POINT(${(minLon + maxLon) / 2} ${(minLat + maxLat) / 2})`;
}

export const REGION_IDS = {
  india:   '33333333-0000-0000-0000-000000000001',
  delhi_s: '33333333-0000-0000-0000-000000000002',
  haryana: '33333333-0000-0000-0000-000000000003',
  up:      '33333333-0000-0000-0000-000000000004',
  // Districts
  delhi_d:   '33333333-0000-0000-0001-000000000001',
  gurugram:  '33333333-0000-0000-0001-000000000002',
  faridabad: '33333333-0000-0000-0001-000000000003',
  sonipat:   '33333333-0000-0000-0001-000000000004',
  jhajjar:   '33333333-0000-0000-0001-000000000005',
  rewari:    '33333333-0000-0000-0001-000000000006',
  palwal:    '33333333-0000-0000-0001-000000000007',
  gnb:       '33333333-0000-0000-0001-000000000008', // Gautam Buddha Nagar
  ghaziabad: '33333333-0000-0000-0001-000000000009',
  meerut:    '33333333-0000-0000-0001-000000000010',
  baghpat:   '33333333-0000-0000-0001-000000000011',
  bulandshahr: '33333333-0000-0000-0001-000000000012',
};

type Region = {
  id: string; code: string; name: string; level: string;
  parent_id: string | null; geom: string; centroid: string;
  population: number | null; area_km2: number | null;
};

const regions: Region[] = [
  { id: REGION_IDS.india,   code: 'IN',    name: 'India',              level: 'country',  parent_id: null,            geom: bbox(68.0,8.0,97.0,37.0),        centroid: centroid(68.0,8.0,97.0,37.0),       population: 1417000000, area_km2: 3287263 },
  { id: REGION_IDS.delhi_s, code: 'IN-DL', name: 'Delhi (NCT)',        level: 'state',    parent_id: REGION_IDS.india, geom: bbox(76.838,28.404,77.348,28.884), centroid: centroid(76.838,28.404,77.348,28.884), population: 20000000, area_km2: 1484 },
  { id: REGION_IDS.haryana, code: 'IN-HR', name: 'Haryana',            level: 'state',    parent_id: REGION_IDS.india, geom: bbox(74.45,27.65,77.58,30.91),   centroid: centroid(74.45,27.65,77.58,30.91),  population: 29000000, area_km2: 44212 },
  { id: REGION_IDS.up,      code: 'IN-UP', name: 'Uttar Pradesh',      level: 'state',    parent_id: REGION_IDS.india, geom: bbox(77.08,23.87,84.67,30.41),   centroid: centroid(77.08,23.87,84.67,30.41),  population: 235000000, area_km2: 240928 },
  // Districts
  { id: REGION_IDS.delhi_d,   code: 'DL-DL', name: 'Delhi District',          level: 'district', parent_id: REGION_IDS.delhi_s, geom: bbox(76.838,28.404,77.348,28.884), centroid: centroid(76.838,28.404,77.348,28.884), population: 11000000, area_km2: 1484 },
  { id: REGION_IDS.gurugram,  code: 'HR-GGN',name: 'Gurugram',                level: 'district', parent_id: REGION_IDS.haryana, geom: bbox(76.842,28.218,77.183,28.567), centroid: centroid(76.842,28.218,77.183,28.567), population: 1500000, area_km2: 1258 },
  { id: REGION_IDS.faridabad, code: 'HR-FBD',name: 'Faridabad',               level: 'district', parent_id: REGION_IDS.haryana, geom: bbox(77.162,28.258,77.601,28.647), centroid: centroid(77.162,28.258,77.601,28.647), population: 1809000, area_km2: 741 },
  { id: REGION_IDS.sonipat,   code: 'HR-SNP',name: 'Sonipat',                 level: 'district', parent_id: REGION_IDS.haryana, geom: bbox(76.759,28.637,77.282,29.185), centroid: centroid(76.759,28.637,77.282,29.185), population: 1450000, area_km2: 2260 },
  { id: REGION_IDS.jhajjar,   code: 'HR-JHJ',name: 'Jhajjar',                 level: 'district', parent_id: REGION_IDS.haryana, geom: bbox(76.469,28.214,76.951,28.748), centroid: centroid(76.469,28.214,76.951,28.748), population: 958000,  area_km2: 1834 },
  { id: REGION_IDS.rewari,    code: 'HR-REW',name: 'Rewari',                  level: 'district', parent_id: REGION_IDS.haryana, geom: bbox(76.386,27.828,76.967,28.317), centroid: centroid(76.386,27.828,76.967,28.317), population: 900000,  area_km2: 1594 },
  { id: REGION_IDS.palwal,    code: 'HR-PAL',name: 'Palwal',                  level: 'district', parent_id: REGION_IDS.haryana, geom: bbox(77.238,27.873,77.698,28.283), centroid: centroid(77.238,27.873,77.698,28.283), population: 1042000, area_km2: 1359 },
  { id: REGION_IDS.gnb,       code: 'UP-GBN',name: 'Gautam Buddha Nagar',     level: 'district', parent_id: REGION_IDS.up,      geom: bbox(77.353,28.309,77.814,28.627), centroid: centroid(77.353,28.309,77.814,28.627), population: 1648000, area_km2: 1442 },
  { id: REGION_IDS.ghaziabad, code: 'UP-GZB',name: 'Ghaziabad',               level: 'district', parent_id: REGION_IDS.up,      geom: bbox(77.178,28.546,77.693,28.847), centroid: centroid(77.178,28.546,77.693,28.847), population: 4661000, area_km2: 1179 },
  { id: REGION_IDS.meerut,    code: 'UP-MRT',name: 'Meerut',                  level: 'district', parent_id: REGION_IDS.up,      geom: bbox(77.582,28.685,78.099,29.118), centroid: centroid(77.582,28.685,78.099,29.118), population: 3443000, area_km2: 2590 },
  { id: REGION_IDS.baghpat,   code: 'UP-BPT',name: 'Baghpat',                 level: 'district', parent_id: REGION_IDS.up,      geom: bbox(77.143,28.849,77.648,29.253), centroid: centroid(77.143,28.849,77.648,29.253), population: 1303000, area_km2: 1345 },
  { id: REGION_IDS.bulandshahr, code: 'UP-BLS',name: 'Bulandshahr',           level: 'district', parent_id: REGION_IDS.up,      geom: bbox(77.723,28.259,78.274,28.847), centroid: centroid(77.723,28.259,78.274,28.847), population: 3499000, area_km2: 4352 },
];

export async function seed(client: PoolClient): Promise<void> {
  for (const r of regions) {
    await client.query(
      `INSERT INTO regions(id, code, name, level, parent_id, geom, centroid, population, area_km2)
       VALUES($1,$2,$3,$4,$5,
         ST_SimplifyPreserveTopology(ST_GeomFromText($6, 4326), 0.001),
         ST_GeomFromText($7, 4326),
         $8,$9)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, updated_at=NOW()`,
      [r.id, r.code, r.name, r.level, r.parent_id, r.geom, r.centroid, r.population, r.area_km2]
    );
  }
}
