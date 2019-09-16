import {ConfigurationService} from '../service/configuration.service';

export function initializer(configurationService: ConfigurationService): () => Promise<any> {
    return (): Promise<any> => configurationService.init();
}
