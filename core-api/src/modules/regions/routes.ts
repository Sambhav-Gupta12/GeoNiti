import { Router } from 'express';
import { getRegions, getRegionsGeoJSON, getRegionSummary, getRegionAt, getRegionNeighbours, compareRegions } from './controller';

const router = Router();

router.get('/', getRegions);
router.get('/geojson', getRegionsGeoJSON);
router.get('/at', getRegionAt);
router.get('/compare', compareRegions);
router.get('/:id/summary', getRegionSummary);
router.get('/:id/neighbours', getRegionNeighbours);

export default router;
