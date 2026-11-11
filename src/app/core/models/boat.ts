export type LicenseType = 'none' | 'required' | 'skipper' | 'crew';

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
  cover: string;   // background photo
  cutout: string;  // boat PNG with transparent background
}