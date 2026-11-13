/** Row of /api/ai/history/sessions: one chat conversation. */
export class AiHistorySession {
  uuid: string;
  session_id: string;
  user_id: string;
  message_count: number;
  started_at: string;
}
