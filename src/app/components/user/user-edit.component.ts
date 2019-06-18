import {Component, OnInit} from '@angular/core';
import {AbstractEditComponent} from '../../common/abstract-edit-component';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmationService, SelectItem} from 'primeng/api';
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {RoleService} from "../../service/role.service";
import {UserRoleService} from "../../service/user-role.service";
import {UserRole} from "../../model/user-role";
import { map, switchMap } from 'rxjs/operators';

@Component(
    {
        templateUrl: './user-edit.component.html',
        styleUrls: ['./user-edit.component.css']
    }
)
export class UserEditComponent extends AbstractEditComponent<User> implements OnInit {

    public roles: SelectItem[] = [];
    public userRoles: string[] = [];

    constructor(
        public router: Router,
        public route: ActivatedRoute,
        public confirmationService: ConfirmationService,
        public roleService: RoleService,
        public userRoleService: UserRoleService,
        public userService: UserService) {
        super(router, route, confirmationService, userService, 'user');

    }

    ngOnInit() {

        this.userRoles = [];
        this.element = new User();
        super.ngOnInit();
        this.roleService.getList().subscribe(
            roles => {
                if (roles && roles.length > 0) {
                    for (let role of roles) {
                        this.roles.push({label: role.name, value: role.name});
                    }
                }
            }
        );

    }

    createInstance(): User {
        return new User();
    }

    getId() {
        return this.element.username;
      }

    delete() {
        this.clearMsgs();
        this.editMode = false;
        let usernameToDelete = this.getId();
        this.service.delete(usernameToDelete).pipe(
            switchMap(
                () => {
                    return this.userRoleService.deleteForUsername(usernameToDelete);
                }
            )
        ).subscribe(
            element => {
              this.postDelete();
              this.navigateAfterDelete();
              this.addInfo('Eliminazione completata con successo. ');
            },
            error => {
              this.addError(
                'Impossibile completare la eliminazione. ' + (error || '')
              );
            }
        );
      }

  save() {
    this.clearMsgs();
    this.editMode = false;
    if (!this.preSave()) {
      return;
    }
    this.service.persist(this.element).pipe(
        map(
            element => {
                this.addInfo('Salvataggio completato con successo. ');
                this.element = element;
                return true;
            }),

        switchMap(
            () => {
                let role: UserRole = new UserRole();
                role.role = this.userRoles.join(","); 
                role.username = this.element.username;
                return this.userRoleService.persist(role);
            }
        )
    ).subscribe(
        returned => {
            this.postSave();
            this.navigateAfterSave();

        },
        error => {
          this.addError(
            'Impossibile completare il salvataggio. ' + (error || '')
          );
          this.saveError();
        }
    );
  }

  /**,
      error => {
        this.addError(
          'Impossibile completare il salvataggio. ' + (error || '')
        );
        this.saveError();
      } */
    postFind() {
        this.element.uuid_username = this.element.username;
        this.userRoleService.buildSearch();
        this.userRoleService.search.username = this.element.username;
        this.userRoleService.getList().subscribe(
            ur => {
                if (ur && ur.length > 0) {
                    for (let uurr of ur) {
                        this.userRoles.push(uurr.role);
                    }
                }
            }
        )
    }


    preUpdate(): boolean {
        delete this.element.uuid_username;
        return true;
    }

    update() {
        if (!this.preUpdate()) {
          return;
        }
        this.service.update(this.element).pipe(
            map(
                element => {
                    this.addInfo('Modifica completata con successo. ');
                    this.element = element;
                    return true;
                }),
                switchMap(
                    () => {
                        return this.userRoleService.deleteForUsername(this.element.username);
                    }
                ),
            switchMap(
                () => {
                    let role: UserRole = new UserRole();
                    role.role = this.userRoles.join(","); 
                    role.username = this.element.username;
                    return this.userRoleService.persist(role);
                }
            )
        ).subscribe(
            returned => {
                this.postUpdate();
                this.navigateAfterUpdate();
            }
        );
        //elimino tutti i ruoli e poi li creo di nuovo con una obj
        // {
        // 'username': 'zzzzzz',
        //    'roles': 'a,b,c'
        // }
    }

}
