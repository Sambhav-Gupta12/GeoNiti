import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { search, saveSearch, getSavedSearches, deleteSavedSearch } from './controller';

const router = Router();

// Allow public access to search, it handles visibility filters natively
router.get('/', authenticate, search);

// Saved searches require auth, handled inside controller or via middleware
router.get('/saved-searches', authenticate, getSavedSearches);
router.post('/saved-searches', authenticate, saveSearch);
router.delete('/saved-searches/:id', authenticate, deleteSavedSearch);

export default router;
