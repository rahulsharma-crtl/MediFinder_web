import mongoose, { Schema, Document } from 'mongoose';

export enum StockStatus {
    Available = 'Available',
    OutOfStock = 'Out of Stock',
    LimitedStock = 'Limited Stock'
}

export interface IMedicine extends Document {
    name: string;
    description: string;
    category: string;
    pharmacyId: mongoose.Types.ObjectId;
    price: number;
    stock: StockStatus;
    quantity: number;
    expiryDate: Date;
}

const MedicineSchema: Schema = new Schema({
    name: { type: String, required: true, index: true },
    description: { type: String },
    category: { type: String },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    price: { type: Number, required: true },
    stock: {
        type: String,
        enum: Object.values(StockStatus),
        default: StockStatus.Available
    },
    quantity: { type: Number, required: true, default: 0 },
    expiryDate: { type: Date }
}, { timestamps: true });

// Compound index for searching medicine in a specific pharmacy
MedicineSchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IMedicine>('Medicine', MedicineSchema);
