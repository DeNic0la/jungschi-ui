export interface Participant {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string; // LocalDate
  lastUpdatedAt: string; // LocalDateTime
}

export interface ParticipantInfo extends Participant{
  healthStats: boolean;
  campStats: boolean;
}

export interface ParticipantInput {
  firstname: string;
  lastname: string;
  dateOfBirth: string;
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
  sonstiges: string | null;
}
