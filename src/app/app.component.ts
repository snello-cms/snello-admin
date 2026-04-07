import {Component, OnInit} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import {filter} from 'rxjs/operators';
import {take} from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    imports: [RouterOutlet]
})
export class AppComponent implements OnInit {
    constructor(private router: Router) {
    }

    ngOnInit() {
        // We listen for the first successful navigation completion
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd),
            take(1)
        ).subscribe(() => {
            const currentUrl = this.router.url;

            // Check if the URL ends with or contains the &iss flag
            if (currentUrl.includes('&iss')) {
                const cleanUrl = currentUrl.replace('&iss', '');

                // Navigate to the clean URL
                // replaceUrl: true ensures the "dirty" URL isn't saved in browser history
                this.router.navigateByUrl(cleanUrl, {replaceUrl: true});
            }
        });
    }

}
