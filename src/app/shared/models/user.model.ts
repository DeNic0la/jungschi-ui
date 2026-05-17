export interface UserProfile {
  id?: string;
  oidcSubject: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
}

export interface UpdateUserDto {
  email?: string | null;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
}

export interface GuardianUserDto {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  pictureUrl: string | null;
  householdId: number | null;
  primaryContact: boolean;
  secondaryContact: boolean;
}

