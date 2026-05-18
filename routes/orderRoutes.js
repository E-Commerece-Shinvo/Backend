import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    getAdminStats,
    getRecentActivity,
    getOrdersByUserId
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// User routes (all protected)
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/admin/stats', protect, admin, getAdminStats);
router.get('/admin/recent', protect, admin, getRecentActivity);
router.get('/', protect, admin, getAllOrders);
router.get('/user/:userId', protect, admin, getOrdersByUserId);
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
