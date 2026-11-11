import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  host: { '(window:scroll)': 'onScroll()' }
})
export class Header {
  scrolled = signal(false);
  menuOpen = signal(false);
  lang = signal<'it' | 'en' | 'fr'>('it');

  links = [
    { label: 'Home', path: '/' },
    { label: 'La flotta', path: '/flotta' },
    { label: 'Esperienze', path: '/esperienze' },
    { label: 'Destinazioni', path: '/destinazioni' },
    { label: 'Contatti', path: '/contatti' }
  ];
  langs = ['it', 'en', 'fr'] as const;

  onScroll() { this.scrolled.set(window.scrollY > 40); }
  toggleMenu() { this.menuOpen.update(v => !v); }
  setLang(l: 'it' | 'en' | 'fr') { this.lang.set(l); }
}