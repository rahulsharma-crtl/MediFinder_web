import mongoose, { Schema, Document } from 'mongoose';

export enum ReservationStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    PickedUp = 'Picked Up',
    Cancelled = 'Cancelled'
}

export interface IReservation extends Document {
    medicineId: mongoose.Types.ObjectId;
    pharmacyId: mongoose.Types.ObjectId;
    customerName: string;
    customerPhone: string;
    status: ReservationStatus;
    reservationTime: Date;
    expiryTime: Date;
}

const ReservationSchema: Schema = new Schema({
    medicineId: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true },
    pharmacyId: { type: Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(ReservationStatus),
        default: ReservationStatus.Pending
    },
    reservationTime: { type: Date, default: Date.now },
    expiryTime: { type: Date, required: true }
}, { timestamps: true });

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
