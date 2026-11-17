import {Directive, inject} from '@angular/core';
import {Select} from 'primeng/select';

/**
 * Makes the clear button (X on the right end) the default for every {@code <p-select>}: PrimeNG's default is off and
 * has no global setting. A template that binds {@code [showClear]} itself still wins, because input bindings are
 * applied after this constructor runs.
 *
 * Standalone components must list it next to {@code SelectModule} in their {@code imports}.
 */
@Directive({
    selector: 'p-select',
    standalone: true
})
export class SelectClearDefaultDirective {

    constructor() {
        const select = inject(Select);
        if (select.showClear === undefined) {
            select.showClear = true;
        }
    }
}
