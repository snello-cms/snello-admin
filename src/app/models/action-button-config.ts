import {ActionButtonFile} from './action-button-file';
import {ActionButtonLookup} from './action-button-lookup';

/**
 * Configuration of a {@code button} field, stored as JSON in its {@code function_def}. A button field has no column
 * (snello-api skips it): it is a form action.
 *
 * action "prefill": upload {@link files} to {@link url} (POST multipart, with the user's token), then copy the answer
 * into the form fields of the same name. Example (rent shop, issue #4, the id-scan service):
 * <pre>
 * {"action": "prefill", "url": "http://localhost:28090/api/scan", "button": "Scan document",
 *  "files": [{"name": "front", "label": "Front", "required": true}, {"name": "back", "label": "Back"}],
 *  "result": "customer", "warnings": "warnings", "mock": "mock",
 *  "lookups": [{"value": "birth_cadastral_code", "table": "comuni", "by": "cadastral_code", "into": "birth_city"}]}
 * </pre>
 */
export interface ActionButtonConfig {
    action: 'prefill';
    url: string;
    /** text of the button; default the field label */
    button?: string;
    files?: ActionButtonFile[];
    /** key of the answer holding the values (field name -> value); default the whole answer */
    result?: string;
    /** key of the answer holding a list of messages to show */
    warnings?: string;
    /** key of the answer: true = sample / test data */
    mock?: string;
    /** true = also replace fields that already have a different value (default: only empty fields are filled) */
    overwrite?: boolean;
    lookups?: ActionButtonLookup[];
}
