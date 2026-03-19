import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  isDirty: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.isDirty()) {
    return confirm(
      'Sie haben ungespeicherte Änderungen. Möchten Sie die Seite wirklich verlassen?',
    );
  }
  return true;
};
