import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CampStatsDto,
  HealthStatsDto,
  Participant,
  ParticipantInfo,
  ParticipantInput,
} from '../models/participant.model';
import { IntoleranceSelectionDto } from '../models/intolerance-selection.model';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/participants';

  getAll(): Observable<Participant[]> {
    return this.http.get<Participant[]>(this.apiUrl);
  }

  get(id: number): Observable<Participant> {
    return this.http.get<Participant>(`${this.apiUrl}/${id}`);
  }
  info(id: number): Observable<ParticipantInfo> {
    return this.http.get<ParticipantInfo>(`${this.apiUrl}/${id}/info`);
  }

  getHealthStats(participantId: number): Observable<HealthStatsDto | null> {
    return this.http.get<HealthStatsDto | null>(`${this.apiUrl}/${participantId}/health-stats`);
  }

  updateHealthStats(participantId: number, dto: HealthStatsDto): Observable<HealthStatsDto> {
    return this.http.put<HealthStatsDto>(`${this.apiUrl}/${participantId}/health-stats`, dto);
  }

  getCampStats(participantId: number): Observable<CampStatsDto | null> {
    return this.http.get<CampStatsDto | null>(`${this.apiUrl}/${participantId}/camp-stats`);
  }

  updateCampStats(participantId: number, dto: CampStatsDto): Observable<CampStatsDto> {
    return this.http.put<CampStatsDto>(`${this.apiUrl}/${participantId}/camp-stats`, dto);
  }

  create(participant: ParticipantInput): Observable<Participant> {
    return this.http.post<Participant>(this.apiUrl, participant);
  }

  update(id: number, participant: ParticipantInput): Observable<Participant> {
    return this.http.put<Participant>(`${this.apiUrl}/${id}`, participant);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getIntoleranceSelections(participantId: number): Observable<IntoleranceSelectionDto[]> {
    return this.http.get<IntoleranceSelectionDto[]>(
      `${this.apiUrl}/${participantId}/intolerance-selections`,
    );
  }

  updateIntoleranceSelection(
    participantId: number,
    dto: IntoleranceSelectionDto,
  ): Observable<IntoleranceSelectionDto> {
    return this.http.put<IntoleranceSelectionDto>(
      `${this.apiUrl}/${participantId}/intolerance-selections`,
      dto,
    );
  }

  deleteIntoleranceSelection(participantId: number, intoleranceId?: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${participantId}/intolerance-selections`, {
      params: intoleranceId ? { intoleranceId: intoleranceId.toString() } : {},
    });
  }
}
