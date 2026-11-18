/** A workflow loaded by the Quarkus Flow runner (GET /api/flow/definitions). */
export interface FlowDefinition {
    namespace: string;
    name: string;
    version: string;
    title?: string;
    summary?: string;
}
