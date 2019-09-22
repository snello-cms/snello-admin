import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component(
    {
        template: ''
    }
)
export class FormGenerationListGeneralComponent implements OnInit {
    metadataName: string;

    constructor(
        protected router: Router,
        private route: ActivatedRoute) {
    }


    ngOnInit() {
        this.metadataName = this.route.snapshot.params['name'];
        this.router.navigate(['/datalist/list/', this.metadataName]);
    }
}

