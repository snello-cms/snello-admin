import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ASSET_PATH} from '../../constants/constants';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigurationService} from '../../service/configuration.service';

@Component({
    templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

    public mainForm: FormGroup;
    public logging = false;
    public asset_path: string;

    constructor(private authenticationService: AuthenticationService,
                private messageService: MessageService,
                private fb: FormBuilder,
                private configurationService: ConfigurationService,
                private router: Router) {
        configurationService.getValue(ASSET_PATH).subscribe(
            ass => this.asset_path = ass
        );
    }

    ngOnInit() {
        this.buildForm();
        if (this.authenticationService.checkLogged()) {
            this.router.navigate(['/adminpage']);
        }
    }

    public login(username: string, password: string) {
        if (username && password) {
            this.logging = true;
            this.authenticationService.login(username, password)
                .subscribe(() => {
                    this.logging = false;
                    this.router.navigate(['/adminpage']);
                }, error => {
                    this.logging = false;
                });
        }
    }

    public onSubmit() {
        this.login(this.mainForm.get('username').value, this.mainForm.get('password').value);
    }

    private buildForm() {
        this.mainForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }
}
