import { Router } from 'express';
import { register, login, googleAuth, logout, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateRequest';
import { registerSchema, loginSchema } from '../validations/authValidation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);
router.get('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
