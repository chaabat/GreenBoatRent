import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Ocean } from '../../shared/ocean/ocean';

@Component({
  selector: 'app-experiences',
  imports: [RouterLink, Ocean],
  templateUrl: './experiences.html'
})
export class Experiences {
  /** One experience per type of visitor → La Flotta already filtered */
  experiences = [
    {
      title: 'Prima volta in barca',
      text: 'Nessuna patente, nessun problema. Un gommone facile da guidare, un briefing completo e via verso le calette.',
      image: 'images/spots/isola-piana.jpg',
      tag: 'Senza patente',
      tipo: 'none'
    },
    {
      title: 'Gommone in libertà',
      text: 'Veloce e agile: la scelta giusta per esplorare più isole in un giorno e fermarti dove vuoi.',
      image: 'images/spots/cavallo.jpg',
      tag: 'Gommoni',
      tipo: 'gommone'
    },
    {
      title: 'Giornata in yacht',
      text: "Comfort, spazio e relax per tutto il gruppo. Per chi vuole vivere l'Arcipelago con stile.",
      image: 'images/spots/caprera.jpg',
      tag: 'Yacht',
      tipo: 'yacht'
    }
  ];

  /** A typical day (rental 9:00 – 18:00) */
  day = [
    { time: '9:00',  title: 'Partenza da Cannigione', text: 'Briefing, consegna della barca e consigli sul percorso del giorno.' },
    { time: '10:30', title: 'Prime calette', text: "Acque turchesi e i primi tuffi nell'Arcipelago della Maddalena." },
    { time: '13:00', title: 'Pranzo in rada', text: "Ancora in una baia riparata e goditi il pranzo in mezzo al mare." },
    { time: '15:00', title: 'Snorkeling', text: 'Fondali bassi e trasparenti: il momento perfetto per scoprire i pesci.' },
    { time: '18:00', title: 'Rientro', text: 'Riconsegna della barca a Cannigione, con il sole ancora alto.' }
  ];

  faq = [
    { q: 'Serve la patente nautica?', a: 'No, per le barche "Senza patente" non serve. Per le altre serve la patente nautica, oppure scegli una barca con equipaggio.' },
    { q: 'Ho poca esperienza, è un problema?', a: 'Nessun problema: prima di partire facciamo un briefing completo e restiamo raggiungibili durante tutta la giornata.' },
    { q: 'E se il meteo non è buono?', a: 'Controlliamo sempre il meteo. Se il mare non è sicuro ti proponiamo un altro giorno.' },
    { q: 'Cosa devo portare?', a: 'Crema solare, cappello, asciugamani, acqua e un documento. Al resto pensiamo noi.' }
  ];
}
