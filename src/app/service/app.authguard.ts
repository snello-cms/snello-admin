import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import {ConfigurationService} from './configuration.service';
import {firstValueFrom} from 'rxjs';

const isAccessAllowed = async (
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
    authData: AuthGuardData
): Promise<boolean> => {
    const configurationService = inject(ConfigurationService);
    const { authenticated, grantedRoles, keycloak } = authData;

    if (!authenticated) {
        const scope = await firstValueFrom(configurationService.getValue('scope'));
        await keycloak.login({ scope });
        return false;
    }

    const requiredRoles = route.data['roles'] as string[] | undefined;
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    const realmRoles = grantedRoles.realmRoles ?? [];
    const resourceRoles = Object.values(grantedRoles.resourceRoles ?? {}).flat();
    const roles = [...realmRoles, ...resourceRoles];

    return requiredRoles.some(requiredRole => roles.includes(requiredRole));
};

export const AppAuthGuard = createAuthGuard<CanActivateFn>(isAccessAllowed);
