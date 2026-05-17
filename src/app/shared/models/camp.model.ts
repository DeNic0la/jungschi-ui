import { Gender } from './participant.model';

export interface CampDto {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  signupEndDate: string;
  isJugendUndSport: boolean;
  priceFirst: number;
  priceSecond: number;
  priceThird: number;
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
