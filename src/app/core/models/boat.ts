export type LicenseType = 'none' | 'required' | 'skipper' | 'crew';

export interface Spot {
  name: string;
  image: string;
}

export interface Boat {
  id: string;
  name: string;
  category: 'gommone' | 'yacht';
  license: LicenseType;
  licenseLabel: string;
  length: string;
  width: string;
  pax: number;
  engine: string;
  tank?: string;
  cabins?: string;
  shower: boolean;
  cover: string;   // boat photo
  cutout: string;  // boat PNG, transparent
  spot: Spot;      // Sardinia place shown on hover
}