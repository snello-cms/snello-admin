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
        return this.configurazione[key];
    }
}
