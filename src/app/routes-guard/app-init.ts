import {ConfigurationService} from '../service/configuration.service';

export function initializer(configurationService: ConfigurationService): () => Promise<any> {
    return (): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                await configurationService.init();
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    };
}
