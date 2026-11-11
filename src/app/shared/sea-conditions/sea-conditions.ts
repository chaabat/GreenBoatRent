import { Component, inject } from '@angular/core';
import { DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { SeaConditions as Conditions, SeaStatus, WeatherService } from '../../core/services/weather';
type State = { ok: true; c: Conditions } | { ok: false };

@Component({
  selector: 'app-sea-conditions',
  imports: [DecimalPipe],
  templateUrl: './sea-conditions.html'
})
export class SeaConditions {
  private weather = inject(WeatherService);

  state = toSignal<State>(
    this.weather.conditions$.pipe(
      map(c => ({ ok: true as const, c })),
      catchError(() => of({ ok: false as const }))
    )
  );

  statusInfo: Record<SeaStatus, { label: string; text: string; dot: string; pill: string }> = {
    good:    { label: 'Mare ideale',         text: 'Condizioni ottime per uscire',     dot: 'bg-emerald-400', pill: 'bg-emerald-400/20 text-emerald-200' },
    caution: { label: 'Mare mosso',          text: 'Uscita da confermare con lo staff', dot: 'bg-amber-400',   pill: 'bg-amber-400/20 text-amber-200' },
    bad:     { label: 'Uscite sconsigliate', text: 'Condizioni non sicure oggi',        dot: 'bg-red-400',     pill: 'bg-red-400/20 text-red-200' }
  };

  /** WMO weather code → label + icon */
  weatherInfo(code: number): { label: string; icon: string } {
    if (code === 0)  return { label: 'Sereno',        icon: 'sun' };
    if (code <= 2)   return { label: 'Poco nuvoloso', icon: 'partly' };
    if (code === 3)  return { label: 'Nuvoloso',      icon: 'cloud' };
    if (code <= 48)  return { label: 'Nebbia',        icon: 'cloud' };
    if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Pioggia', icon: 'rain' };
    if (code <= 86)  return { label: 'Neve',          icon: 'rain' };
    return { label: 'Temporale', icon: 'storm' };
  }
}