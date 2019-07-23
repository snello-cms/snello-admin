import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CONFIG_PATH} from '../constants/constants';

@Injectable()
export class ConfigurationService {

    private configurazione: any;

    constructor(private http: HttpClient) {
    }

    public async init() {
        await this.http.get(CONFIG_PATH).subscribe(
            conf => this.configurazione = conf
        );
    }

    public get(key: string): string {
        if (!this.configurazione) {
            this.http.get(CONFIG_PATH).subscribe(
                conf => {
                    this.configurazione = conf;
                    return this.configurazione[key];
                });
        } else {
            return this.configurazione[key];
        }
    }
}
