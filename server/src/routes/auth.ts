import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Pharmacy from '../models/Pharmacy';

const router = express.Router();

// Pharmacy Owner Registration
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, address, location, contact, operatingHours } = req.body;

        const pharmacy = new Pharmacy({
            name,
            address,
            location,
            contact,
            operatingHours,
            ownerId: contact, // Use contact as ownerId for backward compatibility if needed
        });

        await pharmacy.save();

        const token = jwt.sign(
            { pharmacyId: pharmacy._id, ownerId: contact },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({ pharmacy, token });
    } catch (error) {
        res.status(500).json({ message: 'Error registering pharmacy', error });
    }
});

// Pharmacy Owner Login by Phone
router.post('/login-by-phone', async (req: Request, res: Response) => {
    try {
        const { contact } = req.body;

        const pharmacy = await Pharmacy.findOne({ contact });
        if (!pharmacy) {
            return res.status(404).json({ message: 'Pharmacy not found' });
        }

        const token = jwt.sign(
            { pharmacyId: pharmacy._id, ownerId: pharmacy.ownerId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ pharmacy, token });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error });
    }
});

// Keep legacy login for compatibility during transition if needed
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { ownerId } = req.body;

        const pharmacy = await Pharmacy.findOne({ ownerId });
        if (!pharmacy) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { pharmacyId: pharmacy._id, ownerId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ pharmacy, token });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error });
    }
});

export default router;
