import { describe, it, expect } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TeamComponent } from './team.component';
import { By } from '@angular/platform-browser';
import { provideTranslateTesting } from '../../shared/testing/translate-testing';

describe('TeamComponent', () => {
  it('should create the team component', async () => {
    await TestBed.configureTestingModule({
      imports: [TeamComponent],
      providers: [provideRouter([]), provideTranslateTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(TeamComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should contain a link to health-data', async () => {
    await TestBed.configureTestingModule({
      imports: [TeamComponent],
      providers: [
        provideRouter([{ path: 'team/health-data', component: class {} }]),
        provideTranslateTesting(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TeamComponent);
    fixture.detectChanges();

    const link = fixture.debugElement.query(By.css('a[routerLink="/team/health-data"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.textContent).toContain('Gesundheitsdaten');
  });
});
