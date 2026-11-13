export type LicenseType = 'none' | 'required' | 'skipper' | 'crew';
export type BoatCategory = 'gommone' | 'yacht';

export interface Spot {
  name: string;
  image: string;
}

export interface Boat {
  id: string;
  name: string;
  category: BoatCategory;
  license: LicenseType;
  licenseLabel: string;
  length: string;
  width: string;
  pax: number;
  engine: string;
  tank?: string;
  cabins?: string;
  shower: boolean;
  cover: string;   // background photo (URL)
  cutout: string;  // boat PNG with transparent background (URL)
  spot: Spot;      // Sardinia place shown on hover
  active: boolean; // visible on the public site
  order: number;   // position in lists
}

export const LICENSES: { id: LicenseType; label: string }[] = [
  { id: 'none',     label: 'Senza patente' },
  { id: 'required', label: 'Con patente' },
  { id: 'skipper',  label: 'Con skipper' },
  { id: 'crew',     label: 'Equipaggio' }
];

export const SPOTS: Spot[] = [
  { name: 'Isola Piana',                image: 'images/spots/isola-piana.jpg' },
  { name: 'Cavallo',                    image: 'images/spots/cavallo.jpg' },
  { name: 'Mortorio',                   image: 'images/spots/mortorio.jpg' },
  { name: 'Cala Granara',               image: 'images/spots/cala-granara.jpg' },
  { name: 'Caprera',                    image: 'images/spots/caprera.jpg' },
  { name: 'Arcipelago della Maddalena', image: 'images/spots/arcipelago.jpg' }
];
