export interface UserProfile {
  oidcSubject: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface UpdateUserDto {
  email?: string | null;
  phoneNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}
