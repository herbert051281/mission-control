import { Router } from 'express';
import { createMission, getMissions, getMissionById, updateMissionStatus } from '../handlers/missionHandler';

const router = Router();

router.post('/missions', createMission);
router.get('/missions', getMissions);
router.get('/missions/:id', getMissionById);
router.patch('/missions/:id', updateMissionStatus);

export default router;
