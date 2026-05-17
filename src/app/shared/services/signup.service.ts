import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SignupDto, SignupInput } from '../models/signup.model';

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
}
