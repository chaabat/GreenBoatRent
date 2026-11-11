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
  skipper: boolean;
  message?: string;
  lang: string;
}

export interface Reservation extends ReservationRequest {
  id: string;
  status: ReservationStatus;
  createdAt: Date;
  adminNote?: string;
}

export const SLOTS: { id: Slot; label: string; hours: string }[] = [
  { id: 'morning',   label: 'Mattina',         hours: '9:00 – 13:00' },
  { id: 'afternoon', label: 'Pomeriggio',      hours: '14:00 – 18:30' },
  { id: 'full',      label: 'Giornata intera', hours: '9:00 – 18:30' }
];

export const EXPERIENCES: { id: Experience; label: string }[] = [
  { id: 'first',    label: 'Prima volta' },
  { id: 'some',     label: 'Qualche esperienza' },
  { id: 'licensed', label: 'Ho la patente nautica' }
];