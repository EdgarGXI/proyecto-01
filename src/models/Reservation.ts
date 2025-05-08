import { Schema, model, Document, Types } from 'mongoose';

export interface ReservationDocument extends Document {
  bookId: string;
  userId: string;
  reservationDate: Date;
  returnDate: Date | null;
}

const reservationSchema = new Schema<ReservationDocument>({
  bookId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  reservationDate: {
    type: Date,
    default: Date.now,
  },
  returnDate: {
    type: Date,
    default: null,
  },
});

export const Reservation = model<ReservationDocument>('Reservation', reservationSchema);