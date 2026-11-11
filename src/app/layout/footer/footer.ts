import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html'
})
export class Footer {
  year = new Date().getFullYear();
  links = [
    { label: 'Home', path: '/' },
    { label: 'Flotta', path: '/flotta' },
    { label: 'Esperienze', path: '/esperienze' },
    { label: 'Destinazioni', path: '/destinazioni' },
    { label: 'Contatti', path: '/contatti' }
  ];
}