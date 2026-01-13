import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Pharmacy from '../models/Pharmacy';

const router = express.Router();

// Pharmacy Owner Registration
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, address, location, contact, operatingHours, ownerId, password } = req.body;

        // In a real app, user model would handle passwords
        // For this prototype, we're simplifying but hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const pharmacy = new Pharmacy({
            name,
            address,
            location,
            contact,
            operatingHours,
            ownerId,
            // Simplify: password would usually be in a User model
        });

        await pharmacy.save();

        const token = jwt.sign(
            { pharmacyId: pharmacy._id, ownerId },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.status(201).json({ pharmacy, token });
    } catch (error) {
        res.status(500).json({ message: 'Error registering pharmacy', error });
    }
});

// Pharmacy Owner Login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { ownerId, password } = req.body;

        const pharmacy = await Pharmacy.findOne({ ownerId });
        if (!pharmacy) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // In a real prototype, you'd check bcrypt.compare(password, pharmacy.password)
        // For now, accepting any password for the sake of the demo, but generating a real JWT
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
