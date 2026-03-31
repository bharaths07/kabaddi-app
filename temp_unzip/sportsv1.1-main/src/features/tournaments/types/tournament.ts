export interface Tournament {
  id: string;
  name: string;
  organizer: string;
  dates: string;
  location: string;
  description: string;
  bannerUrl: string;
  logoUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
  sportId?: string; // s1=Cricket, s2=Football, s3=Kabaddi
  level?: 'Institute' | 'City' | 'State' | 'Country' | 'Other';
  organizerId?: string;
  scorers?: string[];
  teams?: string[]; // Team IDs
  // Extended fields for Edit Mode
  category?: string;
  ballType?: string;
  matchType?: string;
  pitchType?: string;
  ground?: string;
  startDate?: string;
  endDate?: string;
  structure?: {
    format: 'LEAGUE' | 'KNOCKOUT' | 'GROUP_KNOCKOUT';
    rounds?: number;
    groups?: number;
    qualifiedPerGroup?: number;
  };
  scheduleMode?: 'AUTO' | 'MANUAL' | 'LATER';
}
