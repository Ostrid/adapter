import * as fastify from 'fastify';
import * as http from 'http';
import { IDecodedToken } from './a2a.bindings';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    allowAnonymous?: any;
  }
  export interface FastifyRequest {
    user: IDecodedToken;
  }
}
