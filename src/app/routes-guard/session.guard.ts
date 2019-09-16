import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {AuthenticationService} from '../service/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class SessionGuard implements CanActivate {

    constructor(private router: Router,
                private authenticationService: AuthenticationService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        console.log('session guard: ' + this.authenticationService.checkLogged());
        if (!this.authenticationService.checkLogged()) {
            this.router.navigate(['/login']);
            return false;
        }
        return true;
    }

}
