export type ParameterType = 'string' | 'integer' | 'number' | 'boolean';

export type ParameterDraft = {
    name: string;
    type: ParameterType;
    description: string;
    required: boolean;
};
