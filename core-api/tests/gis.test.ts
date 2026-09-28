import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index';
import { pool } from '../src/db';

// We need app exported from index.ts, wait, index.ts starts the server immediately.
// We can test by making real requests to the docker instance or we can just fetch via HTTP.
// Let's use fetch instead of supertest if we don't have the express app exported.

const BASE_URL = 'http://localhost:3000/api/v1';

describe('GIS API', () => {
  it('GET /regions returns regions with bbox', async () => {
    const res = await fetch(`${BASE_URL}/regions`);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    if (json.data.length > 0) {
      expect(json.data[0]).toHaveProperty('bbox');
      expect(json.data[0]).toHaveProperty('centroid');
    }
  });

  it('GET /regions/geojson returns valid GeoJSON FeatureCollection', async () => {
    const res = await fetch(`${BASE_URL}/regions/geojson?level=district`);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.type).toBe('FeatureCollection');
    expect(Array.isArray(json.features)).toBe(true);
    if (json.features.length > 0) {
      const feat = json.features[0];
      expect(feat.type).toBe('Feature');
      expect(feat.geometry).toBeDefined();
      expect(feat.properties).toBeDefined();
      expect(feat.properties.id).toBeDefined();
      expect(feat.properties.name).toBeDefined();
    }
  });

  it('GET /layers lists layers', async () => {
    const res = await fetch(`${BASE_URL}/layers`);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
  });
});
