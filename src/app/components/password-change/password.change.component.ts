import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ASSET_PATH} from '../../constants/constants';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigurationService} from '../../service/configuration.service';
import {ChangePassword} from '../../model/change-password';

@Component({
    templateUrl: './password.change.component.html'
})
export class PasswordChangeComponent implements OnInit {

    public mainForm: FormGroup;
    public logging = false;
    public asset_path: string;
    public sent: boolean;
    public username: string;
    public changePassword: ChangePassword;

    constructor(private authenticationService: AuthenticationService,
                private messageService: MessageService,
                private fb: FormBuilder,
                private configurationService: ConfigurationService,
                public route: ActivatedRoute,
                private router: Router) {
        configurationService.getValue(ASSET_PATH).subscribe(
            ass => this.asset_path = ass
        );
        this.username = this.route.snapshot.params['id'];
        this.changePassword = new ChangePassword();
    }

    public changepassword(token: string, password: string, confirm_password: string) {
        this.changePassword.confirm_password = confirm_password;
        this.changePassword.password = password;
        this.changePassword.token = token;
        this.authenticationService.changepassword(this.username, this.changePassword)
            .subscribe(() => {
                this.sent = true;
                this.messageService.add({
                    severity: 'info',
                    summary: 'reset password executed successfully',
                });
            }, error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'reset password error',
                });
                this.logging = false;
            });
    }

    public onSubmit() {
        this.changepassword(
            this.mainForm.get('token').value,
            this.mainForm.get('password').value,
            this.mainForm.get('confirm_password').value,
        );
    }

    public oneMoreTime() {
        this.sent = false;
    }

    private buildForm() {
        this.mainForm = this.fb.group({
            token: ['', Validators.required],
            password: ['', Validators.required],
            confirm_password: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.buildForm();
    }
}
