import { Boat } from '../models/boat';

/** Initial boats – imported once into Firestore from the admin panel ("Importa barche iniziali") */
export const SEED_BOATS: Boat[] = [
  { id: 'capelli-tempest-530', name: 'Capelli Tempest 530', category: 'gommone', license: 'none',     licenseLabel: 'Senza patente', length: '5.35 m', width: '2.26 m', pax: 6,  engine: 'Yamaha 40 CV',    tank: '45 L',  shower: true, cover: 'images/boats/tempest-bg.jpg', cutout: 'images/boats/tempest.png', spot: { name: 'Isola Piana', image: 'images/spots/isola-piana.jpg' }, active: true, order: 1 },
  { id: 'bsc-570-classic',     name: 'BSC 5.70 Classic',    category: 'gommone', license: 'none',     licenseLabel: 'Senza patente', length: '5.71 m', width: '2.45 m', pax: 7,  engine: 'Yamaha 40-70 CV', tank: '160 L', shower: true, cover: 'images/boats/bsc570-bg.jpg',  cutout: 'images/boats/bsc570.png',  spot: { name: 'Cavallo',     image: 'images/spots/cavallo.jpg' },     active: true, order: 2 },
  { id: 'bwa-sport-22-gt',     name: 'BWA Sport 22 GT',     category: 'gommone', license: 'required', licenseLabel: 'Con patente',   length: '6.75 m', width: '2.75 m', pax: 10, engine: 'Honda 150 CV',    tank: '190 L', shower: true, cover: 'images/boats/bwa22-bg.jpg',   cutout: 'images/boats/bwa22.png',   spot: { name: 'Mortorio',    image: 'images/spots/mortorio.jpg' },    active: true, order: 3 }
];
