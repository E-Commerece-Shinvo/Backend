import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    level: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Pre-save hook to ensure max 5 niches (level 0)
categorySchema.pre('save', async function (next) {
    if (this.level === 0 && this.isNew) {
        const count = await mongoose.models.Category.countDocuments({ level: 0 });
        if (count >= 5) {
            const error = new Error('A maximum of 5 top-level categories (Niches) is allowed.');
            return next(error);
        }
    }
    next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
