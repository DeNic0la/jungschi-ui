import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CampDto, CampInput, DeleteCampInput } from '../models/camp.model';

@Injectable({
  providedIn: 'root',
})
export class CampService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/camps';

  getAll(): Observable<CampDto[]> {
    return this.http.get<CampDto[]>(this.apiUrl);
  }

  getById(id: string): Observable<CampDto> {
    return this.http.get<CampDto>(`${this.apiUrl}/${id}`);
  }

  create(camp: CampInput): Observable<CampDto> {
    return this.http.post<CampDto>(this.apiUrl, camp);
  }

  update(id: string, camp: CampInput): Observable<CampDto> {
    return this.http.put<CampDto>(`${this.apiUrl}/${id}`, camp);
  }

  delete(id: string, input: DeleteCampInput): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { body: input });
  }
}
