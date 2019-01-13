
export const TEST_PROTOCOL = 'https://';
// export const TEST_HOST_WITH_COLUMNS = 'vedraxx.flw.ovh:';
export const TEST_HOST_WITH_COLUMNS = 'sulmona.bridge129.com:';
export const TEST_PORT = '443';

export const APP_PROTOCOL = window.location.port === '4200' ? TEST_PROTOCOL : (window.location.protocol + '//');


export const APP_HOST = window.location.port === '4200' ? TEST_HOST_WITH_COLUMNS : (window.location.hostname + ':');
// export const APP_HOST = 'localhost:';

// export const API_PORT = window.location.port;
export const API_PORT = window.location.port === '4200' ? TEST_PORT : window.location.port;


export const API_PATH = APP_PROTOCOL + APP_HOST + API_PORT;

export const CONDITION_API_PATH = API_PATH + '/conditions';
export const DOCUMENT_API_PATH = API_PATH + '/documents';
export const FIELD_DEFINITION_API_PATH = API_PATH + '/fielddefinitions';
export const METADATA_API_PATH = API_PATH + '/metadatas';
export const DATA_LIST_API_PATH = API_PATH + '/datalist';
export const API_SERVICE_PATH = API_PATH + '/api';
