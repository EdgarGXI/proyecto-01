import { Router } from 'express';
import { createUser, loginUser, updateUser, disableUser } from '../controllers/userController';
import { verifyToken, canModifyUser, canDisableUser } from '../middleware/auth';

const router = Router();

// Rutas públicas
router.post('/register', createUser);
router.post('/login', loginUser);

// Rutas protegidas
router.put('/:userId', verifyToken, canModifyUser, updateUser);
router.delete('/:userId', verifyToken, canDisableUser, disableUser);

export default router;