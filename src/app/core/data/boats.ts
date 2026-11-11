import { Boat } from '../models/boat';

const img = (n: string) => ({ cover: `images/boats/${n}-bg.jpg`, cutout: `images/boats/${n}.png` });

export const BOATS: Boat[] = [
  { id: 'capelli-tempest-530', name: 'Capelli Tempest 530', category: 'gommone', license: 'none',     licenseLabel: 'Senza patente', length: '5.35 m',  width: '2.26 m', pax: 6,  engine: 'Yamaha 40 CV',     tank: '45 L',  shower: true, ...img('tempest') },
  { id: 'bsc-570-classic',     name: 'BSC 5.70 Classic',    category: 'gommone', license: 'none',     licenseLabel: 'Senza patente', length: '5.71 m',  width: '2.45 m', pax: 7,  engine: 'Yamaha 40-70 CV',  tank: '160 L', shower: true, ...img('bsc570') },
  { id: 'bwa-sport-22-gt',     name: 'BWA Sport 22 GT',     category: 'gommone', license: 'required', licenseLabel: 'Con patente',   length: '6.75 m',  width: '2.75 m', pax: 10, engine: 'Honda 150 CV',     tank: '190 L', shower: true, ...img('bwa22') },
  { id: 'jeanneau-leader-9',   name: 'Jeanneau Leader 9',   category: 'yacht',   license: 'skipper',  licenseLabel: 'Con skipper',   length: '10.00 m', width: '3.40 m', pax: 7,  engine: 'Volvo 2×300 CV',   cabins: '1 cabina · 1 bagno', shower: true, ...img('leader9') },
  { id: 'blu-marlin',          name: 'Blu Marlin',          category: 'yacht',   license: 'crew',     licenseLabel: 'Equipaggio 2',  length: '14.00 m', width: '4.30 m', pax: 10, engine: 'Mercury 3×400 CV', cabins: '1 cabina · 1 bagno', shower: true, ...img('blumarlin') },
  { id: 'pershing-45',         name: 'Pershing 45',         category: 'yacht',   license: 'crew',     licenseLabel: 'Equipaggio 2',  length: '14.20 m', width: '4.10 m', pax: 10, engine: 'MAN 2×610 CV',     cabins: '2 cabine · 2 bagni', shower: true, ...img('pershing45') }
];