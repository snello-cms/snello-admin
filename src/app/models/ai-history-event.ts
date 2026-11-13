/** Row of /api/ai/history: one step of a conversation (request, response, tool call, error, feedback...). */
export class AiHistoryEvent {
  uuid: string;
  occurred_at: string;
  channel: string;
  user_id: string;
  username: string;
  /** login | logout | request | response | error | feedback | tool */
  type: string;
  body: string;
  session_id: string;
  /** quick | pro */
  model: string;
}
