import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CampParticipantDetailDto,
  SignupDto,
  SignupInput,
  TeamSignupDto,
} from '../models/signup.model';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/signups';

  getForCamp(campId: string): Observable<SignupDto | null> {
    return this.http.get<SignupDto | null>(`${this.apiUrl}/camp/${campId}`);
  }

  create(signup: SignupInput): Observable<SignupDto> {
    return this.http.post<SignupDto>(this.apiUrl, signup);
  }

  complete(id: number): Observable<SignupDto> {
    return this.http.put<SignupDto>(`${this.apiUrl}/${id}/complete`, {});
  }

  reopen(id: number): Observable<SignupDto> {
    return this.http.put<SignupDto>(`${this.apiUrl}/${id}/reopen`, {});
  }

  getForCampReview(campId: string): Observable<TeamSignupDto[]> {
    return this.http.get<TeamSignupDto[]>(`${this.apiUrl}/camp/${campId}/review`);
  }

  getCampParticipant(campParticipantId: number): Observable<CampParticipantDetailDto> {
    return this.http.get<CampParticipantDetailDto>(
      `${this.apiUrl}/camp-participants/${campParticipantId}`,
    );
  }

  updateFeedback(id: number, feedback: string | null): Observable<TeamSignupDto> {
    return this.http.put<TeamSignupDto>(`${this.apiUrl}/${id}/feedback`, { feedback });
  }

  reject(id: number, feedback: string): Observable<TeamSignupDto> {
    return this.http.put<TeamSignupDto>(`${this.apiUrl}/${id}/reject`, { feedback });
  }

  approve(id: number): Observable<TeamSignupDto> {
    return this.http.put<TeamSignupDto>(`${this.apiUrl}/${id}/approve`, {});
  }

  assignRoom(campParticipantId: number, roomId: number | null): Observable<TeamSignupDto> {
    return this.http.put<TeamSignupDto>(
      `${this.apiUrl}/camp-participants/${campParticipantId}/room`,
      { roomId },
    );
  }
}
