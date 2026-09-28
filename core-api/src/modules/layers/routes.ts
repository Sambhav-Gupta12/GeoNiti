import { Router } from 'express';
import { getLayers, getLayerData } from './controller';

const router = Router();

router.get('/', getLayers);
router.get('/:key/data', getLayerData);

export default router;
