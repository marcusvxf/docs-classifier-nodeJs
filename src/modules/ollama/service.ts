import {
  OllamaServiceOptions,
  GenerateOptions,
  GenerateResult,
  ModelInfo,
} from './interfaces';

const DEFAULT_BASE = 'http://localhost:11434';
const DEFAULT_TIMEOUT = 30_000;

function timeoutFetch(
  input: string,
  init: RequestInit = {},
  timeout = DEFAULT_TIMEOUT
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const merged = { ...init, signal: controller.signal } as RequestInit;
  return fetch(input, merged).finally(() => clearTimeout(id));
}

export default class OllamaService {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  constructor(opts: OllamaServiceOptions = {}) {
    this.baseUrl = opts.baseUrl ?? DEFAULT_BASE;
    this.apiKey = opts.apiKey;
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;
  }

  private headers() {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  private async request(
    path: string,
    body?: any,
    method = 'POST'
  ): Promise<any> {
    const url = `${this.baseUrl.replace(/\/$/, '')}${path}`;
    const res = await timeoutFetch(
      url,
      {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      },
      this.timeoutMs
    );

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(
        `Ollama request failed ${res.status} ${res.statusText}: ${text}`
      );
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return res.text();
  }

  /** Generate text with a model. Returns a simple text result and optionally raw payload. */
  async generate(
    model: string,
    prompt: string | object,
    opts: GenerateOptions = {}
  ): Promise<GenerateResult> {
    const payload: any = {
      model,
      prompt,
      ...(opts.maxTokens ? { max_tokens: opts.maxTokens } : {}),
      ...(opts.temperature != null ? { temperature: opts.temperature } : {}),
      ...(opts.topK != null ? { top_k: opts.topK } : {}),
      ...(opts.topP != null ? { top_p: opts.topP } : {}),
    };

    const res = await this.request('/api/generate', payload, 'POST');

    // Try to extract text in a few common shapes, otherwise return raw
    let text = '';
    if (typeof res === 'string') text = res;
    else if (res?.text) text = res.text;
    else if (Array.isArray(res?.choices) && res.choices[0]?.text)
      text = res.choices[0].text;
    else if (res?.output) text = String(res.output);

    return opts.raw ? { text, raw: res } : { text };
  }

  /** List available models (best-effort). */
  async listModels(): Promise<string[]> {
    // Ollama may not expose a standard listing endpoint; attempt a best-effort call
    try {
      const res = await this.request('/api/models', undefined, 'GET');
      if (Array.isArray(res))
        return res.map((m: any) =>
          typeof m === 'string' ? m : m.name || String(m)
        );
      return [];
    } catch (err) {
      // Not supported or failed — return empty list
      return [];
    }
  }

  /** Get model info (best-effort) */
  async getModelInfo(name: string): Promise<ModelInfo | null> {
    try {
      const res = await this.request(
        `/api/models/${encodeURIComponent(name)}`,
        undefined,
        'GET'
      );
      return {
        name,
        description: res?.description ?? undefined,
        tags: res?.tags ?? undefined,
      };
    } catch (err) {
      return null;
    }
  }

  /** Simple health check */
  async ping(): Promise<boolean> {
    try {
      const res = await this.request('/api/ping', undefined, 'GET');
      if (typeof res === 'string') return res.length > 0;
      return true;
    } catch (err) {
      return false;
    }
  }
}
