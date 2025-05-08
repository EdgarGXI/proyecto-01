import { ReservationDocument } from '../models/Reservation';

export type CreateReservationDto = Pick<ReservationDocument, 'bookId' | 'userId'>;
export type UpdateReservationDto = Pick<ReservationDocument, 'returnDate'>;