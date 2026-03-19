import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ParticipantService } from './participant.service';
import { Participant, ParticipantInput } from '../models/participant.model';

describe('ParticipantService', () => {
  let service: ParticipantService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParticipantService],
    });
    service = TestBed.inject(ParticipantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all participants', () => {
    const mockParticipants: Participant[] = [
      { id: 1, firstname: 'John', lastname: 'Doe', dateOfBirth: '1990-01-01', lastUpdatedAt: '2026-03-19T00:00:00' },
    ];

    service.getAll().subscribe((data) => {
      expect(data).toEqual(mockParticipants);
    });

    const req = httpMock.expectOne('/api/participants');
    expect(req.request.method).toBe('GET');
    req.flush(mockParticipants);
  });

  it('should get a participant by id', () => {
    const mockParticipant: Participant = {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      dateOfBirth: '1990-01-01',
      lastUpdatedAt: '2026-03-19T00:00:00',
    };

    service.get(1).subscribe((data) => {
      expect(data).toEqual(mockParticipant);
    });

    const req = httpMock.expectOne('/api/participants/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockParticipant);
  });

  it('should create a participant', () => {
    const input: ParticipantInput = { firstname: 'Jane', lastname: 'Doe', dateOfBirth: '1995-05-05' };
    const response: Participant = { ...input, id: 2, lastUpdatedAt: '2026-03-19T01:00:00' };

    service.create(input).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpMock.expectOne('/api/participants');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(input);
    req.flush(response);
  });

  it('should update a participant', () => {
    const input: ParticipantInput = { firstname: 'Jane', lastname: 'Smith', dateOfBirth: '1995-05-05' };
    const response: Participant = { ...input, id: 2, lastUpdatedAt: '2026-03-19T02:00:00' };

    service.update(2, input).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpMock.expectOne('/api/participants/2');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(input);
    req.flush(response);
  });

  it('should delete a participant', () => {
    service.delete(1).subscribe((data) => {
      expect(data).toBeNull();
    });

    const req = httpMock.expectOne('/api/participants/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
