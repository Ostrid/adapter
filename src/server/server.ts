import Fastify, { fastify, HookHandlerDoneFunction } from 'fastify';

import { FastifyRequest, FastifyReply } from 'fastify';
import { join } from 'path';

import routes from '../routes/index';
import config from '../config/index';

// plugins
import cors from '@fastify/cors';
import middie from '@fastify/middie';
import websocket from '@fastify/websocket';
import swagger_ui from '@fastify/swagger-ui';
import swagger from '@fastify/swagger';
import csrf from '@fastify/csrf-protection';
import auth from '@fastify/auth';
import cookies from '@fastify/cookie';
import caching from '@fastify/caching';
import rate_limiter from '@fastify/rate-limit';
import static_plugin from '@fastify/static';
import response from '@fastify/response-validation';
import env from '@fastify/env';
import formBody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import autoload from '@fastify/autoload';

import {
  ZodTypeProvider,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { decodeToken } from '../utils/jwt_tokens';

export default async (silent: boolean = false) => {
  try {
    const { host, port } = config.app;
    const { keys, prefix } = config.api;
    const { max, window } = config.ratelimiter;
    const _keys = new Set(keys);

    const baseApiUrl = '/' + prefix.replace('/', '');

    const app = fastify({
      ignoreDuplicateSlashes: true,
      ignoreTrailingSlash: true,
    });

    // Register plugins
    await Promise.all([
      app
        .register(csrf)
        .register(rate_limiter, {
          max: max,
          timeWindow: window,
        })
        .register(cors, { origin: '*' })
        .register(auth),
      app.register(cookies),
      app.register(caching),
      app.register(middie),
      app.register(websocket),
      app.register(swagger, {
        prefix: '/docs',
        swagger: {
          info: {
            title: 'API Docs',
            description: 'API Documentation',
            version: '1.0.0',
          },
        },
        transform: jsonSchemaTransform,
      }),
      app.register(swagger_ui, { routePrefix: '/swagger-ui' }),
      app.register(static_plugin, { root: join(process.cwd(), 'public') }),
      app.register(response),
      app.register(env, {
        dotenv: true,
        schema: {
          type: 'object',
          required: [
            'PORT',
            'HOST_URL',
            'API_JSON_LIMIT',
            'API_KEYS',
            'RATE_LIMIT_MAX',
            'RATE_LIMIT_WINDOW',
          ],
          properties: {
            PORT: { type: 'string', default: '8910' },
            HOST_URL: { type: 'string' },
            API_VERSION: { type: 'string', default: 'v1.0.0' },
            API_JSON_LIMIT: { type: 'string' },
            API_KEYS: { type: 'string' },
            RATE_LIMIT_MAX: { type: 'number', default: 50 },
            RATE_LIMIT_WINDOW: { type: 'string', default: '1 minute' },
          },
        },
      }),
      app.register(formBody),
      app.register(helmet, { contentSecurityPolicy: false }),
      app.register(autoload, { dir: join(join(__dirname, '..'), 'plugins') }),
      app.setValidatorCompiler(validatorCompiler),
      app.setSerializerCompiler(serializerCompiler),
      app.withTypeProvider<ZodTypeProvider>().register(routes, { prefix }),
    ]);
    app.decorate(
      'allowAnonymous', // Hook grants route encapsulated in an authenticated context annonymity
      (req: FastifyRequest, _: FastifyReply, done: HookHandlerDoneFunction) => {
        if (req.headers.authorization) {
          return done(new Error('not anonymous'));
        }
        done();
      }
    );

    app.route({
      method: 'GET',
      url: '/',
      handler: (request, reply) => {
        reply.status(200).send({ message: 'Hello! You Have Reached Us.' });
      },
    });

    // Start server
    app.listen({ port, host }, (err, address) => {
      if (err) {
        console.error('An error occurred:', err.message);
        process.exit(1);
      }
      console.log(`Server listening on PORT: ${port}`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Rejection:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error('Error during server setup:', error);
    process.exit(1);
  }
};
