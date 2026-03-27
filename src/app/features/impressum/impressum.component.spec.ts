import { describe, it, expect } from 'vitest';
/**
 * @vitest-environment jsdom
 */
import { TestBed } from '@angular/core/testing';
import { ImpressumComponent } from './impressum.component';

describe('ImpressumComponent', () => {
  it('should create the component', async () => {
    await TestBed.configureTestingModule({
      imports: [ImpressumComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ImpressumComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render the title', async () => {
    await TestBed.configureTestingModule({
      imports: [ImpressumComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ImpressumComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Impressum');
  });
});
