# MediFinder Plus - Smart Medicine Locator

MediFinder has been transformed into a full-stack, AI-powered platform designed for high performance and premium user experience.

## ✨ Premium Features

- **Glassmorphism UI**: A state-of-the-art design language using semi-transparent layers and blurring.
- **AI-Powered Search**: Smart medicine recommendations based on symptoms using Gemini 1.5 Flash.
- **Prescription OCR**: Upload a prescription image, and our AI will automatically identify the medications.
- **Live Reservations**: Users can reserve medicines at nearby pharmacies with a 2-hour pickup window.
- **Owner Dashboard**: Secure panel for pharmacy owners to manage incoming reservations in real-time.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Axios.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Database**: MongoDB.
- **AI**: Google Gemini 3 Flash (Generative AI).

## 🚀 Getting Started

### Backend Setup
1. `cd server`
2. `npm install`
3. Create a `.env` file based on `.env.template` and add your `MONGODB_URI` and `GEMINI_API_KEY`.
4. `npm run dev` (for development) or `npm run build && npm start` (for production).

### Frontend Setup
1. `npm install`
2. `npm run dev`
3. Access the app at `http://localhost:3000`.

## 📦 Directory Structure

- `/server`: Express backend with models, routes, and AI services.
- `/src`: Frontend React components and design system.
- `/components`: Premium UI components with animations.
- `/services`: API client and local mock services for fallback.
