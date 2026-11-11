import { Injectable } from '@angular/core';
import { ReservationRequest, Slot } from '../models/reservation';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  /** TEMP – replaced by Firestore in step 12 */
  async create(req: ReservationRequest): Promise<string> {
    await new Promise(r => setTimeout(r, 900));
    console.log('[Reservation request]', req);
    return crypto.randomUUID();
  }

  /** Accepted slots per date for a boat – TEMP demo data, Firestore in step 12 */
  async takenSlots(boatId: string): Promise<Record<string, Slot[]>> {
    return {};
  }
}