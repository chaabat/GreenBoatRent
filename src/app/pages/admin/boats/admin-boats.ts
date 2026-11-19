import { Component, inject, isDevMode, signal } from '@angular/core';
import {
  AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators
} from '@angular/forms';
import { BoatService } from '../../../core/services/boat';
import { Boat, BoatCategory, LICENSES, LicenseType, SPOTS } from '../../../core/models/boat';

// ---------- Formats ----------
const IMAGE_URL = /^(https:\/\/\S+|images\/\S+)$/i;
const MEASURE = /^\d{1,2}([.,]\d{1,2})?\s*m?$/i;          // 5.35 m | 5,35 | 10
const ENGINE = /\d+\s*(cv|hp|kw)\b/i;                     // must contain power: "40 CV", "2×300 CV"
const TANK = /^\d{1,4}\s*l?$/i;                           // 45 L | 160

const slugify = (s: string) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const num = (v: string) => parseFloat(v.replace(',', '.'));

/** Width must be smaller than length */
const sizeCheck: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const l = g.get('length')!.value as string, w = g.get('width')!.value as string;
  if (!MEASURE.test(l) || !MEASURE.test(w)) return null;
  return num(w) >= num(l) ? { widthTooBig: true } : null;
};

/** Cut-out must be transparent → PNG/WebP (Cloudinary links accepted) */
const transparentImage: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = (c.value as string).trim().toLowerCase();
  if (!v || !IMAGE_URL.test(v) || v.includes('res.cloudinary.com')) return null;
  return /\.(png|webp)(\?.*)?$/.test(v) ? null : { notTransparent: true };
};

type Feedback = { type: 'ok' | 'error'; text: string } | null;
type ImgState = 'idle' | 'ok' | 'error';

const LABELS: Record<string, string> = {
  name: 'Nome', category: 'Tipo', license: 'Patente', pax: 'Persone', length: 'Lunghezza',
  width: 'Larghezza', engine: 'Motore', tank: 'Serbatoio', cabins: 'Cabine',
  spotIndex: 'Luogo', cover: 'Foto di sfondo', cutout: 'Barca scontornata'
};

@Component({
  selector: 'app-admin-boats',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-boats.html'
})
export class AdminBoats {
  private service = inject(BoatService);
  private fb = inject(NonNullableFormBuilder);

  licenses = LICENSES;
  spots = SPOTS;
  boats = this.service.all;
  loaded = this.service.loaded;

  formOpen = signal(false);
  editing = signal<Boat | null>(null);
  saving = signal(false);
  seeding = signal(false);
  confirmDelete = signal<string | null>(null);
  feedback = signal<Feedback>(null);
  missing = signal<string[]>([]);

  coverState = signal<ImgState>('idle');
  cutoutState = signal<ImgState>('idle');

