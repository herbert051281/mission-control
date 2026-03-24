import { Router } from 'express';
import { getActivities } from '../handlers/activityHandler';

const router = Router();

router.get('/activities', getActivities);

export default router;
