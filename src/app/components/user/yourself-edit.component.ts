import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {User} from '../../model/user';
import {UserService} from '../../service/user.service';
import {AuthenticationService} from '../../service/authentication.service';

@Component(
    {
        templateUrl: './yourself-edit.component.html'
    }
)
export class YourselfEditComponent {

    public element: User;
    public confirmPassword: string;

    constructor(
        private authenticationService: AuthenticationService,
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public messageService: MessageService,
        public userService: UserService) {
        const id: string = this.route.snapshot.params['id'];
        if (id) {
            this.userService.find(id).subscribe(
                element => {
                    this.element = element;
                });
        }

    }

    update() {
        if (this.element.password && this.confirmPassword !== this.element.password) {
            this.messageService.add(
                {severity: 'error', summary: 'Password is not valid'}
            );
        }
        this.userService.update(this.element).subscribe(
            element => {
                this.messageService.add(
                    {severity: 'info', summary: 'Modify completed with success.'}
                );
                this.router.navigate(['/adminpage']);
            });
    }

    undo() {
        this.router.navigate(['/adminpage']);
    }

}

