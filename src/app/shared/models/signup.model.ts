export type SignupState = 'IN_PROGRESS' | 'REVIEWED' | 'COMPLETED' | 'DONE';

export interface CampParticipantMedicationInput {
  medicationName: string;
  dose: string | null;
  frequency: string | null;
  purpose: string | null;
  needsHelp: boolean;
  confidential: boolean;
}

export interface CampParticipantSignupInput {
  participantId: number;
  schoolClass: string | null;
  infosZimmerleitung: string | null;
  bemerkungen: string | null;
  drugConsent: boolean;
  medications: CampParticipantMedicationInput[];
}

export interface SignupInput {
  campId: string;
  photoConsent: boolean;
  infoEmail: boolean;
  additionalContactOptionsDuringCamp: string | null;
  campParticipants: CampParticipantSignupInput[];
}

export interface SignupDto extends SignupInput {
  id: number;
  state: SignupState;
  feedback: string | null;
}
