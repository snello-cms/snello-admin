import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {KeycloakService} from 'keycloak-angular';
import {KeycloakProfile} from 'keycloak-js';

@Directive({
    selector: '[permit]'
})
export class PermitDirective {

    private _prevCondition: boolean = null;
    userDetails: KeycloakProfile;
    roles: string[];

    constructor(private keycloakService: KeycloakService,
                private viewContainerRef: ViewContainerRef,
                private templateRef: TemplateRef<any>,
    ) {
        this.keycloakService.loadUserProfile().then(
            user => this.userDetails = user
        );
        this.roles = this.keycloakService.getUserRoles();
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
}
