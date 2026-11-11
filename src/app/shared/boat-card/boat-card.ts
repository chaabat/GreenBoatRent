import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Boat } from '../../core/models/boat';

@Component({
  selector: 'app-boat-card',
  imports: [RouterLink],
  templateUrl: './boat-card.html',
  styleUrl: './boat-card.css'
})
export class BoatCard {
  boat = input.required<Boat>();

  // Touch screens have no hover → show the "popped" state permanently
  popped = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  hide(e: Event) { (e.target as HTMLElement).style.display = 'none'; }
}