export type HouseholdGuardianContactType = 'PRIMARY' | 'SECONDARY' | 'ADDITIONAL' | 'PENDING';

export interface HouseholdGuardianDto {
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  pictureUrl: string | null;
  contactType: HouseholdGuardianContactType;
  pending: boolean;
  currentUser: boolean;
}

export interface HouseholdDto {
  id: number;
  streetAndNumber: string | null;
  plz: string | null;
  place: string | null;
  guardians: HouseholdGuardianDto[];
}

export interface UpdateHouseholdDto {
  streetAndNumber: string | null;
  plz: string | null;
  place: string | null;
}

export interface AddGuardianDto {
  email: string;
}

export interface UpdateGuardianContactTypeDto {
  contactType: 'PRIMARY' | 'SECONDARY';
}
