import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BoatService } from '../../core/services/boat';

/** Quick booking: choose a boat + date → straight to that boat's booking form */
@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html'
})
export class SearchBar {
  private router = inject(Router);

  boats = inject(BoatService).boats;
  today = new Date().toISOString().split('T')[0];

  boatId = signal('');
  date = signal('');
  /** shake + red border when "Prenota" is clicked without a boat */
  missingBoat = signal(false);

  selected = computed(() => this.boats().find(b => b.id === this.boatId()));

  pickBoat(id: string) {
    this.boatId.set(id);
    this.missingBoat.set(false);
  }

  book() {
    const boat = this.selected();
    if (!boat) {
      this.missingBoat.set(true);
      return;
    }
    this.router.navigate(['/flotta', boat.id], {
      queryParams: this.date() ? { date: this.date() } : {},
      fragment: 'prenota'
    });
  }
}
