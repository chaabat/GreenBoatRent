import { Component, inject, isDevMode, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoatService } from '../../../core/services/boat';

const IMAGE_URL = /^(https:\/\/\S+|images\/\S+)$/;
import { Boat, BoatCategory, LICENSES, LicenseType, SPOTS } from '../../../core/models/boat';

const slugify = (s: string) => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Feedback = { type: 'ok' | 'error'; text: string } | null;

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

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    category: ['gommone' as BoatCategory],
    license: ['none' as LicenseType],
    length: [''],
    width: [''],
    pax: [6, [Validators.required, Validators.min(1), Validators.max(12)]],
    engine: [''],
    tank: [''],
    cabins: [''],
    shower: [true],
    spotIndex: [0],
    active: [true],
    cover: ['', [Validators.required, Validators.pattern(IMAGE_URL)]],
    cutout: ['', [Validators.required, Validators.pattern(IMAGE_URL)]]
  });

  // ---------- Form ----------
  openNew() {
    this.editing.set(null);
    this.form.reset({ category: 'gommone', license: 'none', pax: 6, shower: true, spotIndex: 0, active: true, cover: '', cutout: '' });
    this.feedback.set(null);
    this.formOpen.set(true);
    this.scrollTop();
  }

  openEdit(b: Boat) {
    this.editing.set(b);
    this.form.reset({
      name: b.name, category: b.category, license: b.license,
      length: b.length, width: b.width, pax: b.pax, engine: b.engine,
      tank: b.tank ?? '', cabins: b.cabins ?? '', shower: b.shower,
      spotIndex: Math.max(0, SPOTS.findIndex(s => s.name === b.spot?.name)),
      active: b.active,
      cover: b.cover,
      cutout: b.cutout
    });
    this.feedback.set(null);
    this.formOpen.set(true);
    this.scrollTop();
  }

  close() { this.formOpen.set(false); }

  invalid(name: string) {
    const c = this.form.get(name);
    return !!c && c.invalid && c.touched;
  }

  async save() {
    this.feedback.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const ed = this.editing();

    // New boat → unique id from the name
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
        pax: v.pax,
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

  private scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
}
