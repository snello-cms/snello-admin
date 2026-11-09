import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import {ConfigurationService} from './configuration.service';
import {firstValueFrom} from 'rxjs';

const isAccessAllowed = async (
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
    authData: AuthGuardData
): Promise<boolean | UrlTree> => {
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
    const normalizedRoles = roles.map(role => (role ?? '').toLowerCase());
    const isPrivilegedRole = normalizedRoles.includes('admin') || normalizedRoles.includes('manager');

    const tokenParsed = keycloak.tokenParsed as { groups?: string[] } | undefined;
    const groups = tokenParsed?.groups ?? [];
    // A non-privileged user without groups can open no guarded page: /home needs a group, everything else
    // needs Admin/Manager. Send them to /no-access instead of redirecting between /home and /adminpage forever.
    const landing = isPrivilegedRole || groups.length > 0 ? '/home' : '/no-access';

    const requiredRoles = route.data['roles'] as string[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
        if (!requiredRoles.some(requiredRole => normalizedRoles.includes((requiredRole ?? '').toLowerCase()))) {
            console.info('[guard] missing role', requiredRoles, 'for', _state.url, '-> ' + landing);
            return router.parseUrl(landing);
        }
    }

    const requiresGroup = route.data['requiresGroup'] as boolean | undefined;
    if (requiresGroup && !isPrivilegedRole && groups.length === 0) {
        console.info('[guard] no Keycloak group for', _state.url, '-> /no-access');
        return router.parseUrl('/no-access');
    }

    return true;
};

export const AppAuthGuard = createAuthGuard<CanActivateFn>(isAccessAllowed);
