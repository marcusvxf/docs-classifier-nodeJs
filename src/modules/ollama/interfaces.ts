export interface OllamaServiceOptions {
  /** Base URL of the Ollama server (ex: http://localhost:11434) */
  baseUrl?: string;
  /** Optional API key / token to be sent as Authorization Bearer */
  apiKey?: string;
  /** Default request timeout in milliseconds */
  timeoutMs?: number;
}

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
  /** If true, return raw JSON from the provider */
  raw?: boolean;
}

export interface GenerateResult {
  /** Human-friendly text output (if available) */
  text: string;
  /** Full raw response from the provider when raw=true or available */
  raw?: any;
}

export interface ModelInfo {
  name: string;
  description?: string;
  tags?: string[];
}

export default OllamaServiceOptions;
