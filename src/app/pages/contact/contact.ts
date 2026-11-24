import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Ocean } from '../../shared/ocean/ocean';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, Ocean],
  templateUrl: './contact.html'
})
export class Contact {
  phone = '+39 379 186 9281';
  phoneHref = 'tel:+393791869281';
  whatsapp = 'https://wa.me/393791869281';

  /** Google Maps embed (no API key needed) */
  map = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=Cannigione%2C%20Arzachena%20SS&z=13&output=embed'
  );

  sent = signal(false);

  send(e: Event) {
    e.preventDefault();
    // Firebase / EmailJS will be connected here later (same as the Home form)
    this.sent.set(true);
    (e.target as HTMLFormElement).reset();
  }
}
