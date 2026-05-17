import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AddGuardianDto,
  HouseholdDto,
  UpdateGuardianContactTypeDto,
  UpdateHouseholdDto,
} from '../models/household.model';

@Injectable({
  providedIn: 'root',
})
export class HouseholdService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/household/me';

  get(): Observable<HouseholdDto> {
    return this.http.get<HouseholdDto>(this.apiUrl);
  }

  update(update: UpdateHouseholdDto): Observable<HouseholdDto> {
    return this.http.put<HouseholdDto>(this.apiUrl, update);
  }

  addGuardian(addGuardian: AddGuardianDto): Observable<HouseholdDto> {
    return this.http.post<HouseholdDto>(`${this.apiUrl}/guardians`, addGuardian);
  }

  removeGuardian(email: string): Observable<HouseholdDto> {
    return this.http.delete<HouseholdDto>(`${this.apiUrl}/guardians/${encodeURIComponent(email)}`);
  }

  updateGuardianContactType(
    email: string,
    update: UpdateGuardianContactTypeDto,
  ): Observable<HouseholdDto> {
    return this.http.put<HouseholdDto>(
      `${this.apiUrl}/guardians/${encodeURIComponent(email)}/contact-type`,
      update,
    );
  }
}
