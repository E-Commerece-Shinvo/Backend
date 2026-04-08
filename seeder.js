import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Review from './models/Review.js';

dotenv.config();

const IMAGE_POOL = [
    'https://images.unsplash.com/photo-1609179242023-5e9bc7ca199a?q=80&w=600',
    'https://images.unsplash.com/photo-1619932024765-b1a77eff925c?q=80&w=600',
    'https://images.unsplash.com/photo-1619130771141-89779dfb106d?q=80&w=600',
    'https://images.unsplash.com/photo-1603539947678-cd3954ed515d?q=80&w=600',
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=600',
    'https://images.unsplash.com/photo-1546868889-1883a755d5bb?q=80&w=600',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600',
    'https://images.unsplash.com/photo-1544117519-31a4b719223d?q=80&w=600',
    'https://images.unsplash.com/photo-1586105449897-22d212fc1117?q=80&w=600',
    'https://images.unsplash.com/photo-1603313011101-3144fe63777c?q=80&w=600',
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbea?q=80&w=600',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=600',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600',
    'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=600',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600',
    'https://images.unsplash.com/photo-1504274066654-fa991435009c?q=80&w=600',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600',
    'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=600',
    'https://images.unsplash.com/photo-1556656793-062ff9878233?q=80&w=600',
    'https://images.unsplash.com/photo-1524333865917-7440361284a1?q=80&w=600',
    'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?q=80&w=600',
    'https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=600',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600',
    'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=600',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=600',
    'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?q=80&w=600'
];

const BRANDS = ['Anker', 'Baseus', 'Apple', 'Samsung', 'Xiaomi', 'Google', 'Soundcore', 'Ugreen', 'Haylou', 'Vivo'];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for Seeding');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Review.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // --- Seed Users ---
        await User.create([
            { username: 'user', email: 'user@shinvo.com', password: 'password', role: 'user' },
            { username: 'admin', email: 'admin@shinvo.com', password: 'admin123', role: 'admin' }
        ]);
        console.log('👤 Users seeded');

        // --- Seed Hierarchical Categories ---
        const niches = [
            'Charger & Adapter',
            'Protection',
            'Audio & Wearables',
            'Accessories',
            'Shop By Brands'
        ];

        // 1. Create Level 0 (Niches)
        const nichesDocs = await Promise.all(niches.map(name => Category.create({ name, level: 0 })));
        console.log('📂 Level 0: Niches Created');

        // 2. Create Level 1 categories (3 per niche)
        const categoriesMapping = {
            'Charger & Adapter': ['Wall Chargers', 'Power Banks', 'Data Cables'],
            'Protection': ['Mobile Covers', 'Screen Protectors', 'Lens Protectors'],
            'Audio & Wearables': ['True Wireless Earbuds', 'Smart Watches', 'Bluetooth Speakers'],
            'Accessories': ['Mobile Holders', 'Car Mounts', 'Selfie Sticks'],
            'Shop By Brands': ['Premium Picks', 'Budget Options', 'New Arrivals']
        };

        const l1Docs = [];
        for (const niche of nichesDocs) {
            const names = categoriesMapping[niche.name] || [];
            for (const name of names) {
                const doc = await Category.create({ 
                    name, 
                    level: 1, 
                    parentCategory: niche._id,
                    image: IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)]
                });
                l1Docs.push(doc);
            }
        }
        console.log('📂 Level 1: Categories Created');

        // 3. Create Level 2 sub-categories (3 per Level 1 category)
        const subSubNames = ['SAMSUNG Edition', 'VIVO Edition', 'XIAOMI Edition', 'Premium Edition', 'Ultimate Series', 'Performance Pro', 'Slim Series', 'Rugged Armor', 'Crystal Clear'];
        
        const l2Docs = [];
        for (const cat of l1Docs) {
            for (let i = 0; i < 3; i++) {
                const name = `${cat.name} ${subSubNames[i] || 'Global Series'}`;
                const doc = await Category.create({
                    name,
                    level: 2,
                    parentCategory: cat._id,
                    image: IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)]
                });
                l2Docs.push(doc);
            }
        }
        console.log(`📂 Level 2: ${l2Docs.length} Sub-Categories Created`);

        // --- Seed Products (10 per Level 2 Category) ---
        const productBundles = [];
        for (const l2 of l2Docs) {
            for (let i = 1; i <= 10; i++) {
                const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
                const price = Math.floor(Math.random() * 20000) + 1200;
                productBundles.push({
                    title: `${brand} ${l2.name} - Version ${i}`,
                    brand,
                    description: `Experience professional performance with our newest ${l2.name}. This ${brand} product features cutting-edge technology, premium build quality, and extreme durability. Perfect for daily use and professional environments.`,
                    price,
                    image: IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)],
                    images: [
                        IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)],
                        IMAGE_POOL[Math.floor(Math.random() * IMAGE_POOL.length)]
                    ],
                    category: l2._id,
                    stock: Math.floor(Math.random() * 100) + 10,
                    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                    numReviews: Math.floor(Math.random() * 200),
                    isBestseller: Math.random() > 0.8,
                    isNewArrival: Math.random() > 0.7,
                    colors: ['Black', 'White', 'Silver', 'Carbon'],
                    features: ['Ultra Durable', 'Fast Response', 'Ergonomic Design', '2-Year Warranty'],
                    specifications: {
                        Brand: brand,
                        Series: 'Professional',
                        Material: 'Hardened Polymer & Metal',
                        Compatibility: 'Universal Support',
                        Connectivity: 'Bluetooth 5.3 / USB-C'
                    }
                });
            }
        }

        const seededProducts = await Product.create(productBundles);
        console.log(`📦 ${seededProducts.length} Products seeded successfully!`);

        console.log('\n✅ Massive Seed Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding Error:', error.message);
        process.exit(1);
    }
};

seedDatabase();
