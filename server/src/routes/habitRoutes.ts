import { Router } from 'express';
import { getHabits, createHabit, updateHabit, deleteHabit, completeHabit, getHabitHistory } from '../controllers/habitController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.use(requireAuth);

router.get('/', getHabits);
router.post('/', createHabit);
router.patch('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/complete', completeHabit);
router.get('/:id/history', getHabitHistory);

export default router;
