import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserProfile, UpdateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users/me';

  private readonly userProfileSignal = signal<UserProfile | null>(null);
  readonly userProfile = this.userProfileSignal.asReadonly();

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl).pipe(
      tap((profile) => this.userProfileSignal.set(profile))
    );
  }

  updateUserProfile(update: UpdateUserDto): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, update).pipe(
      tap((profile) => this.userProfileSignal.set(profile))
    );
  }

  clearProfile(): void {
    this.userProfileSignal.set(null);
  }
}
