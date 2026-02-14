import Fastify from 'fastify';
import postgres from '@fastify/postgres';
import pino from 'pino';
import promptsModule from './modules/prompts';
import ollamaModule from './modules/ollama';
import chatModule from './modules/chat';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

async function build() {
  const fastify = Fastify({ logger });

  // register postgres plugin (reads DATABASE_URL from env)
  await fastify.register(postgres, {
    connectionString:
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres@localhost:5432/postgres',
  });

  // register ollama service (must come before chat)
  await fastify.register(ollamaModule);

  // register modules
  await fastify.register(promptsModule, { prefix: '/prompts' });
  await fastify.register(chatModule, { prefix: '/ai' });

  return fastify;
}

if (require.main === module) {
  (async () => {
    const app = await build();
    const port = Number(process.env.PORT) || 3000;
    app
      .listen({ port, host: '0.0.0.0' })
      .then(() => {
        app.log.info(`Server listening on ${port}`);
      })
      .catch((err) => {
        app.log.error(err);
        process.exit(1);
      });
  })();
}

export default build;
