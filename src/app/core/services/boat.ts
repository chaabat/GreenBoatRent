import { Injectable, computed, isDevMode, signal } from '@angular/core';
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, writeBatch } from 'firebase/firestore/lite';
import { dbLite } from '../firebase';
import { Boat } from '../models/boat';
import { SEED_BOATS } from '../data/boats';

/** Firestore rejects `undefined` values → strip them */
const clean = <T extends object>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

@Injectable({ providedIn: 'root' })
export class BoatService {
  private col = collection(dbLite, 'boats');
  private state = signal<{ loaded: boolean; list: Boat[] }>({ loaded: false, list: [] });

  /** All boats (admin) */
  all = computed(() => this.state().list);
  /** Visible boats (public site) */
  boats = computed(() => this.state().list.filter(b => b.active));
  loaded = computed(() => this.state().loaded);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const snap = await getDocs(query(this.col, orderBy('order')));
      this.state.set({
        loaded: true,
        list: snap.docs.map(d => ({ ...(d.data() as Omit<Boat, 'id'>), id: d.id }))
      });
    } catch (err) {
      if (isDevMode()) console.error('[boats] load error:', err);
      this.state.set({ loaded: true, list: [] });
    }
  }

  /** Create or update */
  async save(boat: Boat): Promise<void> {
    const { id, ...data } = boat;
    await setDoc(doc(this.col, id), clean(data));
    await this.refresh();
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id));
    await this.refresh();
  }

  /** Cloudinary links → auto format (WebP/AVIF, keeps transparency) + quality + max width */
  static optimize(url: string): string {
    const u = url.trim();
    if (!u.includes('res.cloudinary.com') || !u.includes('/image/upload/')) return u;
    if (/\/image\/upload\/[^/]*(f_auto|q_auto)/.test(u)) return u;
    return u.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_1200/');
  }

  /** One-time import of the initial boats */
  async seed(): Promise<void> {
    const batch = writeBatch(dbLite);
    for (const b of SEED_BOATS) {
      const { id, ...data } = b;
      batch.set(doc(this.col, id), clean(data));
    }
    await batch.commit();
    await this.refresh();
  }
}
