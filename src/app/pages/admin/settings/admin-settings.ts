import { Component, effect, inject, isDevMode, signal, untracked } from '@angular/core';
import { BookingMode, SettingsService } from '../../../core/services/settings';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.html'
})
export class AdminSettings {
  private service = inject(SettingsService);
  loaded = this.service.loaded;

  mode = signal<BookingMode>('form');
  whatsapp = signal('');
  saving = signal(false);
  feedback = signal<{ type: 'ok' | 'error'; text: string } | null>(null);

  modes: { id: BookingMode; title: string; text: string }[] = [
    { id: 'form',     title: 'Modulo + WhatsApp', text: 'Il cliente invia una richiesta dal sito (la accetti qui in Richieste). Il pulsante WhatsApp resta disponibile.' },
    { id: 'whatsapp', title: 'Solo WhatsApp',     text: 'Nessun modulo: il cliente sceglie barca, data e persone e ti scrive su WhatsApp con il messaggio già pronto.' }
  ];

  constructor() {
    // Load current values into the form
    effect(() => {
      const s = this.service.settings();
      untracked(() => { this.mode.set(s.bookingMode); this.whatsapp.set(s.whatsapp); });
    });
  }

  testLink() {
    return `https://wa.me/${this.whatsapp().replace(/\D/g, '')}?text=${encodeURIComponent('Test dal pannello Green Boat Rent')}`;
  }

  async save() {
    this.feedback.set(null);
    const n = this.whatsapp().replace(/\D/g, '');
    if (n.length < 8 || n.length > 15) {
      this.feedback.set({ type: 'error', text: 'Numero WhatsApp non valido. Usa il formato internazionale, es. 393791869281.' });
      return;
    }
    this.saving.set(true);
    try {
      await this.service.save({ bookingMode: this.mode(), whatsapp: n });
      this.feedback.set({ type: 'ok', text: 'Impostazioni salvate. Il sito è già aggiornato.' });
    } catch (e) {
      if (isDevMode()) console.error('[settings] error:', e);
      this.feedback.set({ type: 'error', text: 'Salvataggio non riuscito. Riprova.' + (isDevMode() ? ` [${(e as any)?.code ?? e}]` : '') });
    } finally {
      this.saving.set(false);
    }
  }
}
