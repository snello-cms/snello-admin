import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { Document } from '../../models/document';
import { SideBarComponent } from '../sidebar/sidebar.component';
import { AdminhomeTopBar } from '../adminhome-topbar/adminhome-topbar.component';

@Component({
    standalone: true,
    templateUrl: './document-view.component.html',
    imports: [SideBarComponent, AdminhomeTopBar]
})
export class DocumentViewComponent implements OnInit {
    document: Document | null = null;
    errorMessage = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private documentService: DocumentService
    ) {}

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        if (!id) {
            this.errorMessage = 'Document id missing.';
            return;
        }

        this.documentService.find(id).subscribe({
            next: doc => {
                this.document = doc;
            },
            error: () => {
                this.errorMessage = 'Unable to load document.';
            }
        });
    }

    backToImages() {
        this.router.navigate(['/images/list']);
    }

    downloadPath(uuid?: string) {
        if (!uuid) {
            return '';
        }
        return this.documentService.downloadPath(uuid);
    }

    isImage(mimetype?: string) {
        return typeof mimetype === 'string' && mimetype.startsWith('image');
    }
}
