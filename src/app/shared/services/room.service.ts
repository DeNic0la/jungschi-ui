import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomDto } from '../models/camp.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/rooms';

  getById(id: number): Observable<RoomDto> {
    return this.http.get<RoomDto>(`${this.apiUrl}/${id}`);
  }
}

