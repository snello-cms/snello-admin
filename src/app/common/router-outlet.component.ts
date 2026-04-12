import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    templateUrl: './router-outlet.html',
    imports: [RouterOutlet]
})
export class RouterOutletComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
