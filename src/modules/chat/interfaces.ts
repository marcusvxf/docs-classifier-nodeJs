export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  model: string;
  message: string;
  /** Optional conversation history for multi-turn chat */
  history?: ChatMessage[];
  /** Optional system prompt to guide the assistant behavior */
  systemPrompt?: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  history: ChatMessage[];
}

export interface ClassifyRequest {
  /** Model to use for classification */
  model?: string;
  /** Optional extra instruction for classification */
  instruction?: string;
}

export interface ClassifyResponse {
  filename: string;
  mimeType: string;
  classification: string;
  model: string;
}
