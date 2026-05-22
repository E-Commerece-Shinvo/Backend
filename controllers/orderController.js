import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @desc    Create a new order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Check stock availability first
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product ${item.name} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
            }
        }

        const order = await Order.create({
            user: req.user._id,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            history: [{
                status: 'pending',
                message: 'Order was successfully placed by the customer.'
            }]
        });

        // Decrement stock for each item
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'username email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow the order owner or admin to view
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow the order owner to cancel
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be cancelled' });
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        order.status = 'cancelled';
        order.history.push({
            status: 'cancelled',
            message: 'Order has been cancelled by the customer.'
        });

        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order shipping address (user)
// @route   PUT /api/orders/:id/address
export const updateOrderAddress = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow the order owner to update
        if (order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Address can only be changed before the order is processed' });
        }

        const { shippingAddress } = req.body;
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone || !shippingAddress.postalCode) {
            return res.status(400).json({ message: 'Please provide all required address fields' });
        }

        order.shippingAddress = shippingAddress;
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'username email')
            .populate({
                path: 'items.product',
                populate: {
                    path: 'category',
                    model: 'Category'
                }
            })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const oldStatus = order.status;

        // If status changed to cancelled, restore stock
        if (status === 'cancelled' && oldStatus !== 'cancelled') {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        // If status changed FROM cancelled to something else, decrement stock again
        if (oldStatus === 'cancelled' && status !== 'cancelled') {
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (!product || product.stock < item.quantity) {
                    return res.status(400).json({ message: `Insufficient stock to re-open order for ${item.name}` });
                }
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        const statusMessages = {
            'pending': 'Order is pending.',
            'processing': 'Admin has started processing the order.',
            'shipped': 'Order has been shipped and is on its way.',
            'delivered': 'Order has been successfully delivered.',
            'cancelled': 'Order has been cancelled.'
        };

        order.status = status;
        order.history.push({
            status: status,
            message: statusMessages[status] || `Status updated to ${status}`
        });

        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats (admin)
// @route   GET /api/orders/admin/stats
export const getAdminStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [orders, products] = await Promise.all([
            Order.find(),
            Product.find()
        ]);

        const totalRevenue = orders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.totalAmount : acc, 0);
        const todayOrders = orders.filter(o => o.createdAt >= today);
        const todaySales = todayOrders.reduce((acc, o) => o.status !== 'cancelled' ? acc + o.totalAmount : acc, 0);
        const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        const lowStockItems = products.filter(p => p.stock <= 10).length;

        // Sales data for the last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);

            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const nextDay = new Date(d);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayOrders = orders.filter(o => o.createdAt >= d && o.createdAt < nextDay && o.status !== 'cancelled');
            const daySales = dayOrders.reduce((acc, o) => acc + o.totalAmount, 0);

            last7Days.push({ day: dayName, sales: daySales });
        }

        res.json({
            totalRevenue,
            todaySales,
            totalOrders: orders.length,
            pendingOrders,
            lowStockItems,
            salesChart: last7Days
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent activity (admin)
// @route   GET /api/orders/admin/recent
export const getRecentActivity = async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .populate('user', 'username email')
            .sort({ createdAt: -1 })
            .limit(10);

        const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
            .limit(5);

        res.json({
            recentOrders,
            lowStockProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get orders by User ID (admin)
// @route   GET /api/orders/user/:userId
export const getOrdersByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
