import { createAuthGuard } from 'keycloak-angular';

export const authGuard = createAuthGuard(async (route, state, authData) => {
  if (!authData.authenticated) {
    await authData.keycloak.login({
      redirectUri: window.location.origin + state.url,
    });

    return false;
  }

  const requiredRoles = route.data['roles'] as string[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  return requiredRoles.every((role) => authData.keycloak.hasRealmRole(role));
});
