export type InstitutionType = 'school' | 'college' | 'club' | 'academy' | 'other';

export interface Address {
  street?: string;
  city: string;
  district: string;
  state: string;
  country: string;
  zipCode?: string;
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  address: Address;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string;
  verified: boolean;
  registeredAt: string; // ISO Date
}
