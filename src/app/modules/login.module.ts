import {NgModule} from '@angular/core';
import {SharedModule} from './shared.module';
import {LoginRoutingModule} from "./login.routes.module";
import {LoginComponent} from "../components/login/login.component";

@NgModule({
    imports: [
        SharedModule,
        LoginRoutingModule
    ],
    declarations: [
      LoginComponent
    ]
})
export class LoginModule {
}
