import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import PromptService from './service';
import { Prompt } from './interfaces';

async function promptsRoutes(
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & { service?: PromptService }
) {
  const service =
    opts.service ?? ((fastify as any).promptService as PromptService);

  fastify.get('/', async () => {
    return await service.findAll();
  });

  fastify.get('/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const item = await service.findById(id);
    if (!item) return reply.code(404).send({ message: 'Not found' });
    return item;
  });

  fastify.post('/', async (request, reply) => {
    const body = request.body as Partial<Prompt>;
    if (!body.title || !body.content)
      return reply
        .code(400)
        .send({ message: 'title and content are required' });
    const created = await service.create({
      title: body.title,
      content: body.content,
    });
    return reply.code(201).send(created);
  });

  fastify.put('/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const body = request.body as Partial<Prompt>;
    const updated = await service.update(id, {
      title: body.title,
      content: body.content,
    });
    if (!updated) return reply.code(404).send({ message: 'Not found' });
    return updated;
  });

  fastify.delete('/:id', async (request, reply) => {
    const id = Number((request.params as any).id);
    const ok = await service.delete(id);
    if (!ok) return reply.code(404).send({ message: 'Not found' });
    return { deleted: true };
  });
}

export default promptsRoutes;
