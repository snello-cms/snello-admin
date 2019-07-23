import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {LoginComponent} from '../components/login/login.component';

export const routing: Routes = [
    {
        path: '', component: LoginComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routing)],
    exports: [RouterModule],
})
export class LoginRoutingModule {
}
