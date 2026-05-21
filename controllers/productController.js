import Product from '../models/Product.js';

// @desc    Get all products (with search, filter, pagination)
// @route   GET /api/products
export const getProducts = async (req, res) => {
    try {
        const { search, category, brand, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query;

        let query = {};

        // Search by title/brand/description (flexible regex for partial matches)
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: searchRegex },
                { brand: searchRegex },
                { description: searchRegex }
            ];
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by brand
        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }

        // Filter by price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sort options
        let sortQuery = { createdAt: -1 }; // Default: newest first
        if (sort === 'price_asc') sortQuery = { price: 1 };
        else if (sort === 'price_desc') sortQuery = { price: -1 };
        else if (sort === 'rating') sortQuery = { rating: -1 };
        else if (sort === 'name') sortQuery = { title: 1 };

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit));

        res.json({
            products,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bestseller products
// @route   GET /api/products/bestsellers
export const getBestsellers = async (req, res) => {
    try {
        const products = await Product.find({ isBestseller: true })
            .populate('category', 'name')
            .limit(10);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
export const getNewArrivals = async (req, res) => {
    try {
        const products = await Product.find({ isNewArrival: true })
            .populate('category', 'name')
            .limit(10);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product (admin)
// @route   POST /api/products
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product (admin)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a product (admin)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
