import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db, dbLite } from '../firebase';
import * as lite from 'firebase/firestore/lite';
import { Reservation, ReservationRequest, Slot } from '../models/reservation';

const pad = (n: number) => String(n).padStart(2, '0');
const todayIso = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private reservations = collection(db, 'reservations');

  // ================= PUBLIC =================

  /** Client sends a request → status "pending" */
  async create(req: ReservationRequest): Promise<string> {
    const data = Object.fromEntries(Object.entries(req).filter(([, v]) => v !== undefined));
    const ref = await lite.addDoc(lite.collection(dbLite, 'reservations'), {
      ...data,
      status: 'pending',
      createdAt: lite.serverTimestamp()
    });
    return ref.id;
  }

  /** Accepted slots per date for a boat (used to disable calendar days) */
  async takenSlots(boatId: string): Promise<Record<string, Slot[]>> {
    const snap = await lite.getDocs(lite.query(lite.collection(dbLite, 'availability'), lite.where('boatId', '==', boatId)));
    const today = todayIso();
    const result: Record<string, Slot[]> = {};
    snap.forEach(d => {
      const data = d.data() as { date: string; slots: Slot[] };
      if (data.date >= today) result[data.date] = data.slots ?? [];
    });
    return result;
  }

  // ================= ADMIN =================

  /** Live list of all requests, newest first */
  watchAll(): Observable<Reservation[]> {
    return new Observable(sub => {
      const q = query(this.reservations, orderBy('createdAt', 'desc'));
      return onSnapshot(q,
        snap => sub.next(snap.docs.map(d => {
          const data = d.data() as any;
          return { ...data, id: d.id, createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date() } as Reservation;
        })),
        err => sub.error(err)
      );
    });
  }

  /** Accept: blocks the slot (fails if already taken) – Lite SDK (plain HTTPS) */
  async accept(r: Reservation, adminNote = ''): Promise<void> {
    const availRef = lite.doc(dbLite, 'availability', `${r.boatId}_${r.date}`);
    const resRef = lite.doc(dbLite, 'reservations', r.id);

    const avail = await lite.getDoc(availRef);
    const slots: Slot[] = avail.exists() ? (avail.data()['slots'] ?? []) : [];
    const conflict = slots.includes('full') || slots.includes(r.slot) || (r.slot === 'full' && slots.length > 0);
    if (conflict) throw new Error('SLOT_TAKEN');

    const batch = lite.writeBatch(dbLite);
    batch.set(availRef, { boatId: r.boatId, date: r.date, slots: lite.arrayUnion(r.slot) }, { merge: true });
    batch.update(resRef, { status: 'accepted', adminNote, decidedAt: lite.serverTimestamp() });
    await batch.commit();
  }

  /** Decline – Lite SDK */
  async decline(r: Reservation, adminNote = ''): Promise<void> {
    await lite.updateDoc(lite.doc(dbLite, 'reservations', r.id), {
      status: 'declined', adminNote, decidedAt: lite.serverTimestamp()
    });
  }
}
