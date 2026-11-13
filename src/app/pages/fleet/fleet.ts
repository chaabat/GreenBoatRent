import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BoatCard } from '../../shared/boat-card/boat-card';
import { BoatService } from '../../core/services/boat';
import { Boat } from '../../core/models/boat';

type Filter = 'all' | 'gommone' | 'yacht' | 'none';

@Component({
  selector: 'app-fleet',
  imports: [BoatCard],
  templateUrl: './fleet.html'
})
export class Fleet {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private query = toSignal(this.route.queryParamMap);
  private boatService = inject(BoatService);
  loaded = this.boatService.loaded;

  filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Tutte' },
    { id: 'gommone', label: 'Gommoni' },
    { id: 'yacht', label: 'Yacht' },
    { id: 'none', label: 'Senza patente' }
  ];

  filter = signal<Filter>('all');

  /** Only show filters that have boats */
  visibleFilters = computed(() => {
    const all = this.boatService.boats();
    return this.filters.filter(f =>
      f.id === 'all' || all.some(b => f.id === 'none' ? b.license === 'none' : b.category === f.id)
    );
  });

  /** From the Home search bar: ?date=2027-06-13&pax=4 */
  date = computed(() => this.query()?.get('date') ?? '');
  pax = computed(() => Number(this.query()?.get('pax') ?? 0));

  boats = computed<Boat[]>(() => {
    const f = this.filter();
    const pax = this.pax();
    return this.boatService.boats().filter(b =>
      (f === 'all' || (f === 'none' ? b.license === 'none' : b.category === f)) &&
      (!pax || b.pax >= pax)
    );
  });

  dateLabel = computed(() => {
    const d = this.date();
    return d ? new Date(d).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
  });

  clearSearch() {
    this.router.navigate([], { queryParams: {} });
  }
}