import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import OllamaService from './service';
import { OllamaServiceOptions } from './interfaces';

declare module 'fastify' {
  interface FastifyInstance {
    ollama?: OllamaService;
  }
}

const ollamaPlugin: FastifyPluginAsync<{
  opts?: OllamaServiceOptions;
}> = async (fastify, opts) => {
  const cfg = opts?.opts ?? {};
  const service = new OllamaService({
    baseUrl: cfg.baseUrl ?? process.env.OLLAMA_BASE_URL,
    apiKey: cfg.apiKey ?? process.env.OLLAMA_API_KEY,
    timeoutMs: cfg.timeoutMs,
  });

  fastify.decorate('ollama', service);
};

// Wrap with fastify-plugin so the decorator is visible to sibling/child contexts
const ollamaModule = fp(ollamaPlugin, { name: 'ollama-service' });

export default ollamaModule;
