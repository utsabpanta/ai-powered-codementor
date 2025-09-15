import { Router } from 'express';
import { analyzeCode, explainCode, suggestImprovements, generateReport, getProviderStatus } from '../controllers/analysisController';

const router: Router = Router();

// POST /api/analysis/analyze
router.post('/analyze', analyzeCode);

// POST /api/analysis/explain
router.post('/explain', explainCode);

// POST /api/analysis/improve
router.post('/improve', suggestImprovements);

// POST /api/analysis/report
router.post('/report', generateReport);

// GET /api/analysis/status
router.get('/status', getProviderStatus);

export default router;