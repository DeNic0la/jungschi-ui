export type Gender = 'male' | 'female' | 'else';

export interface Participant {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string; // LocalDate
  gender: Gender;
  lastUpdatedAt: string; // LocalDateTime
}

export interface ParticipantInfo extends Participant {
  healthStats: boolean;
  campStats: boolean;
}

export interface ParticipantInput {
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: Gender;
}

export interface HealthStatsDto {
  isHealthy: boolean;
  healthyReason: string | null;
  excludedActivities: string | null;
}

export interface CampStatsDto {
  isTickVaccinated: boolean;
  drugConsent: boolean;
  ahv: string | null;
  krankenkasse: string | null;
  krankenkassenNr: string | null;
  medication: string | null;
  familyDoctor: string | null;
  nationality: string | null;
  nativeLanguage: string | null;
  foodPreferences: string | null;
  notes: string | null;
}
