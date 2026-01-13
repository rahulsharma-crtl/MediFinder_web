import express, { Request, Response } from 'express';
import { getMedicineRecommendations, analyzePrescription } from '../services/aiService';

const router = express.Router();

router.post('/recommend', async (req: Request, res: Response) => {
    try {
        const { disease } = req.body;
        if (!disease) return res.status(400).json({ message: 'Disease is required' });

        const recommendations = await getMedicineRecommendations(disease);
        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ message: 'AI Recommendation failed', error });
    }
});

router.post('/analyze-prescription', async (req: Request, res: Response) => {
    try {
        const { image } = req.body; // Base64 image
        if (!image) return res.status(400).json({ message: 'Image is required' });

        const medicines = await analyzePrescription(image);
        res.json({ medicines });
    } catch (error) {
        res.status(500).json({ message: 'Prescription analysis failed', error });
    }
});

export default router;
