import {Directive, Input, inject, TemplateRef, ViewContainerRef} from '@angular/core';
import Keycloak, {KeycloakTokenParsed} from 'keycloak-js';

@Directive({ selector: '[permit]', standalone: true })
export class PermitDirective {

    private keycloak = inject(Keycloak);
    private viewContainerRef = inject(ViewContainerRef);
    private templateRef = inject(TemplateRef<any>);
    private roles = this.getUserRoles();
    private _prevCondition = false;

    @Input() set permit(aclName: string) {
        this.checkRoles(this.roles, aclName);
    }

    checkRoles(userRoles: string[], aclRole: string) {
        this.viewContainerRef.clear();
        this._prevCondition = false;

        if (!userRoles) {
            return;
        }

        const normalizedUserRoles = userRoles
            .map(role => (role ?? '').trim().toLowerCase())
            .filter(Boolean);

        if (normalizedUserRoles.indexOf('admin') >= 0) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
            this._prevCondition = true;
            return;
        }

        const aclRoles: string[] = aclRole
            .split(',')
            .map(role => (role ?? '').trim().toLowerCase())
            .filter(Boolean);

        for (let i = 0; i < aclRoles.length; ++i) {
            if (normalizedUserRoles.indexOf(aclRoles[i]) >= 0) {
                this.viewContainerRef.createEmbeddedView(this.templateRef);
                this._prevCondition = true;
                return;
            }
        }

    }

    private getUserRoles(): string[] {
        const parsed = this.keycloak.tokenParsed as KeycloakTokenParsed & {
            realm_access?: { roles?: string[] };
            resource_access?: Record<string, { roles?: string[] }>;
            groups?: string[];
        };
        const realmRoles = parsed?.realm_access?.roles ?? [];
        const resourceRoles = Object.values(parsed?.resource_access ?? {})
            .flatMap(resource => resource.roles ?? []);
        const groups = (parsed?.groups ?? []).map(group => (group ?? '').replace(/^\//, ''));
        return [...new Set([...realmRoles, ...resourceRoles, ...groups])];
    }
}
