import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CampDto } from '../models/camp.model';

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
}

