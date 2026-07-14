import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';
import UserStoryChapter from '../models/StoryChapter';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const chapters = await UserStoryChapter.find({ userId }).sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (error) {
    console.error('Error fetching story chapters:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
