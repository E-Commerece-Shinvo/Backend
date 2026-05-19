import SupportTicket from '../models/SupportTicket.js';

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
export const createTicket = async (req, res) => {
    try {
        const { category, email, subject, message } = req.body;

        if (!email || !subject || !message) {
            return res.status(400).json({ message: 'Email, subject, and message are required' });
        }

        const ticket = await SupportTicket.create({
            user: req.user._id,
            email,
            category,
            subject,
            message
        });

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all support tickets
// @route   GET /api/support/admin
// @access  Private/Admin
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({})
            .populate('user', 'username email')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a support ticket status
// @route   PUT /api/support/admin/:id/status
// @access  Private/Admin
export const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.status = status;
        await ticket.save();

        const populatedTicket = await SupportTicket.findById(ticket._id)
            .populate('user', 'username email');

        res.json(populatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
