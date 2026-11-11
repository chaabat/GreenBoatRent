export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
}

export const DESTINATIONS: Destination[] = [
  { id: 'caprera',      name: 'Caprera',      description: 'Cala Coticcio e acque cristalline',   image: 'images/destinations/caprera.jpg' },
  { id: 'la-maddalena', name: 'La Maddalena', description: 'Cala Granara e il cuore del parco',   image: 'images/destinations/la-maddalena.jpg' },
  { id: 'isola-piana',  name: 'Isola Piana',  description: 'Lagune turchesi e fondali bassi',     image: 'images/destinations/isola-piana.jpg' },
  { id: 'cavallo',      name: 'Cavallo',      description: 'Calette di granito e mare limpido',   image: 'images/destinations/cavallo.jpg' },
  { id: 'mortorio',     name: 'Mortorio',     description: 'Spiagge bianche e silenzio',          image: 'images/destinations/mortorio.jpg' }
];