import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalDefinitionDto } from '../models/global-definition.model';

@Injectable({
  providedIn: 'root',
})
export class GlobalDefinitionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/global-definitions';

  getFoodIntolerances(): Observable<GlobalDefinitionDto[]> {
    return this.http.get<GlobalDefinitionDto[]>(`${this.apiUrl}/food-intolerances`);
  }

  getAllergies(): Observable<GlobalDefinitionDto[]> {
    return this.http.get<GlobalDefinitionDto[]>(`${this.apiUrl}/allergies`);
  }
}
