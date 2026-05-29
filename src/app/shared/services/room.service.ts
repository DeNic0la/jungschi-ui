import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RoomDto, RoomInput } from '../models/camp.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/rooms';

  getById(id: number): Observable<RoomDto> {
    return this.http.get<RoomDto>(`${this.apiUrl}/${id}`);
  }

  getForCamp(campId: string): Observable<RoomDto[]> {
    return this.http.get<RoomDto[]>(`${this.apiUrl}/camp/${campId}`);
  }

  getAvailableForCampParticipant(campId: string, campParticipantId: number): Observable<RoomDto[]> {
    return this.http.get<RoomDto[]>(
      `${this.apiUrl}/camp/${campId}/available-for/${campParticipantId}`,
    );
  }

  create(room: RoomInput): Observable<RoomDto> {
    return this.http.post<RoomDto>(this.apiUrl, room);
  }

  update(id: number, room: RoomInput): Observable<RoomDto> {
    return this.http.put<RoomDto>(`${this.apiUrl}/${id}`, room);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
