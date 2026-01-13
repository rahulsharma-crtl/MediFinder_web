import express, { Request, Response } from 'express';
import Reservation, { ReservationStatus } from '../models/Reservation';
import Medicine from '../models/Medicine';
import { auth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create a new reservation
router.post('/', async (req: Request, res: Response) => {
    try {
        const { medicineId, pharmacyId, customerName, customerPhone } = req.body;

        // Check if medicine is available
        const medicine = await Medicine.findById(medicineId);
        if (!medicine || medicine.quantity <= 0) {
            return res.status(400).json({ message: 'Medicine not available in requested pharmacy' });
        }

        // Set expiry to 2 hours from now
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 2);

        const reservation = new Reservation({
            medicineId,
            pharmacyId,
            customerName,
            customerPhone,
            expiryTime
        });

        await reservation.save();

        // Decrement stock (in a real app, this would be more robust)
        medicine.quantity -= 1;
        if (medicine.quantity === 0) {
            medicine.stock = (medicine.constructor as any).StockStatus.OutOfStock;
        }
        await medicine.save();

        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating reservation', error });
    }
});

// Get reservations for a pharmacy (requires auth)
router.get('/pharmacy', auth, async (req: AuthRequest, res: Response) => {
    try {
        const reservations = await Reservation.find({ pharmacyId: req.user.pharmacyId })
            .populate('medicineId')
            .sort({ createdAt: -1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reservations', error });
    }
});

router.patch('/:id/status', auth, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ message: 'Error updating reservation status', error });
    }
});

export default router;
