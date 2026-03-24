import { Router } from 'express';
import {
  createApproval,
  getApprovals,
  approveApproval,
  denyApproval,
} from '../handlers/approvalHandler';

const router = Router();

// POST /api/approvals - Create a new approval request
router.post('/approvals', createApproval);

// GET /api/approvals - List approvals (filter by status)
router.get('/approvals', getApprovals);

// POST /api/approvals/:id/approve - Approve a request
router.post('/approvals/:id/approve', approveApproval);

// POST /api/approvals/:id/deny - Deny a request
router.post('/approvals/:id/deny', denyApproval);

export default router;
