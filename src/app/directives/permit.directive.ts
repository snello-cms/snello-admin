import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {AuthenticationService} from '../service/authentication.service';

@Directive({
    selector: '[permit]'
})
export class PermitDirective {

    private _prevCondition: boolean = null;

    constructor(private viewContainerRef: ViewContainerRef,
                private templateRef: TemplateRef<any>,
                private authenticationService: AuthenticationService,
    ) {
    }

    @Input() set permit(aclName: string) {
        this.authenticationService.getUtente().subscribe(
            utente => {
                if (utente) {
                    this.checkRoles(utente.roles, aclName);
                }
            });
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
