import {UserRole} from './user-role';

export class User {

  username: string;
  password: string;
  name: string;
  surname: string;
  email: string;
  uuid_username: string;
  active: boolean;

  user_roles: UserRole[];
}
