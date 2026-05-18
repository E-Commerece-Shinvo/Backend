import User from '../models/User.js';

// @desc    Get all users (Admin only)
// @route   GET /api/users
export const getAllUsers = async (req, res) => {
    try {
        console.log("getAllUsers called by:", req.user.email);
        const users = await User.find({}).sort({ createdAt: -1 });
        console.log("Users found in DB:", users.length);
        res.json(users);
    } catch (error) {
        console.error("Error in getAllUsers:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Block/Unblock a user (Admin only)
// @route   PUT /api/users/:id/block
export const toggleUserBlock = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot block an admin user' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ 
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
            isBlocked: user.isBlocked 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/users/:id
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only update fields if they are provided in the request body
        if (req.body.username) user.username = req.body.username;
        if (req.body.email) user.email = req.body.email;
        if (req.body.phone) user.phone = req.body.phone;
        if (req.body.role) user.role = req.body.role;
        if (req.body.addresses) user.addresses = req.body.addresses;

        const updatedUser = await user.save();
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
