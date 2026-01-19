import express, { Request, Response } from 'express';
import Medicine from '../models/Medicine';
import Pharmacy from '../models/Pharmacy';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Search medicines across pharmacies
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { q, lat, lon, radius = 10 } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Basic text search on medicine name
        const medicines = await Medicine.find({
            name: { $regex: q as string, $options: 'i' }
        }).populate('pharmacyId');

        // In a real app, we would use MongoDB geospatial queries with 'lat' and 'lon'
        // For now, returning all matches with their linked pharmacy data
        res.json(medicines.map(m => ({
            ...m.toObject(),
            pharmacyId: m.pharmacyId // Ensure pharmacy data is included
        })));
    } catch (error) {
        res.status(500).json({ message: 'Error searching medicines', error });
    }
});

// Get all medicines for a specific pharmacy
router.get('/pharmacy/:pharmacyId', async (req: Request, res: Response) => {
    try {
        const medicines = await Medicine.find({ pharmacyId: req.params.pharmacyId });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pharmacy medicines', error });
    }
});

// Get specific medicine details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const medicine = await Medicine.findById(req.params.id).populate('pharmacyId');
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching medicine details', error });
    }
});

// Add new medicine (Protected)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, category, price, stock, quantity, expiryDate } = req.body;
        const pharmacyId = req.user.pharmacyId;

        const medicine = new Medicine({
            name,
            description,
            category,
            pharmacyId,
            price,
            stock,
            quantity,
            expiryDate
        });

        await medicine.save();
        res.status(201).json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Error adding medicine', error });
    }
});

// Update medicine (Protected)
router.patch('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const medicine = await Medicine.findOneAndUpdate(
            { _id: req.params.id, pharmacyId: req.user.pharmacyId },
            req.body,
            { new: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found or unauthorized' });
        }

        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Error updating medicine', error });
    }
});

// Delete medicine (Protected)
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
    try {
        const medicine = await Medicine.findOneAndDelete({
            _id: req.params.id,
            pharmacyId: req.user.pharmacyId
        });

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found or unauthorized' });
        }

        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting medicine', error });
    }
});

export default router;
