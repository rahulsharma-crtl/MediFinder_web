import mongoose, { Schema, Document } from 'mongoose';

export interface IPharmacy extends Document {
  name: string;
  address: string;
  location: {
    lat: number;
    lon: number;
  };
  contact: string;
  operatingHours: string;
  isOpen24x7: boolean;
  rating: number;
}

const PharmacySchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  contact: { type: String, required: true },
  operatingHours: { type: String, required: true },
  isOpen24x7: { type: Boolean, default: false },
  rating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IPharmacy>('Pharmacy', PharmacySchema);
