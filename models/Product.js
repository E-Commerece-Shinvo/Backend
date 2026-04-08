import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true
    },
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    originalPrice: {
        type: Number,
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    images: [{
        type: String // URL strings
    }],
    image: {
        type: String,
        default: ''
    },
    colors: [{
        type: String
    }],
    powerOptions: [{
        type: String
    }],
    features: [{
        type: String
    }],
    specifications: {
        type: Map,
        of: String,
        default: {}
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isNewArrival: {
        type: Boolean,
        default: false
    },
    isBestseller: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Text index for search
productSchema.index({ title: 'text', brand: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
