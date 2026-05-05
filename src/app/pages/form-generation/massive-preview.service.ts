import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable()
export class MassivePreviewService {
    private readonly previewRequestSubject = new Subject<void>();

    get previewRequests$(): Observable<void> {
        return this.previewRequestSubject.asObservable();
    }

    requestPreview() {
        this.previewRequestSubject.next();
    }
}