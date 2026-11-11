import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LangSwitcher } from '../../shared/lang-switcher/lang-switcher';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LangSwitcher],
  templateUrl: './header.html',
  host: { '(window:scroll)': 'onScroll()' }
})
export class Header {
  scrolled = signal(false);
  menuOpen = signal(false);

  links = [
    { label: 'Home', path: '/' },
    { label: 'La flotta', path: '/flotta' },
    { label: 'Esperienze', path: '/esperienze' },
    { label: 'Destinazioni', path: '/destinazioni' },
    { label: 'Contatti', path: '/contatti' }
  ];

  onScroll() { this.scrolled.set(window.scrollY > 40); }
  toggleMenu() { this.menuOpen.update(v => !v); }
}