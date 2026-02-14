import { FastifyPluginAsync } from 'fastify';
import promptsRoutes from './controller';
import PromptService from './service';

const promptsModule: FastifyPluginAsync = async (fastify, opts) => {
  // create service from fastify-postgres pool
  const pool = (fastify as any).pg?.pool;
  if (!pool) throw new Error('Postgres plugin not registered');

  const service = new PromptService(pool);

  // decorate for potential reuse
  fastify.decorate('promptService', service);

  // register routes; pass service in opts for easier testing
  await fastify.register(promptsRoutes as any, { service });
};

export default promptsModule;
