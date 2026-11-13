/** Row of /api/ai/cards: how the chat renders a tool result whose result_type matches. */
export class AiUiCard {
  uuid: string;
  project_uuid: string;
  name: string;
  result_type: string;
  template: string;
  enabled = true;
}
