import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeamService } from './team.service';
import { TeamParticipantDto } from '../models/team-participant.model';

describe('TeamService', () => {
  let service: TeamService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamService],
    });
    service = TestBed.inject(TeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all participants', () => {
    const mockParticipants: TeamParticipantDto[] = [
      { id: 1, firstname: 'John', lastname: 'Doe', dateOfBirth: '1990-01-01' },
      { id: 2, firstname: 'Jane', lastname: 'Doe', dateOfBirth: '1992-05-15' },
    ];

    service.getAllParticipants().subscribe((participants) => {
      expect(participants).toEqual(mockParticipants);
    });

    const req = httpMock.expectOne('/api/team/participants');
    expect(req.request.method).toBe('GET');
    req.flush(mockParticipants);
  });

  it('should fetch a single participant by id', () => {
    const mockParticipant = {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      healthData: 'Some data',
    };

    service.getParticipant(1).subscribe((participant) => {
      expect(participant).toEqual(mockParticipant);
    });

    const req = httpMock.expectOne('/api/team/participants/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockParticipant);
  });
});
