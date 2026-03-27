export type Severity = 'AFFECTED' | 'STRONG' | 'LIFE_THREATENING';

export function getSeverityLabel(severity: string | null): string {
  switch (severity) {
    case 'LIFE_THREATENING':
      return 'Lebensgefährlich';
    case 'STRONG':
      return 'Stark';
    case 'AFFECTED':
      return 'Betroffen';
    default:
      return severity || 'Unbekannt';
  }
}

export function getSeverityColor(
  severity: string | null,
): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
  switch (severity) {
    case 'LIFE_THREATENING':
      return 'danger';
    case 'STRONG':
      return 'warn';
    case 'AFFECTED':
      return 'info';
    default:
      return 'secondary';
  }
}

export function getSeverityCSSColor(severity: string | null): string {
  switch (severity) {
    case 'LIFE_THREATENING':
      return 'var(--p-red-500)';
    case 'STRONG':
      return 'var(--p-orange-500)';
    case 'AFFECTED':
      return 'var(--p-blue-500)';
    default:
      return 'var(--p-surface-400)';
  }
}

export interface IntoleranceSelectionDto {
  intoleranceId: number | null;
  customText: string | null;
  severity: Severity | null;
}
