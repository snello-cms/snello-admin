import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import Keycloak, {KeycloakTokenParsed} from 'keycloak-js';

@Directive({ selector: '[permit]' })
export class PermitDirective {

    private _prevCondition = false;
    roles: string[];

    constructor(private keycloak: Keycloak,
                private viewContainerRef: ViewContainerRef,
                private templateRef: TemplateRef<any>,
    ) {
        this.roles = this.getUserRoles();
    }

    @Input() set permit(aclName: string) {
        this.checkRoles(this.roles, aclName);
    }

    checkRoles(userRoles: string[], aclRole: string) {
        // console.log('permit: ' + aclRole);
        if (!userRoles) {
            console.log('no user roles fro user in session!');
            return;
        }

        if (userRoles.indexOf('admin') >= 0) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
            this._prevCondition = true;
            return;
        }
        const aclRoles: string[] = aclRole.split(',');
        for (let i = 0; i < aclRoles.length; ++i) {
            if (userRoles.indexOf(aclRoles[i]) >= 0) {
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
        };
        const realmRoles = parsed?.realm_access?.roles ?? [];
        const resourceRoles = Object.values(parsed?.resource_access ?? {})
            .flatMap(resource => resource.roles ?? []);
        return [...new Set([...realmRoles, ...resourceRoles])];
    }
}
