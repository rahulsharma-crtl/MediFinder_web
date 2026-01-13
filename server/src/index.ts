import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import medicineRoutes from './routes/medicines';
import reservationRoutes from './routes/reservations';
import authRoutes from './routes/auth';
import aiRoutes from './routes/ai';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/medicines', medicineRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.send('MediFinder API is running...');
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medifinder';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });

export default app;
