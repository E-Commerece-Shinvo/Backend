import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        // Helper function to build a tree structure from flat list
        const buildTree = (cats, parentId = null) => {
            const tree = [];
            for (const cat of cats) {
                const isMatch = parentId === null 
                    ? !cat.parentCategory 
                    : String(cat.parentCategory) === String(parentId);

                if (isMatch) {
                    const children = buildTree(cats, cat._id);
                    tree.push({
                        ...cat.toObject(),
                        children
                    });
                }
            }
            return tree;
        };

        const categoryTree = buildTree(categories);
        res.json(categoryTree);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Fetch children (sub-categories) for this category
        const children = await Category.find({ parentCategory: category._id });

        res.json({
            ...category.toObject(),
            children
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a category (admin)
// @route   POST /api/categories
export const createCategory = async (req, res) => {
    try {
        const { name, image, parentCategory } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

        // Determine level based on parent
        let level = 0;
        if (parentCategory) {
            const parent = await Category.findById(parentCategory);
            if (parent) {
                level = parent.level + 1;
            }
        }

        const category = await Category.create({ 
            name, 
            image, 
            parentCategory: parentCategory || null, 
            level 
        });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a category (admin)
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a category (admin)
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
