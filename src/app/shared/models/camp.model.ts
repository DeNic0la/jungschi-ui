import { Gender } from './participant.model';

export interface CampDto {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  signupEndDate: string | null;
  isJugendUndSport: boolean;
  priceFirst: number | null;
  priceSecond: number | null;
  priceThird: number | null;
}

export interface CampInput {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  signupEndDate: string | null;
  isJugendUndSport: boolean;
  priceFirst: number | null;
  priceSecond: number | null;
  priceThird: number | null;
}

export interface DeleteCampInput {
  feedbackByState: Partial<Record<'IN_PROGRESS' | 'COMPLETED' | 'APPROVED', string | null>>;
}

export interface RoomLeaderDto {
  id: string;
  firstName: string | null;
  lastName: string | null;
  pictureUrl: string | null;
}

export interface RoomDto {
  id: number;
  campId: string | null;
  name: string;
  maxCapacity: number | null;
  assignedCount: number;
  remainingCapacity: number | null;
  gender: Gender | null;
  leaders: RoomLeaderDto[];
}

export interface RoomInput {
  campId: string;
  name: string;
  maxCapacity: number | null;
  gender: Gender | null;
  leaderEmails: string[];
}
