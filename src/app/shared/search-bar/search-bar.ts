import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BOATS } from '../../core/data/boats';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.html'
})
export class SearchBar {
  private router = inject(Router);

  boats = BOATS;
  paxOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  today = new Date().toISOString().split('T')[0];

  date = signal('');
  boat = signal('');
  pax = signal('');

  search() {
    const queryParams: Record<string, string> = {};
    if (this.date()) queryParams['date'] = this.date();
    if (this.pax()) queryParams['pax'] = this.pax();

    if (this.boat()) {
      this.router.navigate(['/flotta', this.boat()], { queryParams });
    } else {
      this.router.navigate(['/flotta'], { queryParams });
    }
  }
}