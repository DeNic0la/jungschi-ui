import { Gender } from './participant.model';

export type SignupState = 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';

export interface CampParticipantMedicationInput {
  medicationName: string;
  dose: string | null;
  frequency: string | null;
  purpose: string | null;
  needsHelp: boolean;
  confidential: boolean;
}

export interface CampParticipantSignupInput {
  participantId: number | null;
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

export interface TeamCampParticipantDto {
  id: number;
  participantId: number;
  firstname: string | null;
  lastname: string | null;
  gender: Gender | null;
  schoolClass: string | null;
  infosZimmerleitung: string | null;
  bemerkungen: string | null;
  drugConsent: boolean | null;
  medications: CampParticipantMedicationInput[];
  roomId: number | null;
  roomName: string | null;
  fullAccess: boolean;
  roomLeaderInfoVisible: boolean;
}

export interface TeamSignupDto {
  id: number;
  campId: string;
  householdId: number | null;
  state: SignupState;
  feedback: string | null;
  photoConsent: boolean;
  infoEmail: boolean;
  additionalContactOptionsDuringCamp: string | null;
  campParticipants: TeamCampParticipantDto[];
}

export interface CampParticipantDetailDto extends TeamCampParticipantDto {
  dateOfBirth: string | null;
}
