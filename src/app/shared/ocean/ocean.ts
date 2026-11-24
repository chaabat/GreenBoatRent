import { Component, DestroyRef, afterNextRender, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type Species = 'orata' | 'sarago' | 'salpa' | 'donzella' | 'cernia' | 'pappagallo' | 'castagnola';
interface Fish {
  species: Species; name: string; top: number; size: number;
  dur: number; delay: number; dir: 'r' | 'l'; hi: boolean; stop: number;
}

/**
 * One continuous sea used as the background of the public pages:
 * gradient, nautical decorations, fish, octopuses, shrimps, bubbles.
 * Page content goes inside: <app-ocean> ... </app-ocean>
 */
@Component({
  selector: 'app-ocean',
  imports: [RouterLink],
  templateUrl: './ocean.html',
  styleUrl: './ocean.css'
})
export class Ocean {
  /** Show the big fish that stop every minute with a booking message */
  greet = input(false);

  /** Small bubbles rising across the page background */
  bubbles = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 37) % 100,
    y: 15 + ((i * 53) % 85),
    s: 4 + (i % 4) * 3,
    d: -((i * 1.7) % 9)
  }));

  /** Real Sardinian (Mediterranean) fish swimming behind the page.
   *  dir 'r' = left → right, 'l' = right → left.
   *  hi: swims in, stops 3 s to say hi, then shoots away fast. */
  fish: Fish[] = [
    { species: 'orata',      name: "l'Orata",             top: 19, size: 50, dur: 22, delay: -3,  dir: 'r', hi: false, stop: 0 },
    { species: 'castagnola', name: 'la Castagnola',       top: 26, size: 26, dur: 17, delay: -6,  dir: 'l', hi: false, stop: 0 },
    { species: 'cernia',     name: 'la Cernia',           top: 34, size: 80, dur: 38, delay: -12, dir: 'r', hi: false, stop: 0 },
    { species: 'donzella',   name: 'la Donzella pavonina', top: 46, size: 44, dur: 19, delay: -7,  dir: 'l', hi: false, stop: 0 },
    { species: 'salpa',      name: 'la Salpa',            top: 55, size: 52, dur: 24, delay: -4,  dir: 'r', hi: false, stop: 0 },
    { species: 'pappagallo', name: 'il Pesce pappagallo', top: 64, size: 56, dur: 28, delay: -18, dir: 'l', hi: false, stop: 0 },
    { species: 'sarago',     name: 'il Sarago',           top: 76, size: 48, dur: 21, delay: -14, dir: 'r', hi: false, stop: 0 },
    { species: 'orata',      name: "l'Orata",             top: 88, size: 46, dur: 26, delay: -9,  dir: 'l', hi: false, stop: 0 }
  ];

  /** Greeting fish: every minute one of them swims in (big), stops 3 s
   *  with a message inviting to rent a boat, then shoots away.
   *  Each has a 3-minute loop, shifted by 1 minute → one greeting per minute. */
  greeters = [
    { species: 'orata',    top: 14, size: 96, delay: 0,    dir: 'r', stop: 30 },
    { species: 'donzella', top: 47, size: 90, delay: -120, dir: 'l', stop: 58 },
    { species: 'sarago',   top: 77, size: 92, delay: -60,  dir: 'r', stop: 40 }
  ];

  messages = [
    'Ciao! 👋 Il mare ti aspetta, prenota la tua barca!',
    'Anche senza patente puoi guidare un gommone ⚓',
    'Le calette più belle si raggiungono solo in barca 🏝️',
    'Oggi è il giorno perfetto per salpare ☀️',
    "Scopri l'Arcipelago della Maddalena dal mare 🌊",
    'Prenota ora, le date estive volano via! 🐟'
  ];
  /** Changes every minute, so each greeting says something new */
  message = signal(this.messages[0]);

  /** Schools of young castagnole (electric blue) that suddenly rush across */
  schools = [
    { top: 41, dur: 11, delay: -1, dir: 'r' },
    { top: 71, dur: 13, delay: -7, dir: 'l' }
  ];
  schoolFish = [0, 1, 2, 3, 4, 5];

  /** Octopuses resting on the page, sometimes jetting away */
  octopuses = [
    { top: 58, left: 4,  size: 70, delay: -3,  flip: false },
    { top: 86, left: 84, size: 58, delay: -15, flip: true }
  ];
  tentacles = [
    'M24 50c-8 14-14 30-6 44', 'M30 52c-4 16-6 32 2 46', 'M36 54c-1 18-2 34 4 48', 'M40 54c0 18 0 36 0 50',
    'M44 54c1 18 2 34-4 48', 'M50 52c4 16 6 32-2 46', 'M56 50c8 14 14 30 6 44', 'M40 54c-6 16-10 34-16 46'
  ].map((d, i) => ({ d, i }));

  /** Shrimps walking slowly, then flicking backwards */
  shrimps = [
    { top: 31, left: 70, delay: 0,   flip: true },
    { top: 69, left: 28, delay: -9,  flip: false },
    { top: 93, left: 52, delay: -4,  flip: true }
  ];

  /** Real photos live in public/images/sea/<name>.png (facing right).
   *  If a file is missing, the drawn SVG version is used instead. */
  private missingPhotos = signal<ReadonlySet<string>>(new Set());
  hasPhoto(name: string) { return !this.missingPhotos().has(name); }
  noPhoto(name: string) { this.missingPhotos.update(s => new Set(s).add(name)); }
  photo(name: string) { return `images/sea/${name}.png`; }

  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      let i = 0;
      const timer = setInterval(() => this.message.set(this.messages[++i % this.messages.length]), 60_000);
      this.destroyRef.onDestroy(() => clearInterval(timer));
    });
  }

}
