import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBar } from '../../shared/search-bar/search-bar';
import { BoatCard } from '../../shared/boat-card/boat-card';
import { SeaConditions } from '../../shared/sea-conditions/sea-conditions';
import { BoatService } from '../../core/services/boat';
import { DESTINATIONS } from '../../core/data/destinations';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SearchBar, BoatCard, SeaConditions],
  templateUrl: './home.html'
})
export class Home {
  boats = inject(BoatService).boats;
  destinations = DESTINATIONS;

  perks = [
    { title: 'Con o senza patente', icon: 'M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4' },
    { title: 'Skipper su richiesta', icon: 'M4 16h16l-2 4H6zM12 4v10M12 4l6 8h-6' },
    { title: 'Sicurezza e comfort', icon: 'M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5' },
    { title: 'Pagamento con carta', icon: 'M3 6h18v12H3zM3 10h18M7 15h4' }
  ];

  contactSent = signal(false);

  sendContact(e: Event) {
    e.preventDefault();
    // Firebase will be connected here later
    this.contactSent.set(true);
    (e.target as HTMLFormElement).reset();
  }
}