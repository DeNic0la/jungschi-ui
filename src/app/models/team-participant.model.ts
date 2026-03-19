export interface TeamParticipantDto {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
}

export interface TeamParticipantDetailsDto {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  lastUpdatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  healthStats: {
    isHealthy: boolean;
    healthyReason: string | null;
    excludedActivities: string | null;
  };
  campStats: {
    isTickVaccinated: boolean;
    drugConsent: boolean;
    ahv: string | null;
    krankenkasse: string | null;
    notes: string | null;
  };
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
