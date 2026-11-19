export type Slot = 'morning' | 'afternoon' | 'full';
export type ReservationStatus = 'pending' | 'accepted' | 'declined';
export type Experience = 'first' | 'some' | 'licensed';

export interface ReservationRequest {
  boatId: string;
  boatName: string;
  date: string;          // YYYY-MM-DD
  slot: Slot;
  pax: number;
  name: string;
  email: string;
  phone: string;
  experience: Experience;
  licenseNumber?: string;
  message?: string;
  lang: string;
}

export interface Reservation extends ReservationRequest {
  id: string;
  status: ReservationStatus;
  createdAt: Date;
  adminNote?: string;
}

/** Rental is only full day 9:00 – 18:00 (type kept for older data) */
export const SLOTS: { id: Slot; label: string; hours: string }[] = [
  { id: 'full', label: 'Giornata intera', hours: '9:00 – 18:00' }
];

export const EXPERIENCES: { id: Experience; label: string }[] = [
  { id: 'first',    label: 'Prima volta' },
  { id: 'some',     label: 'Qualche esperienza' },
  { id: 'licensed', label: 'Ho la patente nautica' }
];