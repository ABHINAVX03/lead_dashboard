import express from 'express';
import { getLeads, createLead, updateLead, deleteLead, exportLeadsCSV, createLeadValidation, updateLeadValidation } from '../controllers/leadController';
import { protect } from '../middleware/auth';
const router = express.Router();
router.use(protect);
router.route('/').get(getLeads).post(createLeadValidation, createLead);
router.route('/export').get(exportLeadsCSV);
router.route('/:id').put(updateLeadValidation, updateLead).delete(deleteLead);
export default router;
