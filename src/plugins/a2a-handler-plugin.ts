import { AGENT_CARD_PATH } from "@a2a-js/sdk"; // Default: '.well-known/agent-card.json'
import { DefaultRequestHandler, InMemoryTaskStore } from "@a2a-js/sdk/server";
import { FastifyInstance } from "fastify";
import { OstridAdapterAgentCard } from "src/constants/ostrid.adapter.card";
import AdapterExecutor from "src/services/a2a/adapter.executor";
import {
  agentCardHandler,
  jsonRpcHandler,
  restHandler,
  UserBuilder,
} from "@a2a-js/sdk/server/express";
import express from "@fastify/express";

export default async (fastify: FastifyInstance) => {
  const agentExecutor = new AdapterExecutor();
  const requestHandler = new DefaultRequestHandler(
    OstridAdapterAgentCard,
    new InMemoryTaskStore(),
    agentExecutor,
  );
  fastify.register(express).after(() => {
    fastify
      .use(
        `/${AGENT_CARD_PATH}`,
        agentCardHandler({ agentCardProvider: requestHandler }),
      )
      .use(
        "/a2a/jsonrpc",
        jsonRpcHandler({
          requestHandler,
          userBuilder: UserBuilder.noAuthentication,
        }),
      )
      .use(
        "/a2a/rest",
        restHandler({
          requestHandler,
          userBuilder: UserBuilder.noAuthentication,
        }),
      );
  });
  
  // register routes for A2A
  fastify
    .get(`/${AGENT_CARD_PATH}`, async (req, reply) => {})
    .all("/a2a/jsonrpc", async (req, reply) => {})
    .all("/a2a/rest", async (req, reply) => {});

  fastify.log.info("A2A Handler plugin registered");
};
