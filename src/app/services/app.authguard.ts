import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import {ConfigurationService} from './configuration.service';
import {firstValueFrom} from 'rxjs';

const isAccessAllowed = async (
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
    authData: AuthGuardData
): Promise<boolean> => {
    const configurationService = inject(ConfigurationService);
    const router = inject(Router);
    const { authenticated, grantedRoles, keycloak } = authData;

    if (!authenticated) {
        const scope = await firstValueFrom(configurationService.getValue('scope'));
        await keycloak.login({ scope });
        return false;
    }

    const realmRoles = grantedRoles.realmRoles ?? [];
    const resourceRoles = Object.values(grantedRoles.resourceRoles ?? {}).flat();
    const roles = [...realmRoles, ...resourceRoles];

    const requiredRoles = route.data['roles'] as string[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.some(requiredRole => roles.includes(requiredRole))) {
            await router.navigate(['/home']);
            return false;
        }
    }

    const requiresGroup = route.data['requiresGroup'] as boolean | undefined;
    if (requiresGroup) {
        const tokenParsed = keycloak.tokenParsed as { groups?: string[] } | undefined;
        const groups = tokenParsed?.groups ?? [];
        if (groups.length === 0) {
            await router.navigate(['/adminpage']);
            return false;
        }
    }

    return true;
};

export const AppAuthGuard = createAuthGuard<CanActivateFn>(isAccessAllowed);
