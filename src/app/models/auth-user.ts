export class AuthUser {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    userType?: 'Admin' | 'Manager' | 'User';
    groupNames: string[];
    enabled: boolean;
    emailVerified: boolean;
    password?: string;
}
