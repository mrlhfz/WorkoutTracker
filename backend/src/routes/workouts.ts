import express from 'express';
import workoutController from '../controllers/workoutController';

const router = express.Router();

router.get('/stats', workoutController.getStats);
router.get('/', workoutController.getAll);
router.get('/:id', workoutController.getById);
router.post('/', workoutController.create);
router.put('/:id', workoutController.update);
router.delete('/:id', workoutController.delete);

export default router;
