import { Injectable, isDevMode, signal } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore/lite';
import { dbLite } from '../firebase';

export type BookingMode = 'form' | 'whatsapp';

export interface SiteSettings {
  /** form = booking form + WhatsApp, whatsapp = WhatsApp only */
  bookingMode: BookingMode;
  /** International format, digits only, e.g. 393791869281 */
  whatsapp: string;
}

const DEFAULTS: SiteSettings = { bookingMode: 'form', whatsapp: '393791869281' };

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private ref = doc(dbLite, 'settings', 'site');

  settings = signal<SiteSettings>(DEFAULTS);
  loaded = signal(false);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    try {
      const snap = await getDoc(this.ref);
      this.settings.set({ ...DEFAULTS, ...(snap.data() ?? {}) });
    } catch (err) {
      if (isDevMode()) console.error('[settings] load error:', err);
    } finally {
      this.loaded.set(true);
    }
  }

  async save(patch: Partial<SiteSettings>): Promise<void> {
    await setDoc(this.ref, patch, { merge: true });
    await this.refresh();
  }

  whatsappUrl(text = ''): string {
    const n = this.settings().whatsapp.replace(/\D/g, '');
    return `https://wa.me/${n}${text ? '?text=' + encodeURIComponent(text) : ''}`;
  }
}
