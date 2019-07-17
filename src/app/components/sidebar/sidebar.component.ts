import {Component} from "@angular/core";
import {APP_VERSION} from "../../constants/constants";
import {AuthenticationService} from "../../service/authentication.service";
import {Router} from "@angular/router";

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html'
})
export class SideBarComponent {


  selected: string = "home";

  constructor(private authenticationService: AuthenticationService,
              protected router: Router,
  ) {
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(["/login"]);
  }

  public select(page: string) {
    this.selected = page;
  }

  version(): string {
    return APP_VERSION;
  }

  isContenPage() {
    const lastIndexOfSlash = this.router.url.indexOf('home')
        ||  this.router.url.indexOf('datalist')

    ;
    if (lastIndexOfSlash >= 0) {
      return 'active';
    } else {
      return '';
    }
  }

  isAdminPage() {
    const lastIndexOfSlash = this.router.url.indexOf('adminpage')
        ||  this.router.url.indexOf('metadata')
        ||  this.router.url.indexOf('fielddefinition')
        ||  this.router.url.indexOf('condition')
        ||  this.router.url.indexOf('document')
        ||  this.router.url.indexOf('publicdata')
        ||  this.router.url.indexOf('selectqueries')
        ||  this.router.url.indexOf('user')
        ||  this.router.url.indexOf('role')
        ||  this.router.url.indexOf('urlmaprules')
        ||  this.router.url.indexOf('link');
    if (lastIndexOfSlash >= 0) {
      return 'active';
    } else {
      return '';
    }
  }

}
