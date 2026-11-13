import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { Boat } from '../../core/models/boat';
import { EXPERIENCES, Experience, SLOTS, Slot } from '../../core/models/reservation';
import { ReservationService } from '../../core/services/reservation';
import { DayForecast, SeaStatus, WeatherService } from '../../core/services/weather';
import { SettingsService } from '../../core/services/settings';

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

interface DayCell { iso: string; day: number; disabled: boolean; selected: boolean; partial: boolean; }
type ForecastState = { loading: boolean; f: DayForecast | null } | null;

@Component({
  selector: 'app-booking-form',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './booking-form.html'
})
export class BookingForm implements OnInit {
  boat = input.required<Boat>();
  initialDate = input('');

  private fb = inject(NonNullableFormBuilder);
  private reservations = inject(ReservationService);
  private weather = inject(WeatherService);
  private settings = inject(SettingsService);

  /** form = booking form + WhatsApp, whatsapp = WhatsApp only */
  mode = computed(() => this.settings.settings().bookingMode);

  slots = SLOTS;
  experiences = EXPERIENCES;
  weekDays = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];
  today = toIso(new Date());

  month = signal(startOfMonth(new Date()));
  date = signal('');
  slot = signal<Slot | null>(null);
  taken = signal<Record<string, Slot[]>>({});
  sending = signal(false);
  sent = signal(false);
  error = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[+0-9 ()-]{7,20}$/)]],
    pax: [2, [Validators.required, Validators.min(1)]],
    experience: ['first' as Experience, Validators.required],
    licenseNumber: [''],
    skipper: [false],
    message: [''],
    gdpr: [false, Validators.requiredTrue]
  });

  // ---------- Calendar ----------
  monthLabel = computed(() => this.month().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }));
  canPrev = computed(() => this.month() > startOfMonth(new Date()));

  days = computed<(DayCell | null)[]>(() => {
    const m = this.month();
    const lead = (m.getDay() + 6) % 7; // Monday first
    const count = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const cells: (DayCell | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= count; d++) {
      const iso = toIso(new Date(m.getFullYear(), m.getMonth(), d));
      const t = this.taken()[iso] ?? [];
      const full = t.includes('full') || (t.includes('morning') && t.includes('afternoon'));
      cells.push({ iso, day: d, disabled: iso < this.today || full, selected: iso === this.date(), partial: !full && t.length > 0 });
    }
    return cells;
  });

  dateLabel = computed(() => this.date()
    ? new Date(this.date() + 'T00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
    : '');

  slotLabel = computed(() => SLOTS.find(s => s.id === this.slot())?.label ?? '');
  needsLicense = computed(() => this.boat().license === 'required');
  paxOptions = computed(() => Array.from({ length: this.boat().pax }, (_, i) => i + 1));

  // ---------- Weather for chosen day ----------
  forecast = toSignal<ForecastState>(
    toObservable(this.date).pipe(
      switchMap(d => !d ? of(null) : this.weather.dayForecast(d).pipe(
        map(f => ({ loading: false, f })),
        startWith({ loading: true, f: null }),
        catchError(() => of({ loading: false, f: null }))
      ))
    ),
    { initialValue: null }
  );

  statusInfo: Record<SeaStatus, { label: string; text: string; box: string; dot: string }> = {
    good:    { label: 'Mare ideale',         text: 'Previsioni ottime per uscire.',                        box: 'bg-emerald-50 text-emerald-900', dot: 'bg-emerald-500' },
    caution: { label: 'Mare mosso',          text: 'Lo staff confermerà in base alle condizioni.',          box: 'bg-amber-50 text-amber-900',     dot: 'bg-amber-500' },
    bad:     { label: 'Uscite sconsigliate', text: 'Previsioni sfavorevoli: potremmo proporti un\'altra data.', box: 'bg-red-50 text-red-900',   dot: 'bg-red-500' }
  };

  ngOnInit() {
    const b = this.boat();
    this.form.controls.pax.addValidators(Validators.max(b.pax));
    this.form.controls.pax.setValue(Math.min(2, b.pax));

    const d = this.initialDate();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d) && d >= this.today) {
      this.date.set(d);
      this.month.set(startOfMonth(new Date(d + 'T00:00')));
    }
    this.reservations.takenSlots(b.id).then(t => this.taken.set(t));
  }

  prevMonth() { if (this.canPrev()) this.month.update(m => new Date(m.getFullYear(), m.getMonth() - 1, 1)); }
  nextMonth() { this.month.update(m => new Date(m.getFullYear(), m.getMonth() + 1, 1)); }

  pickDate(c: DayCell) {
    if (c.disabled) return;
    this.date.set(c.iso);
    const s = this.slot();
    if (s && this.slotTaken(s)) this.slot.set(null);
  }

  slotTaken(s: Slot): boolean {
    const t = this.taken()[this.date()] ?? [];
    return t.includes('full') || t.includes(s) || (s === 'full' && t.length > 0);
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  async submit() {
    this.error.set('');
    if (!this.date() || !this.slot()) { this.error.set('Seleziona la data e la durata.'); return; }
    if (this.form.invalid) { this.form.markAllAsTouched(); this.error.set('Controlla i campi evidenziati.'); return; }

    const v = this.form.getRawValue();
    if (this.needsLicense() && !v.skipper && !v.licenseNumber.trim()) {
      this.error.set('Per questa barca serve la patente nautica, oppure richiedi lo skipper.');
      return;
    }

    let lang = 'it';
    try { lang = localStorage.getItem('lang') ?? 'it'; } catch {}

    this.sending.set(true);
    try {
      await this.reservations.create({
        boatId: this.boat().id,
        boatName: this.boat().name,
        date: this.date(),
        slot: this.slot()!,
        pax: v.pax,
        name: v.name.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        experience: v.experience,
        licenseNumber: v.licenseNumber.trim() || undefined,
        skipper: v.skipper,
        message: v.message.trim() || undefined,
        lang
      });
      this.sent.set(true);
    } catch {
      this.error.set('Invio non riuscito. Riprova tra poco.');
    } finally {
      this.sending.set(false);
    }
  }

  /** WhatsApp link with boat / date / slot / people pre-filled */
  waLink(): string {
    const b = this.boat();
    let text = `Ciao! Vorrei prenotare la ${b.name}`;
    if (this.date()) text += ` per ${this.dateLabel()}`;
    if (this.slot()) text += ` (${this.slotLabel()})`;
    text += `, ${this.form.controls.pax.value} persone. È disponibile?`;
    return this.settings.whatsappUrl(text);
  }

  reset() {
    this.sent.set(false);
    this.slot.set(null);
    this.form.reset({ pax: Math.min(2, this.boat().pax), experience: 'first' });
  }
}