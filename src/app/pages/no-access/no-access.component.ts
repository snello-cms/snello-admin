import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import Keycloak from 'keycloak-js';

/**
 * Landing page for an authenticated user who may not see anything: not Admin / Manager and in no Keycloak group
 * matching a table. Before it existed the guard bounced such a user between /home (needs a group) and /adminpage
 * (needs Admin / Manager), each redirect cancelling the other, and the app rendered an empty page.
 */
@Component({
    selector: 'app-no-access',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-6">
                    <div class="card-home p-4">
                        <h3>No content available</h3>
                        <p>
                            You are signed in as <b>{{ username }}</b>, but your account has no access to any content yet.
                        </p>
                        <p class="text-muted">
                            Ask an administrator to add you to the Keycloak group of the content you need
                            (for example <code>lovers</code>).
                        </p>
                        <button type="button" class="btn btn-primary" (click)="logout()">
                            <i class="fa fa-sign-out" aria-hidden="true"></i> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class NoAccessComponent {
    private readonly keycloak = inject(Keycloak);

    readonly username = (this.keycloak.tokenParsed as { preferred_username?: string } | undefined)?.preferred_username ?? '';

    async logout() {
        await this.keycloak.logout({redirectUri: window.location.origin + '/'});
    }
}
