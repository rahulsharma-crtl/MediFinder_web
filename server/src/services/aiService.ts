import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const getMedicineRecommendations = async (disease: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const prompt = `Recommend 3-5 common over-the-counter medicines for ${disease}. Return only the names separated by commas.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Recommendation Error:', error);
        throw error;
    }
};

export const analyzePrescription = async (imageData: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
        const prompt = "Analyze this prescription and list the medicine names found. Return only a comma-separated list of medicine names.";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageData,
                    mimeType: "image/jpeg"
                }
            }
        ]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini OCR Error:', error);
        throw error;
    }
};
