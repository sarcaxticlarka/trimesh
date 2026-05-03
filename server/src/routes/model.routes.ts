import { Router } from 'express';
import { getModels, getModel, createModel, deleteModel } from '../controllers/model.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getModels);
router.get('/:id', getModel);
router.post('/', protect, createModel);
router.delete('/:id', protect, deleteModel);

export default router;
