import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ocean } from '../../shared/ocean/ocean';
import { DESTINATIONS } from '../../core/data/destinations';

@Component({
  selector: 'app-destinations',
  imports: [RouterLink, Ocean],
  templateUrl: './destinations.html'
})
export class Destinations {
  destinations = DESTINATIONS;

  tips = [
    { title: 'Parco nazionale', text: "L'Arcipelago è un parco protetto: alcune zone hanno limiti di navigazione e ancoraggio. Te le indichiamo al briefing." },
    { title: 'Parti presto', text: 'Le calette più famose si riempiono in tarda mattinata. Partire alle 9:00 ti regala il mare più calmo e libero.' },
    { title: 'Occhio al vento', text: 'Con il maestrale scegliamo insieme le baie più riparate. Controlliamo sempre il meteo prima della partenza.' }
  ];
}
