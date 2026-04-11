import { ActivatedRouteSnapshot } from '@angular/router';

export function requiredRouteParam(route: ActivatedRouteSnapshot, key: string): string {
    const value = route.paramMap.get(key);
    if (!value) {
        throw new Error(`Missing required route param: ${key}`);
    }
    return value;
}

export function optionalQueryParam(route: ActivatedRouteSnapshot, key: string): string | undefined {
    return route.queryParamMap.get(key) ?? undefined;
}
