import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import ChatService from './service';
import { ChatRequest } from './interfaces';

async function chatRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { chatService?: ChatService }
) {
  const chatService =
    opts.chatService ?? ((fastify as any).chatService as ChatService);

  /**
   * POST /chat
   * Body: { model?, message, history?, systemPrompt? }
   * Sends a message to the Ollama model and returns the reply + updated history.
   */
  fastify.post('/chat', async (request, reply) => {
    const body = request.body as ChatRequest;

    if (!body?.message) {
      return reply.code(400).send({ message: 'message is required' });
    }

    const result = await chatService.chat({
      model: body.model,
      message: body.message,
      history: body.history,
      systemPrompt: body.systemPrompt,
    });

    return result;
  });

  /**
   * POST /classify
   * Multipart: file (the document to classify) + optional fields model, instruction
   * Reads the file content and asks the Ollama model to classify it.
   */
  fastify.post('/classify', async (request, reply) => {
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({ message: 'file is required' });
    }

    const buffer = await data.toBuffer();
    const fileContent = buffer.toString('utf-8');
    const filename = data.filename;
    const mimeType = data.mimetype;

    // Read optional fields from the multipart body
    const fields = data.fields as Record<string, any>;
    const model = fields?.model?.value as string | undefined;
    const instruction = fields?.instruction?.value as string | undefined;

    const result = await chatService.classifyDocument(
      fileContent,
      filename,
      mimeType,
      model,
      instruction
    );

    return result;
  });
}

export default chatRoutes;
