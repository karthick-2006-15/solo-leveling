import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { 
  getSkills, 
  addCustomSkill, 
  editSkillNotes, 
  addResource, 
  deleteResource, 
  addMilestone, 
  completeMilestone, 
  logStudySession 
} from '../controllers/skillController';

const router = Router();
router.use(requireAuth);

router.get('/', getSkills);
router.post('/', addCustomSkill);
router.patch('/:id', editSkillNotes);

router.post('/:id/resources', addResource);
router.delete('/:id/resources/:resourceId', deleteResource);

router.post('/:id/milestones', addMilestone);
router.patch('/:id/milestones/:milestoneId/complete', completeMilestone);

router.post('/study-session', logStudySession);

export default router;
