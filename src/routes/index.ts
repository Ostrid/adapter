import { FastifyInstance } from "fastify";
import client from "./client";

export default async (fastify: FastifyInstance) => {
  fastify.register(client);
};
