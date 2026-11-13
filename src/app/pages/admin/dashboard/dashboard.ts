import { Component, computed, inject, isDevMode, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ReservationService } from '../../../core/services/reservation';
import { AuthService } from '../../../core/services/auth';
import { SeaStatus, WeatherService } from '../../../core/services/weather';
import { EXPERIENCES, Reservation, ReservationStatus, SLOTS } from '../../../core/models/reservation';

type Tab = ReservationStatus | 'all';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private service = inject(ReservationService);
  private weather = inject(WeatherService);
  private router = inject(Router);
  auth = inject(AuthService);

  // ---------- Data (live) ----------
  private data = toSignal(
    this.service.watchAll().pipe(
      map(list => ({ list, error: false })),
      catchError(() => of({ list: [] as Reservation[], error: true }))
    )
  );
  loading = computed(() => this.data() === undefined);
  loadError = computed(() => this.data()?.error ?? false);
  all = computed(() => this.data()?.list ?? []);

  // ---------- UI state ----------
  tab = signal<Tab>('pending');
  search = signal('');
  selectedId = signal<string | null>(null);
  note = signal('');
  busy = signal(false);
  feedback = signal<{ type: 'ok' | 'error'; text: string } | null>(null);

  tabs: { id: Tab; label: string }[] = [
    { id: 'pending', label: 'In attesa' },
    { id: 'accepted', label: 'Accettate' },
    { id: 'declined', label: 'Rifiutate' },
    { id: 'all', label: 'Tutte' }
  ];

  counts = computed(() => {
    const c = { pending: 0, accepted: 0, declined: 0, all: this.all().length };
    for (const r of this.all()) c[r.status]++;
    return c;
  });

  list = computed(() => {
    const q = this.search().trim().toLowerCase();
    return this.all().filter(r =>
      (this.tab() === 'all' || r.status === this.tab()) &&
      (!q || `${r.name} ${r.email} ${r.phone} ${r.boatName}`.toLowerCase().includes(q))
    );
  });

  selected = computed<Reservation | null>(() =>
    this.all().find(r => r.id === this.selectedId()) ?? this.list()[0] ?? null
  );

  /** Other non-declined requests overlapping the same boat/day/slot */
  conflicts = computed(() => {
    const s = this.selected();
    if (!s) return [];
    return this.all().filter(r =>
      r.id !== s.id && r.boatId === s.boatId && r.date === s.date && r.status !== 'declined' &&
      (r.slot === 'full' || s.slot === 'full' || r.slot === s.slot)
    );
  });

  /** Same client (by email) in the past */
  history = computed(() => {
    const s = this.selected();
    if (!s) return { total: 0, accepted: 0 };
    const mine = this.all().filter(r => r.id !== s.id && r.email.toLowerCase() === s.email.toLowerCase());
    return { total: mine.length, accepted: mine.filter(r => r.status === 'accepted').length };
  });

  // ---------- Weather for selected day ----------
  private selectedDate = computed(() => this.selected()?.date ?? '');
  forecast = toSignal(
    toObservable(this.selectedDate).pipe(
      switchMap(d => !d ? of(null) : this.weather.dayForecast(d).pipe(
        map(f => ({ loading: false, f })),
        startWith({ loading: true, f: null }),
        catchError(() => of({ loading: false, f: null }))
      ))
    ),
    { initialValue: null }
  );

  weatherInfo: Record<SeaStatus, { label: string; box: string; dot: string }> = {
    good:    { label: 'Mare ideale',         box: 'bg-emerald-50 text-emerald-900', dot: 'bg-emerald-500' },
    caution: { label: 'Mare mosso',          box: 'bg-amber-50 text-amber-900',     dot: 'bg-amber-500' },
    bad:     { label: 'Uscite sconsigliate', box: 'bg-red-50 text-red-900',         dot: 'bg-red-500' }
  };

  statusInfo: Record<ReservationStatus, { label: string; badge: string }> = {
    pending:  { label: 'In attesa', badge: 'bg-amber-100 text-amber-800' },
    accepted: { label: 'Accettata', badge: 'bg-emerald-100 text-emerald-800' },
    declined: { label: 'Rifiutata', badge: 'bg-red-100 text-red-800' }
  };

  // ---------- Helpers ----------
  slotLabel(id: string) { return SLOTS.find(s => s.id === id)?.label ?? id; }
  slotHours(id: string) { return SLOTS.find(s => s.id === id)?.hours ?? ''; }
  expLabel(id: string) { return EXPERIENCES.find(e => e.id === id)?.label ?? id; }

  dateLabel(iso: string, long = false) {
    return new Date(iso + 'T00:00').toLocaleDateString('it-IT',
      long ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
           : { weekday: 'short', day: 'numeric', month: 'short' });
  }

  ago(d: Date) {
    const min = Math.round((Date.now() - d.getTime()) / 60000);
    if (min < 1) return 'ora';
    if (min < 60) return `${min} min fa`;
    const h = Math.round(min / 60);
    if (h < 24) return `${h} h fa`;
    const days = Math.round(h / 24);
    return days === 1 ? 'ieri' : `${days} giorni fa`;
  }

  whatsapp(r: Reservation) {
    let n = r.phone.replace(/[^0-9]/g, '');
    if (n.startsWith('00')) n = n.slice(2);
    else if (n.length === 10 && n.startsWith('3')) n = '39' + n; // Italian mobile without prefix
    const text = `Ciao ${r.name}, ti scriviamo da Green Boat Rent per la tua richiesta: ${r.boatName} – ${this.dateLabel(r.date, true)} (${this.slotLabel(r.slot)}).`;
    return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
  }

  mailto(r: Reservation) {
    const subject = `Green Boat Rent – ${r.boatName} ${this.dateLabel(r.date)}`;
    return `mailto:${r.email}?subject=${encodeURIComponent(subject)}`;
  }

  // ---------- Actions ----------
  select(r: Reservation) {
    this.selectedId.set(r.id);
    this.note.set(r.adminNote ?? '');
    this.feedback.set(null);
    if (window.innerWidth < 1024) {
      setTimeout(() => document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth' }));
    }
  }

  async accept() {
    const r = this.selected();
    if (!r) return;
    this.busy.set(true);
    this.feedback.set(null);
    try {
      await this.service.accept(r, this.note().trim());
      this.feedback.set({ type: 'ok', text: 'Prenotazione accettata. La data è ora bloccata nel calendario.' });
    } catch (e: any) {
      if (isDevMode()) console.error('[accept] error:', e?.code, e?.message, e);
      this.feedback.set({
        type: 'error',
        text: e?.message === 'SLOT_TAKEN'
          ? 'Questo slot è già stato accettato per un\'altra richiesta.'
          : 'Errore durante il salvataggio. Riprova.' + (isDevMode() ? ` [${e?.code ?? e}]` : '')
      });
    } finally {
      this.busy.set(false);
    }
  }

  async decline() {
    const r = this.selected();
    if (!r) return;
    this.busy.set(true);
    this.feedback.set(null);
    try {
      await this.service.decline(r, this.note().trim());
      this.feedback.set({ type: 'ok', text: 'Richiesta rifiutata.' });
    } catch (e: any) {
      if (isDevMode()) console.error('[decline] error:', e?.code, e?.message, e);
      this.feedback.set({ type: 'error', text: 'Errore durante il salvataggio. Riprova.' + (isDevMode() ? ` [${e?.code ?? e}]` : '') });
    } finally {
      this.busy.set(false);
    }
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}