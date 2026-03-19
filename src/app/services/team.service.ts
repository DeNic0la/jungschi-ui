import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeamParticipantDto, TeamParticipantDetailsDto } from '../models/team-participant.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/team/participants';

  getAllParticipants(): Observable<TeamParticipantDto[]> {
    return this.http.get<TeamParticipantDto[]>(this.apiUrl);
  }

  getParticipant(id: string | number): Observable<TeamParticipantDetailsDto> {
    return this.http.get<TeamParticipantDetailsDto>(`${this.apiUrl}/${id}`);
  }
}
