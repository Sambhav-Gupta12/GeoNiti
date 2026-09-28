import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pool } from '../../db';
import { getAllowedVisibilities, getAllowedStatuses } from '../../config/permissions';
import { ApiError } from '../../types';

export async function getRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { level, parent } = req.query;
    const params: any[] = [];
    const where: string[] = [];

    let query = `
      SELECT 
        id, code, name, level, population, 
        ST_AsGeoJSON(centroid)::json as centroid, 
        ARRAY[ST_XMin(geom), ST_YMin(geom), ST_XMax(geom), ST_YMax(geom)] as bbox 
      FROM regions
    `;

    if (level) {
      params.push(level);
      where.push(`level = $${params.length}`);
    }
    if (parent) {
      params.push(parent);
      where.push(`parent_id = $${params.length}`);
    }

    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }

    const result = await pool.query(query, params);
    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getRegionsGeoJSON(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      level: z.string().optional(),
      parent: z.string().uuid().optional(),
      indicator: z.string().optional(),
      year: z.coerce.number().optional()
    });
    
    const { level, parent, indicator, year } = schema.parse(req.query);

    const params: any[] = [];
    const where: string[] = [];

    if (level) {
      params.push(level);
      where.push(`r.level = $${params.length}`);
    }
    if (parent) {
      params.push(parent);
      where.push(`r.parent_id = $${params.length}`);
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';
    
    let joinClause = '';
    if (indicator && year) {
      params.push(indicator, year);
      joinClause = `
        LEFT JOIN indicator_values iv ON r.id = iv.region_id 
          AND iv.year = $${params.length}
        LEFT JOIN indicators ind ON iv.indicator_id = ind.id 
          AND ind.key = $${params.length - 1}
      `;
    } else if (indicator) {
      // Just join latest if year not provided
      params.push(indicator);
      joinClause = `
        LEFT JOIN indicator_values iv ON r.id = iv.region_id 
        LEFT JOIN indicators ind ON iv.indicator_id = ind.id AND ind.key = $${params.length}
        WHERE iv.year = (SELECT MAX(year) FROM indicator_values iv2 WHERE iv2.indicator_id = ind.id AND iv2.region_id = r.id)
      `;
    }

    // Use zoom hint for simplification (0.01 degrees ~ 1km)
    // 5 decimal digits for GeoJSON reduces payload size
    let query = `
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(ST_SimplifyPreserveTopology(r.geom, 0.01), 5)::json,
            'properties', json_build_object(
              'id', r.id,
              'name', r.name
              ${indicator ? ", 'value', iv.value" : ""}
            )
          )
        ), '[]'::json)
      ) as geojson
      FROM regions r
      ${joinClause}
      ${whereClause}
    `;

    const result = await pool.query(query, params);
    
    // Express gzip
    res.setHeader('Content-Encoding', 'gzip');
    // We can use zlib or let Express handle it. Wait, if we use setHeader without actually compressing, the client will fail to decode.
    // So we shouldn't manually set Content-Encoding unless we compress it ourselves.
    // Express `compression` middleware handles this automatically based on Accept-Encoding.
    // I will remove the manual setHeader and rely on the response JSON.
    res.removeHeader('Content-Encoding');

    const geojsonData = result.rows[0].geojson || { type: "FeatureCollection", features: [] };
    
    // ETag is automatically handled by Express for JSON responses
    res.json(geojsonData);
  } catch (err) { next(err); }
}

export async function getRegionSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id;
    const role = req.user?.role ?? 'public';
    const visibilities = getAllowedVisibilities(role);
    const visStr = visibilities.map(v => `'${v}'`).join(',');
    
    // 1. Region basic
    const regRes = await pool.query(`SELECT id, code, name, level, population, area_km2 FROM regions WHERE id = $1`, [id]);
    if (regRes.rowCount === 0) throw new ApiError(404, 'NOT_FOUND', 'Region not found');
    const region = regRes.rows[0];

    // 2. Indicators (latest + sparkline + rank)
    const indRes = await pool.query(`
      WITH RankedValues AS (
        SELECT 
          iv.indicator_id, 
          ind.key, 
          ind.name, 
          ind.unit,
          iv.year, 
          iv.value,
          RANK() OVER(PARTITION BY iv.indicator_id, iv.year ORDER BY iv.value DESC) as rank_among_siblings
        FROM indicator_values iv
        JOIN indicators ind ON iv.indicator_id = ind.id
        JOIN regions r ON iv.region_id = r.id
        WHERE r.parent_id = (SELECT parent_id FROM regions WHERE id = $1)
           OR (r.level = 'country') -- fallback for root
      )
      SELECT 
        key, name, unit,
        (SELECT value FROM RankedValues rv WHERE rv.key = ind.key AND rv.year = (SELECT MAX(year) FROM RankedValues WHERE key=ind.key) LIMIT 1) as latest_value,
        (SELECT year FROM RankedValues rv WHERE rv.key = ind.key AND rv.year = (SELECT MAX(year) FROM RankedValues WHERE key=ind.key) LIMIT 1) as latest_year,
        (SELECT rank_among_siblings FROM RankedValues rv WHERE rv.key = ind.key AND rv.year = (SELECT MAX(year) FROM RankedValues WHERE key=ind.key) LIMIT 1) as rank,
        json_agg(json_build_object('year', year, 'value', value) ORDER BY year ASC) as series
      FROM RankedValues ind
      GROUP BY key, name, unit
    `, [id]);
    
    // 3. Documents
    const docRes = await pool.query(`
      SELECT d.id, d.title, d.year, d.type 
      FROM documents d
      JOIN document_regions dr ON d.id = dr.document_id
      WHERE dr.region_id = $1 AND d.visibility = ANY($2) AND d.status = 'approved'
      LIMIT 10
    `, [id, visibilities]);

    // 4. Neighbours
    const neighRes = await pool.query(`
      SELECT r.id, r.name 
      FROM regions r 
      JOIN regions target ON target.id = $1
      WHERE ST_Touches(r.geom, target.geom) AND r.id != target.id
    `, [id]);

    res.json({
      data: {
        region,
        indicators: indRes.rows,
        documents: docRes.rows,
        neighbours: neighRes.rows,
        data_notes: []
      },
      meta: null, error: null
    });
  } catch (err) { next(err); }
}

export async function getRegionAt(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) throw new ApiError(400, 'BAD_REQUEST', 'lat and lng required');

    const result = await pool.query(`
      SELECT id, code, name, level 
      FROM regions 
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))
      ORDER BY level DESC
    `, [lng, lat]);

    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function getRegionNeighbours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id;
    const result = await pool.query(`
      SELECT r.id, r.name, r.level
      FROM regions r 
      JOIN regions target ON target.id = $1
      WHERE ST_Touches(r.geom, target.geom) AND r.id != target.id
    `, [id]);

    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}

export async function compareRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ids, indicator } = req.query;
    if (!ids || !indicator) throw new ApiError(400, 'BAD_REQUEST', 'ids and indicator required');
    const idList = (ids as string).split(',');

    const result = await pool.query(`
      SELECT r.id, r.name, json_agg(json_build_object('year', iv.year, 'value', iv.value) ORDER BY iv.year ASC) as series
      FROM indicator_values iv
      JOIN regions r ON iv.region_id = r.id
      JOIN indicators ind ON iv.indicator_id = ind.id
      WHERE r.id = ANY($1) AND ind.key = $2
      GROUP BY r.id, r.name
    `, [idList, indicator]);

    res.json({ data: result.rows, meta: null, error: null });
  } catch (err) { next(err); }
}
