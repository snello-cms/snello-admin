import {Component} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticationService} from "../../service/authentication.service";
import {UserInSession} from "../../model/user-in-session";
import {ADMIN_ITEMS, APP_VERSION} from "../../constants/constants";

@Component(
  {
    templateUrl: "./adminpage.component.html",
    styleUrls: ["./adminpage.component.css"]
  }
)
export class AdminpageComponent {

  items: any[] = [];
  public utente: UserInSession;

  constructor(private _route: ActivatedRoute,
              public router: Router,
              private authenticationService: AuthenticationService) {

    this.utente = new UserInSession();
    this.authenticationService.getUtente().subscribe(
        utente => {
          if (utente) {
            console.log("utente: " + utente.username);
            this.utente = utente;
          } else {
            this.utente.username = "sconosciuto";
          }
        });
    this.items = ADMIN_ITEMS;
  }

  public version(): string {
    return APP_VERSION;
  }


}
