import OllamaService from '../ollama/service';
import {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ClassifyResponse,
} from './interfaces';

const DEFAULT_MODEL = 'llama3';

const DEFAULT_CLASSIFY_INSTRUCTION =
  'Classify the following document. Return a short category label and a one-sentence explanation. Respond in JSON format: { "category": "...", "explanation": "..." }';

export default class ChatService {
  private readonly ollama: OllamaService;

  constructor(ollama: OllamaService) {
    this.ollama = ollama;
  }

  /**
   * Send a message to the model, optionally with conversation history.
   * Returns the assistant reply and the updated history.
   */
  async chat(req: ChatRequest): Promise<ChatResponse> {
    const model = req.model || DEFAULT_MODEL;

    // Build the full prompt from history + new message
    const history: ChatMessage[] = req.history ? [...req.history] : [];

    // Prepend system prompt if provided and not already in history
    if (req.systemPrompt && !history.some((m) => m.role === 'system')) {
      history.unshift({ role: 'system', content: req.systemPrompt });
    }

    // Append the user message
    history.push({ role: 'user', content: req.message });

    const prompt = this.buildPrompt(history);

    const result = await this.ollama.generate(model, prompt, { raw: true });

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: result.text,
    };

    history.push(assistantMessage);

    return {
      reply: result.text,
      model,
      history,
    };
  }

  /**
   * Classify a document (text content extracted from uploaded file).
   * Returns the classification result.
   */
  async classifyDocument(
    fileContent: string,
    filename: string,
    mimeType: string,
    model?: string,
    instruction?: string
  ): Promise<ClassifyResponse> {
    const usedModel = model || DEFAULT_MODEL;
    const classifyInstruction = instruction || DEFAULT_CLASSIFY_INSTRUCTION;

    const prompt = [
      classifyInstruction,
      '',
      `Filename: ${filename}`,
      `MIME type: ${mimeType}`,
      '',
      '--- DOCUMENT CONTENT ---',
      fileContent,
      '--- END OF DOCUMENT ---',
    ].join('\n');

    const result = await this.ollama.generate(usedModel, prompt, { raw: true });

    return {
      filename,
      mimeType,
      classification: result.text,
      model: usedModel,
    };
  }

  /** Build a plain-text prompt from a list of ChatMessages */
  private buildPrompt(messages: ChatMessage[]): string {
    return messages
      .map((m) => {
        switch (m.role) {
          case 'system':
            return `System: ${m.content}`;
          case 'user':
            return `User: ${m.content}`;
          case 'assistant':
            return `Assistant: ${m.content}`;
          default:
            return m.content;
        }
      })
      .join('\n');
  }
}
