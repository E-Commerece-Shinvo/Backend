import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports.  git 
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        message: '🚀 Shinvo E-Commerce API is running',
    });
});

// ─── Static Files & SPA Routing ─────────────────────────
const distPath = path.join(__dirname, '../Frontend/dist');
app.use(express.static(distPath));

// ─── SPA Routing ────────────────────────────────────────
// Catch-all: Serve index.html for all other routes so React Router can handle them.
// We use app.use() to avoid Express 5's path-to-regexp wildcard issues.
app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// ─── 404 Handler ────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ─── Database Connection & Server Start ─────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ ✅ ✅ MongoDB Connected Successfully');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
