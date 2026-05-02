import {FieldDefinition} from './field-definition';

export type WizardStep = 1 | 2 | 3;

export interface WizardField extends FieldDefinition {
    wizardId: string;
    fieldType: string;
    isSlugField?: boolean;
    isUsernameField?: boolean;
}
