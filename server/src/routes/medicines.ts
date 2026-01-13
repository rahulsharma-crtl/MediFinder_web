import express, { Request, Response } from 'express';
import Medicine from '../models/Medicine';
import Pharmacy from '../models/Pharmacy';

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
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error searching medicines', error });
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

export default router;
