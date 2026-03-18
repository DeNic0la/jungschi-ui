import { createAuthGuard } from 'keycloak-angular';

export const authGuard = createAuthGuard(async (route, state, authData) => {
  if (!authData.authenticated) {
    await authData.keycloak.login({
      redirectUri: window.location.origin + state.url,
    });

    return false;
  }

  return true;
});
