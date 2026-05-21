import express from 'express';
import {
    createTicket,
    getAllTickets,
    updateTicketStatus,
    getMyTickets,
    updateTicket,
    deleteTicket
} from '../controllers/supportController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// User Routes (Authenticated)
router.post('/', protect, createTicket);
router.get('/', protect, getMyTickets);
router.put('/:id', protect, updateTicket);
router.delete('/:id', protect, deleteTicket);

// Admin Routes
router.get('/admin', protect, admin, getAllTickets);
router.put('/admin/:id/status', protect, admin, updateTicketStatus);

export default router;
