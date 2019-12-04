import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PublicDatasService} from '../../service/public-data.service';
import {from, of} from 'rxjs';
import {MessageService} from 'primeng/api';

@Component(
  {
    templateUrl: './public-data.component.html',
    styleUrls: ['./public-data.component.css']
  }
)
export class PublicDataComponent implements OnInit {

  metadatas = [];


  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public publicDataService: PublicDatasService,
    private messageService: MessageService
  ) {

  }

  ngOnInit() {
  }

  public uploader(event: any) {
    from(this.uploadFile(event.files[0])).subscribe();
  }

  private uploadFile(fileToUpload: any): Promise<any> {

    return this.publicDataService
      .upload(fileToUpload)
      .then(res => {
        this.messageService.add({
          severity: 'info',
          summary: 'File loaded successfully',
          detail: ''
        });
      })
      .catch(error => {
        this.messageService.add({
          severity: 'info',
          summary: 'Error while loading document ',
          detail: ''
        });
        return of({});
      });
  }



}

