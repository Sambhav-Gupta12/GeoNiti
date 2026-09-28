import { PoolClient } from 'pg';
import { REGION_IDS } from './03_regions';

export const IND_IDS = {
  built_up:     '44444444-0000-0000-0000-000000000001',
  cropland:     '44444444-0000-0000-0000-000000000002',
  pop_density:  '44444444-0000-0000-0000-000000000003',
  road_density: '44444444-0000-0000-0000-000000000004',
  gw_depth:     '44444444-0000-0000-0000-000000000005',
  disputes:     '44444444-0000-0000-0000-000000000006',
  land_price:   '44444444-0000-0000-0000-000000000007',
  climate_vul:  '44444444-0000-0000-0000-000000000008',
};

export const DS_IND_ID = '55555555-0000-0000-0000-000000000001';

// Seeded random number generator (deterministic)
function seededRand(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// District baseline characteristics [built_up_base, cropland_base, pop_dens_base, road_dens, gw_base, disputes_base, price_base, cv_base]
const DISTRICT_BASELINES: Record<string, number[]> = {
  [REGION_IDS.delhi_d]:     [65, 5, 11000, 12.5, 8,  42, 180, 0.72],
  [REGION_IDS.gurugram]:    [42, 22, 2200, 8.2,  14, 28, 145, 0.65],
  [REGION_IDS.faridabad]:   [38, 28, 2800, 7.8,  12, 31, 110, 0.61],
  [REGION_IDS.gnb]:         [30, 38, 1800, 6.4,  10, 22, 120, 0.58],
  [REGION_IDS.ghaziabad]:   [35, 32, 3500, 7.1,  9,  34, 115, 0.60],
  [REGION_IDS.sonipat]:     [18, 55, 620,  4.5,  18, 18, 62,  0.52],
  [REGION_IDS.baghpat]:     [12, 68, 480,  3.8,  22, 15, 48,  0.49],
  [REGION_IDS.meerut]:      [22, 50, 850,  5.2,  16, 26, 75,  0.55],
  [REGION_IDS.bulandshahr]: [10, 72, 400,  3.2,  20, 12, 40,  0.47],
  [REGION_IDS.jhajjar]:     [8,  70, 380,  3.0,  24, 11, 36,  0.46],
  [REGION_IDS.rewari]:      [9,  68, 360,  2.8,  26, 10, 33,  0.44],
  [REGION_IDS.palwal]:      [11, 65, 420,  3.4,  19, 14, 42,  0.48],
};

export async function seed(client: PoolClient): Promise<void> {
  // Upsert dataset for indicators
  await client.query(
    `INSERT INTO datasets(id, title, description, visibility, status, is_illustrative, provenance_note,
      time_start, time_end, update_frequency)
     VALUES($1,$2,$3,'public','approved',true,
       'Illustrative district-level land-use indicators for Delhi-NCR, 2005-2024. Generated for demo purposes.',
       '2005-01-01','2024-12-31','annual')
     ON CONFLICT(id) DO UPDATE SET updated_at=NOW()`,
    [DS_IND_ID, 'Delhi-NCR Land Indicator Time Series', 'Annual land-use and governance indicators for 12 Delhi-NCR districts, 2005-2024.']
  );

  // Indicators
  const indicators = [
    { id: IND_IDS.built_up,     key: 'built_up_pct',           name: 'Built-up Area %',                unit: '%',        category: 'land_use',        higher_is_better: false },
    { id: IND_IDS.cropland,     key: 'cropland_pct',            name: 'Cropland Area %',                unit: '%',        category: 'land_use',        higher_is_better: true },
    { id: IND_IDS.pop_density,  key: 'population_density',      name: 'Population Density',             unit: 'per km²',  category: 'demographic',     higher_is_better: null },
    { id: IND_IDS.road_density, key: 'road_density_km_per_km2', name: 'Road Density',                   unit: 'km/km²',   category: 'infrastructure',  higher_is_better: true },
    { id: IND_IDS.gw_depth,     key: 'groundwater_depth_m',     name: 'Groundwater Depth',              unit: 'm',        category: 'environment',     higher_is_better: false },
    { id: IND_IDS.disputes,     key: 'land_disputes_per_100k',  name: 'Land Disputes per 1,00,000',     unit: 'per 1L',   category: 'governance',      higher_is_better: false },
    { id: IND_IDS.land_price,   key: 'land_price_index',        name: 'Land Price Index',               unit: 'index',    category: 'economic',        higher_is_better: null },
    { id: IND_IDS.climate_vul,  key: 'climate_vulnerability_index', name: 'Climate Vulnerability Index', unit: '0-1',     category: 'climate',         higher_is_better: false },
  ];

  for (const ind of indicators) {
    await client.query(
      `INSERT INTO indicators(id, key, name, unit, category, higher_is_better, source_dataset_id)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name, updated_at=NOW()`,
      [ind.id, ind.key, ind.name, ind.unit, ind.category, ind.higher_is_better, DS_IND_ID]
    );
  }

  // Generate indicator values 2005-2024 for each district
  const indicatorIds = [
    IND_IDS.built_up, IND_IDS.cropland, IND_IDS.pop_density, IND_IDS.road_density,
    IND_IDS.gw_depth, IND_IDS.disputes, IND_IDS.land_price, IND_IDS.climate_vul,
  ];

  const districtIds = Object.keys(DISTRICT_BASELINES);
  const years = Array.from({ length: 20 }, (_, i) => 2005 + i);

  for (const regionId of districtIds) {
    const baselines = DISTRICT_BASELINES[regionId];
    const rand = seededRand(regionId.charCodeAt(9) * 31);

    for (const year of years) {
      const t = (year - 2005) / 19; // 0..1
      // Annual trends per indicator:
      // [0] built_up: +0.8-2.5%/yr (faster near Delhi), noise
      // [1] cropland: falls as built_up rises
      // [2] pop_density: grows 1.5-3%/yr
      // [3] road_density: grows 1%/yr
      // [4] gw_depth: deepens 0.3-0.8m/yr
      // [5] disputes: slight decline later
      // [6] land_price: grows ~6-12%/yr
      // [7] climate_vul: slowly worsens
      const builtUp   = Math.min(95, baselines[0] + t * (baselines[0] > 30 ? 28 : 18) + (rand() - 0.5) * 2);
      const cropland  = Math.max(2,  baselines[1] - t * (baselines[1] > 50 ? 22 : 12) + (rand() - 0.5) * 2);
      const popDens   = baselines[2] * Math.pow(1.022, year - 2005) * (1 + (rand() - 0.5) * 0.02);
      const roadDens  = baselines[3] + t * 1.2 + (rand() - 0.5) * 0.15;
      const gwDepth   = baselines[4] + t * (baselines[4] > 20 ? 6 : 10) + (rand() - 0.5) * 0.5;
      const disputes  = Math.max(5, baselines[5] - t * 8 + (rand() - 0.5) * 4);
      const landPrice = baselines[6] * Math.pow(1.085, year - 2005) * (1 + (rand() - 0.5) * 0.04);
      const climateVul = Math.min(0.99, baselines[7] + t * 0.08 + (rand() - 0.5) * 0.01);

      // Deliberate anomalies: spike in disputes for specific district in 2013 and 2018
      let disputesAdj = disputes;
      if (regionId === REGION_IDS.gurugram && year === 2013) disputesAdj = disputes * 2.8;
      if (regionId === REGION_IDS.gnb && year === 2018) disputesAdj = disputes * 3.1;
      // Anomaly: groundwater sudden drop in Baghpat 2011
      let gwAdj = gwDepth;
      if (regionId === REGION_IDS.baghpat && year === 2011) gwAdj = gwDepth + 4.5;

      const values = [builtUp, cropland, popDens, roadDens, gwAdj, disputesAdj, landPrice, climateVul];

      for (let i = 0; i < indicatorIds.length; i++) {
        await client.query(
          `INSERT INTO indicator_values(region_id, indicator_id, year, value)
           VALUES($1,$2,$3,ROUND($4::numeric,3))
           ON CONFLICT(region_id, indicator_id, year) DO UPDATE SET value=EXCLUDED.value`,
          [regionId, indicatorIds[i], year, values[i]]
        );
      }
    }
  }
}
