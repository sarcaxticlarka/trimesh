import { Router } from 'express';
import { getDashboard, saveModel, unsaveModel, updateProfile, getStats } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/dashboard', protect, getDashboard);
router.get('/stats', protect, getStats);
router.patch('/profile', protect, updateProfile);
router.post('/save/:modelId', protect, saveModel);
router.delete('/save/:modelId', protect, unsaveModel);

export default router;
