import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {Observable, retry, shareReplay, startWith} from 'rxjs';
import { GlobalDefinitionDto } from '../models/global-definition.model';

@Injectable({
  providedIn: 'root',
})
export class GlobalDefinitionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/global-definitions';

  private readonly foodIntolerances$ = this.http.get<GlobalDefinitionDto[]>(`${this.apiUrl}/food-intolerances`).pipe(
    retry({count: 3, delay: 6_000}),
    shareReplay({bufferSize: 1,refCount: false})
  );
  public readonly globalFoodIntolerances$ = this.foodIntolerances$.pipe(
    startWith([])
  )

  /**
   * @deprecated Use globalFoodIntolerances$ instead
   */
  getFoodIntolerances(): Observable<GlobalDefinitionDto[]> {
    return this.foodIntolerances$;
  }
  private readonly allergies$ = this.http.get<GlobalDefinitionDto[]>(`${this.apiUrl}/allergies`).pipe(
    retry({count: 3, delay: 6_000}),
    shareReplay({bufferSize: 1,refCount: false})
  );
  public readonly globalAllergies$ = this.allergies$.pipe(
    startWith([])
  )

  /**
   * @deprecated Use globalAllergies$ instead
   */
  getAllergies(): Observable<GlobalDefinitionDto[]> {
    return this.allergies$
  }
}
