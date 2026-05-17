import express from 'express';
import { register, login, getMe, registerValidation, loginValidation } from '../controllers/authController';
import { protect } from '../middleware/auth';
const router = express.Router();
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
export default router;
