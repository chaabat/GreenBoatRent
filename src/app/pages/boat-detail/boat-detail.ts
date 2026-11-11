import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BOATS } from '../../core/data/boats';
import { BookingForm } from '../../shared/booking-form/booking-form';
import { BoatCard } from '../../shared/boat-card/boat-card';

@Component({
  selector: 'app-boat-detail',
  imports: [RouterLink, BookingForm, BoatCard],
  templateUrl: './boat-detail.html'
})
export class BoatDetail {
  private route = inject(ActivatedRoute);
  private params = toSignal(this.route.paramMap);
  private query = toSignal(this.route.queryParamMap);

  boat = computed(() => BOATS.find(b => b.id === this.params()?.get('id')));
  initialDate = computed(() => this.query()?.get('date') ?? '');
  others = computed(() => BOATS.filter(b => b.id !== this.boat()?.id).slice(0, 3));

  specs = computed(() => {
    const b = this.boat();
    if (!b) return [];
    return [
      { label: 'Persone', value: `fino a ${b.pax}` },
      { label: 'Lunghezza', value: b.length },
      { label: 'Larghezza', value: b.width },
      { label: 'Motore', value: b.engine },
      { label: b.tank ? 'Serbatoio' : 'Interni', value: b.tank ?? b.cabins ?? '–' },
      { label: 'Patente', value: b.licenseLabel }
    ];
  });

  included = computed(() => {
    const b = this.boat();
    if (!b) return [];
    const list = ['Dotazioni di sicurezza', 'Briefing prima della partenza', 'Assistenza durante la giornata'];
    if (b.shower) list.push('Doccia a bordo');
    if (b.cabins) list.push(b.cabins);
    if (b.license === 'skipper' || b.license === 'crew') list.push('Skipper / equipaggio incluso');
    return list;
  });
}