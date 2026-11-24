import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Boat } from '../../core/models/boat';

type Deco = 'island' | 'buoy' | 'lighthouse';
type SeaItem = { kind: 'boat'; boat: Boat } | { kind: 'deco'; deco: Deco };

/** Home teaser: boats sailing across the sea, leading to /flotta */
@Component({
  selector: 'app-fleet-showcase',
  imports: [RouterLink],
  templateUrl: './fleet-showcase.html',
  styleUrl: './fleet-showcase.css'
})
export class FleetShowcase {
  boats = input.required<Boat[]>();

  /** Category shortcuts (only those with boats) → /flotta?tipo=... */
  categories = computed(() => {
    const list = this.boats();
    return [
      { id: 'gommone', label: 'Gommoni', count: list.filter(b => b.category === 'gommone').length },
      { id: 'yacht', label: 'Yacht', count: list.filter(b => b.category === 'yacht').length },
      { id: 'none', label: 'Senza patente', count: list.filter(b => b.license === 'none').length }
    ].filter(c => c.count > 0);
  });

  maxPax = computed(() => Math.max(0, ...this.boats().map(b => b.pax)));

  /** Sea items: boats with islands, buoys and lighthouses between them.
   *  Repeated so the sea is always full, then doubled for a seamless loop. */
  fleetLoop = computed<SeaItem[]>(() => {
    const list = this.boats();
    if (!list.length) return [];
    const decos: Deco[] = ['island', 'buoy', 'lighthouse', 'buoy'];
    const half: SeaItem[] = [];
    let i = 0;
    while (half.filter(x => x.kind === 'boat').length < 8) {
      for (const b of list) {
        half.push({ kind: 'boat', boat: b });
        half.push({ kind: 'deco', deco: decos[i++ % decos.length] });
      }
    }
    return [...half, ...half];
  });

  /** Sailing speed: ~7s per boat */
  duration = computed(() => `${(this.fleetLoop().length / 2) * 4.5}s`);

  hide(e: Event) { (e.target as HTMLElement).style.visibility = 'hidden'; }
}
