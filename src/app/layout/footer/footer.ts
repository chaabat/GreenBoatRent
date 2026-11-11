import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { BOATS } from '../../core/data/boats';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html'
})
export class Footer {
  year = new Date().getFullYear();
  boats = BOATS;
  private sanitizer = inject(DomSanitizer);

  mapLink = 'https://maps.app.goo.gl/B9YQj3kDp6tYFnjq6';
  mapEmbed = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://maps.google.com/maps?q=Green%20Boat%20Rent%20Cannigione&z=15&output=embed'
  );
  pages = [
    { label: 'Home', path: '/' },
    { label: 'La flotta', path: '/flotta' },
    { label: 'Esperienze', path: '/esperienze' },
    { label: 'Destinazioni', path: '/destinazioni' },
    { label: 'Contatti', path: '/contatti' }
  ];

  socials = [
    { label: 'Instagram', url: '#', icon: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5h.01' },
    { label: 'Facebook',  url: '#', icon: 'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z' },
    { label: 'WhatsApp',  url: 'https://wa.me/393791869281', icon: 'M3 21l1.6-4.8A8.5 8.5 0 1 1 8 19.6zM9 8.5c0 3.6 2.9 6.5 6.5 6.5l1-1.6-2-1-1 1a4.5 4.5 0 0 1-2.4-2.4l1-1-1-2z' }
  ];
}