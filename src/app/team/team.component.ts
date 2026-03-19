import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-team',
  imports: [RouterLink],
  template: `
    <div class="team-container">
      <h1>Jungschiteam</h1>
      <p>Willkommen auf der Team-Seite!</p>

      <div class="team-links">
        <a routerLink="/team/health-data" class="team-link">
          <i class="pi pi-heart"></i>
          <span>Gesundheitsdaten</span>
        </a>
      </div>
    </div>
  `,
  styles: `
    .team-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .team-links {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .team-link {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      background: var(--p-surface-800);
      border-radius: 8px;
      text-decoration: none;
      color: var(--p-surface-0);
      transition: transform 0.2s, background 0.2s;
    }
    .team-link:hover {
      transform: translateY(-4px);
      background: var(--p-surface-700);
    }
    .team-link i {
      font-size: 2.5rem;
      color: var(--p-primary-color);
    }
    .team-link span {
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent {}
