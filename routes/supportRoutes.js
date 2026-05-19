import express from 'express';
import {
    createTicket,
    getAllTickets,
    updateTicketStatus
} from '../controllers/supportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// User Route (Authenticated)
router.post('/', protect, createTicket);

// Admin Routes
router.get('/admin', protect, admin, getAllTickets);
router.put('/admin/:id/status', protect, admin, updateTicketStatus);

export default router;
