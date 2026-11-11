import { Component, DestroyRef, ElementRef, afterNextRender, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Boat } from '../../core/models/boat';

@Component({
  selector: 'app-boat-card',
  imports: [RouterLink],
  templateUrl: './boat-card.html',
  styleUrl: './boat-card.css',
  host: { '[class.is-active]': 'active()' }
})
export class BoatCard {
  boat = input.required<Boat>();

  /** true on mobile when the card reaches the middle of the screen */
  active = signal(false);

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      // Touch screens: animate when the card scrolls into the middle of the screen
      if (!window.matchMedia('(hover: none)').matches) return;
      const io = new IntersectionObserver(
        ([entry]) => this.active.set(entry.isIntersecting),
        { rootMargin: '-35% 0px -35% 0px' }
      );
      io.observe(this.el.nativeElement);
      this.destroyRef.onDestroy(() => io.disconnect());
    });
  }

  /** Boat follows the mouse a little (3D tilt) */
  tilt(e: PointerEvent) {
    if (e.pointerType !== 'mouse') return;
    const card = e.currentTarget as HTMLElement;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty('--ry', `${x * 18}deg`);
    card.style.setProperty('--rx', `${-y * 12}deg`);
  }

  resetTilt(e: PointerEvent) {
    const card = e.currentTarget as HTMLElement;
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--rx', '0deg');
  }

  hide(e: Event) { (e.target as HTMLElement).style.display = 'none'; }
}