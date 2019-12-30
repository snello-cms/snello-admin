import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MessageService} from 'primeng/api';
import {ASSET_PATH} from '../../constants/constants';
import {AuthenticationService} from '../../service/authentication.service';
import {ConfigurationService} from '../../service/configuration.service';

@Component({
    templateUrl: './password.reset.component.html'
})
export class PasswordResetComponent implements OnInit {

    public mainForm: FormGroup;
    public logging = false;
    public asset_path: string;
    public sent: boolean;

    constructor(private authenticationService: AuthenticationService,
                private messageService: MessageService,
                private fb: FormBuilder,
                private configurationService: ConfigurationService,
                private router: Router) {
        configurationService.getValue(ASSET_PATH).subscribe(
            ass => this.asset_path = ass
        );
    }

    public resetpassword(username: string) {
        this.authenticationService.resetpassword(username)
            .subscribe(() => {
                this.sent = true;
                this.messageService.add({
                    severity: 'info',
                    summary: 'reset password executed successfully',
                });
                this.router.navigate(['/password-change', username]);
            }, error => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'reset password error',
                });
                this.logging = false;
            });
    }

    public onSubmit() {
        this.resetpassword(this.mainForm.get('username').value);
    }

    public oneMoreTime() {
        this.sent = false;
    }

    private buildForm() {
        this.mainForm = this.fb.group({
            username: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.buildForm();
    }
}
