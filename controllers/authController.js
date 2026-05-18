import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        const user = await User.create({ username, email, password });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
            gender: user.gender,
            permanentAddress: user.permanentAddress,
            profileImage: user.profileImage,
            addresses: user.addresses,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({ 
                message: 'Apka account block kr dia gya hai. Meharbani kr k customer support sy rabta krein dobara login krny k lye.',
                isBlocked: true 
            });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
            gender: user.gender,
            permanentAddress: user.permanentAddress,
            profileImage: user.profileImage,
            addresses: user.addresses,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
            gender: user.gender,
            permanentAddress: user.permanentAddress,
            profileImage: user.profileImage,
            addresses: user.addresses,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided in request body
        if (req.body.username !== undefined) user.username = req.body.username;
        if (req.body.email !== undefined) user.email = req.body.email;
        if (req.body.phone !== undefined) user.phone = req.body.phone;
        if (req.body.gender !== undefined) user.gender = req.body.gender;
        if (req.body.permanentAddress !== undefined) user.permanentAddress = req.body.permanentAddress;
        if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;
        if (req.body.addresses !== undefined) user.addresses = req.body.addresses;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            gender: updatedUser.gender,
            permanentAddress: updatedUser.permanentAddress,
            profileImage: updatedUser.profileImage,
            addresses: updatedUser.addresses,
            createdAt: updatedUser.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