  /** Name must be unique (case-insensitive) */
  private uniqueName: ValidatorFn = (c: AbstractControl) => {
    const v = (c.value as string).trim().toLowerCase();
    const id = this.editing()?.id;
    return v && this.boats().some(b => b.id !== id && b.name.trim().toLowerCase() === v) ? { duplicate: true } : null;
  };

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), this.uniqueName]],
    category: ['gommone' as BoatCategory, Validators.required],
    license: ['none' as LicenseType, Validators.required],
    length: ['', [Validators.required, Validators.pattern(MEASURE)]],
    width: ['', [Validators.required, Validators.pattern(MEASURE)]],
    pax: [6, [Validators.required, Validators.min(1), Validators.max(12), Validators.pattern(/^\d+$/)]],
    engine: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40), Validators.pattern(ENGINE)]],
    tank: ['', [Validators.pattern(TANK)]],
    cabins: ['', [Validators.maxLength(40)]],
    shower: [true],
    spotIndex: [0, Validators.required],
    active: [true],
    cover: ['', [Validators.required, Validators.pattern(IMAGE_URL)]],
    cutout: ['', [Validators.required, Validators.pattern(IMAGE_URL), transparentImage]]
  }, { validators: sizeCheck });

  // ---------- Messages ----------
  errorFor(name: string): string | null {
    const c = this.form.get(name);
    if (!c || !c.touched) return null;
    const e = c.errors;

    if (name === 'width' && this.form.hasError('widthTooBig') && !e) return 'La larghezza deve essere minore della lunghezza.';
    if (name === 'cover' && !e && this.coverState() === 'error') return 'Immagine non raggiungibile: controlla il link.';
    if (name === 'cutout' && !e && this.cutoutState() === 'error') return 'Immagine non raggiungibile: controlla il link.';
    if (!e) return null;

    if (e['required']) return 'Campo obbligatorio.';
    if (e['duplicate']) return 'Esiste già una barca con questo nome.';
    if (e['minlength']) return `Minimo ${e['minlength'].requiredLength} caratteri.`;
    if (e['maxlength']) return `Massimo ${e['maxlength'].requiredLength} caratteri.`;
    if (e['min'] || e['max']) return 'Da 1 a 12 persone.';
    if (e['notTransparent']) return 'Serve un PNG (o WebP) con sfondo trasparente.';
    if (e['pattern']) {
      switch (name) {
        case 'length': case 'width': return 'Formato: 5.35 m';
        case 'engine': return 'Indica marca e potenza, es. "Yamaha 40 CV".';
        case 'tank': return 'Formato: 45 L';
        case 'pax': return 'Numero intero.';
        case 'cover': case 'cutout': return 'Link non valido: deve iniziare con https://';
      }
    }
    return 'Valore non valido.';
  }

  /** Non-blocking hints */
  warnings(): string[] {
    const v = this.form.getRawValue();
    const w: string[] = [];
    const hp = Math.max(0, ...(v.engine.match(/\d+(?=\s*(cv|hp)\b)/gi) ?? []).map(Number));
    if (v.license === 'none' && hp > 40) w.push('Senza patente: in Italia il motore non può superare 40 CV. Controlla la potenza o la patente.');
    if (v.category === 'yacht' && v.license === 'none') w.push('Uno yacht "senza patente" è insolito: controlla il campo Patente.');
    if (v.category === 'yacht' && !v.cabins.trim()) w.push('Per uno yacht conviene indicare le cabine.');
    return w;
  }

  // ---------- Normalize on blur ----------
  normalizeMeasure(name: 'length' | 'width') {
    const c = this.form.controls[name];
    if (MEASURE.test(c.value)) c.setValue(`${num(c.value).toFixed(2)} m`);
  }

  normalizeTank() {
    const c = this.form.controls.tank;
    if (c.value && TANK.test(c.value)) c.setValue(`${parseInt(c.value, 10)} L`);
  }

  // ---------- Form ----------
  openNew() {
    this.editing.set(null);
    this.form.reset({ category: 'gommone', license: 'none', pax: 6, shower: true, spotIndex: 0, active: true });
    this.resetState();
    this.formOpen.set(true);
    this.scrollTop();
  }

  openEdit(b: Boat) {
    this.editing.set(b);
    this.form.reset({
      name: b.name, category: b.category, license: (b.license as string) === 'skipper' ? 'crew' : b.license,
      length: b.length, width: b.width, pax: b.pax, engine: b.engine,
      tank: b.tank ?? '', cabins: b.cabins ?? '', shower: b.shower,
      spotIndex: Math.max(0, SPOTS.findIndex(s => s.name === b.spot?.name)),
      active: b.active, cover: b.cover, cutout: b.cutout
    });
    this.resetState();
    this.formOpen.set(true);
    this.scrollTop();
  }

  close() { this.formOpen.set(false); this.resetState(); }

  async save() {
    this.feedback.set(null);
    this.form.markAllAsTouched();
    this.form.controls.name.updateValueAndValidity(); // re-check duplicate

    const missing = Object.keys(LABELS).filter(k => this.form.get(k)?.invalid);
    if (this.form.hasError('widthTooBig')) missing.push('Larghezza');
    if (this.coverState() === 'error') missing.push('Foto di sfondo');
    if (this.cutoutState() === 'error') missing.push('Barca scontornata');
    const labels = [...new Set(missing.map(k => LABELS[k] ?? k))];

    if (labels.length) {
      this.missing.set(labels);
      this.feedback.set({ type: 'error', text: 'Completa o correggi i campi evidenziati.' });
      setTimeout(() => (document.querySelector('form .ng-invalid[formControlName]') as HTMLElement | null)?.focus());
      return;
    }
    this.missing.set([]);

    const v = this.form.getRawValue();
    const ed = this.editing();

    let id = ed?.id ?? '';
    if (!ed) {
      const base = slugify(v.name) || 'barca';
      id = base;
      for (let i = 2; this.boats().some(b => b.id === id); i++) id = `${base}-${i}`;
    }

    this.saving.set(true);
    try {
      await this.service.save({
        id,
        name: v.name.trim(),
        category: v.category,
        license: v.license,
        licenseLabel: LICENSES.find(l => l.id === v.license)!.label,
        length: v.length.trim(),
        width: v.width.trim(),
        pax: Number(v.pax),
        engine: v.engine.trim(),
        tank: v.tank.trim() || undefined,
        cabins: v.cabins.trim() || undefined,
        shower: v.shower,
        cover: BoatService.optimize(v.cover),
        cutout: BoatService.optimize(v.cutout),
        spot: SPOTS[v.spotIndex] ?? SPOTS[0],
        active: v.active,
        order: ed?.order ?? Math.max(0, ...this.boats().map(b => b.order ?? 0)) + 1
      });

      this.feedback.set({ type: 'ok', text: ed ? 'Barca aggiornata.' : 'Barca aggiunta.' });
      this.close();
    } catch (e) {
      if (isDevMode()) console.error('[boat save] error:', e);
      this.feedback.set({ type: 'error', text: 'Salvataggio non riuscito. Riprova.' + (isDevMode() ? ` [${(e as any)?.code ?? e}]` : '') });
    } finally {
      this.saving.set(false);
    }
  }

  // ---------- List actions ----------
  async toggleActive(b: Boat) {
    await this.run(() => this.service.save({ ...b, active: !b.active }),
      b.active ? `${b.name} nascosta dal sito.` : `${b.name} visibile sul sito.`);
  }

  async move(b: Boat, dir: -1 | 1) {
    const list = this.boats();
    const i = list.findIndex(x => x.id === b.id);
    const other = list[i + dir];
    if (!other) return;
    await this.run(async () => {
      await this.service.save({ ...b, order: other.order });
      await this.service.save({ ...other, order: b.order });
    });
  }

  async remove(b: Boat) {
    if (this.confirmDelete() !== b.id) { this.confirmDelete.set(b.id); return; }
    this.confirmDelete.set(null);
    await this.run(() => this.service.remove(b.id), `${b.name} eliminata.`);
  }

  async seed() {
    this.seeding.set(true);
    await this.run(() => this.service.seed(), 'Barche iniziali importate.');
    this.seeding.set(false);
  }

  private async run(fn: () => Promise<unknown>, okText?: string) {
    this.feedback.set(null);
    try {
      await fn();
      if (okText) this.feedback.set({ type: 'ok', text: okText });
    } catch (e) {
      if (isDevMode()) console.error('[boats] error:', e);
      this.feedback.set({ type: 'error', text: 'Operazione non riuscita. Riprova.' + (isDevMode() ? ` [${(e as any)?.code ?? e}]` : '') });
    }
  }

  private resetState() {
    this.feedback.set(null);
    this.missing.set([]);
    this.coverState.set('idle');
    this.cutoutState.set('idle');
  }

  private scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
