import {ActivatedRouteSnapshot, BaseRouteReuseStrategy} from '@angular/router';

/**
 * Angular reuses a component when only the route params change (datalist/new/reservations -> datalist/new/customers,
 * fielddefinition/edit/a -> fielddefinition/edit/b, browser back / forward, a typed URL). The admin's pages read
 * their params from the snapshot once, in ngOnInit, so a reused page kept showing the previous table / record.
 * <ul>
 *   <li>every route: a path param change gives a fresh component</li>
 *   <li>routes with {@code data: {recreateOnParamChange: true}} (datalist): a query param change too (clone_uuid,
 *       massive)</li>
 * </ul>
 */
export class ParamChangeReuseStrategy extends BaseRouteReuseStrategy {

    override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        if (future.routeConfig !== curr.routeConfig) {
            return false;
        }
        const sameParams = JSON.stringify(future.params) === JSON.stringify(curr.params);
        const queryMatters = !!future.routeConfig?.data?.['recreateOnParamChange'];
        const sameQuery = !queryMatters || JSON.stringify(future.queryParams) === JSON.stringify(curr.queryParams);
        if (!sameParams || !sameQuery) {
            console.debug('[router] new component for', future.routeConfig?.path, future.params, future.queryParams);
        }
        return sameParams && sameQuery;
    }
}
