export type Severity = 'AFFECTED' | 'STRONG' | 'LIFE_THREATENING';

export interface IntoleranceSelectionDto {
  intoleranceId: number | null;
  customText: string | null;
  severity: Severity | null;
}
