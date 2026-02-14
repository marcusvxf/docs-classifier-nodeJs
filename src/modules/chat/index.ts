import { FastifyPluginAsync } from 'fastify';
import multipart from '@fastify/multipart';
import OllamaService from '../ollama/service';
import ChatService from './service';
import chatRoutes from './controller';

declare module 'fastify' {
  interface FastifyInstance {
    chatService?: ChatService;
  }
}

const chatModule: FastifyPluginAsync = async (fastify, _opts) => {
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10 MB
    },
  });

  const ollama = (fastify as any).ollama as OllamaService | undefined;
  if (!ollama) {
    throw new Error(
      'OllamaService not found. Register the ollama module before the chat module.'
    );
  }

  const chatService = new ChatService(ollama);
  fastify.decorate('chatService', chatService);

  // Register routes, pass service for easier testing
  await fastify.register(chatRoutes, { chatService });
};

export default chatModule;
