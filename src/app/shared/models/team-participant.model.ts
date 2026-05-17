import { Gender } from './participant.model';

export interface TeamParticipantDto {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: Gender;
  lastUpdatedAt: string;
}

export interface TeamParticipantDetailsDto {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: Gender;
  lastUpdatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    address: string | null;
  };
  healthStats: {
    isHealthy: boolean;
    healthyReason: string | null;
    excludedActivities: string | null;
  } | null;
  campStats: {
    isTickVaccinated: boolean;
    ahv: string | null;
    krankenkasse: string | null;
    krankenkassenNr: string | null;
    familyDoctor: string | null;
    nationality: string | null;
    nativeLanguage: string | null;
    foodPreferences: string | null;
    notes: string | null;
  } | null;
  intoleranceSelections: Array<{
    id: number;
    intolerance: {
      id: number;
      label: string;
      definitionValue: string;
      category: string;
    };
    customText: string | null;
    severity: string;
  }>;
}
