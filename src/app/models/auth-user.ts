export class AuthUser {
    id: string;
    username: string;
    email: string;
    name: string;
    surname: string;
    groupNames: string[];
    enabled: boolean;
    emailVerified: boolean;
    password?: string;
}
