import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { 
    getAllUsers, 
    getUserById, 
    toggleUserBlock,
    updateUser
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, updateUser);
router.put('/:id/block', protect, admin, toggleUserBlock);

export default router;
