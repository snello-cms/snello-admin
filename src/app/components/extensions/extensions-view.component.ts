import {Component, OnInit} from '@angular/core';
import {Metadata} from '../../model/metadata';
import {ActivatedRoute, Router} from '@angular/router';
import {ExtensionService} from '../../service/extension.service';

@Component({
    templateUrl: './extensions-view.component.html'
})
export class ExtensionsViewComponent implements OnInit {

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
        public extensionService: ExtensionService) {
    }

    createInstance(): Metadata {
        return new Metadata();
    }

    ngOnInit() {
        this.router.routeReuseStrategy.shouldReuseRoute = () => {
            return false;
        };
        const routeParams = this.activeRoute.snapshot.params;
        this.load(routeParams.id);
    }

    load(uuid: string): void {
        let extension = this.extensionService.contains(uuid);
        if (!extension) {
            this.extensionService.find(uuid).subscribe(
                result => {
                    if (result != null) {
                        extension = result;
                        const script = document.createElement('script');
                        script.src = extension.library_path;
                        document.getElementsByTagName('head')[0].appendChild(script);
                        const content = document.getElementById('content');
                        const element: HTMLElement = document.createElement(extension.tag_name);
                        content.appendChild(element);
                    } else {
                        console.log(' no extension found with uuid: ' + uuid);
                    }
                }
            );
        } else {
            const content = document.getElementById('content');
            const element: HTMLElement = document.createElement(extension.tag_name);
            content.appendChild(element);
        }
    }

}