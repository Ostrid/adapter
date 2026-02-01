import { OstridAgentCard } from "./clients.enum";
import config from "../config";
import { AgentCapabilities, AgentSkill } from "@a2a-js/sdk";

const AdapterSkills: AgentSkill[] = [];

const AdapterCapabilities: AgentCapabilities = {
  pushNotifications: true, // Ostrid adapter supports async task updates via push
  streaming: true, // Supports SSE for real-time negotiation/observer updates
  stateTransitionHistory: true, // Can provide task lifecycle history

  extensions: [
    {
      uri: "ostrid-negotiation",
      description:
        "Ostrid-specific extension for triggering solver matching or multi-dimensional Dutch auctions. " +
        "Includes mode selection (solver/auction), weighted dimensions, and bid/attestation flows.",
      required: true, // Clients must understand this to interact with Ostrid workflows
      params: {
        modes: ["solver", "auction"],
        dimensions: [
          "price",
          "quality",
          "time",
          "compute",
          "accuracy",
          "error_margin",
        ],
        defaultMode: "solver",
      },
    },
    {
      uri: "a2a-x402",
      description:
        "Support for x402 micropayments (HTTP 402 Payment Required) for bid fees, " +
        "solver rewards, and optional task initiation costs. Uses USDC on Sui.",
      required: false,
      params: {
        supportedChains: ["sui"],
        primaryToken: "USDC",
        typicalFeeRange: "0.00005 – 0.0005 USDC",
      },
    },
    {
      uri: "ap2-mandates",
      description:
        "Integration with AP2 protocol for cryptographically signed intents, " +
        "mandates, and attestations — ensures verifiable authorization and auditability.",
      required: true,
      params: {
        mandateVersion: "1.0",
        supportedActions: [
          "task-initiation",
          "negotiation-accept",
          "completion-attest",
        ],
      },
    },
    {
      uri: "a2a-rest",
      description:
        "RESTful fallback interface for simpler HTTP+JSON interactions " +
        "(complements the primary JSON-RPC channel).",
      required: false,
      params: {
        basePath: "/a2a/rest",
        supportedMethods: ["POST", "GET"],
      },
    },
  ],
};

export const OstridAdapterAgentCard: OstridAgentCard = {
  name: "Ostrid Adapter Agent",
  protocolVersion: "0.3.0",
  version: "0.1.0-mvp",
  defaultInputModes: ["jsonrpc", "rest"],
  defaultOutputModes: ["jsonrpc", "rest", "sse"],
  skills: AdapterSkills,
  description:
    "Official A2A entry-point adapter for the Ostrid protocol. " +
    "Enables autonomous AI agents to raise task-jobs, discover specialists, " +
    "negotiate terms (solvers & multi-dimensional Dutch auctions), lock escrows, " +
    "execute tasks peer-to-peer, validate outcomes, and settle payments — " +
    "all orchestrated on the Sui blockchain with USDC and AP2/x402 integration.",

  url: `${config.app.url || "http://localhost:8910"}/a2a/jsonrpc`, // ← update to your actual production / staging URL
  capabilities: AdapterCapabilities,
  ostrid: {
    version: "0.1.0-mvp",

    protocolOverview:
      "Ostrid is an open protocol and Sui-based platform for fully autonomous " +
      "agent-to-agent negotiations and settlements in a machine economy. " +
      "It combines A2A for communication & discovery, AP2 for verifiable intents, " +
      "x402 for micropayments, and Sui smart contracts for escrows & finality.",

    baseApiUrl: config.app.url || "http://localhost:8910",

    endpoints: [
      {
        name: "raise-task-job",
        url: "/ostrid/task-job",
        description:
          "Raise a new task-job intent (broadcast via A2A + register on Sui)",
        method: "POST",
        x402: {
          fee: "0.0001",
          currency: "USDC",
        },
      },
      {
        name: "discovery",
        url: "/ostrid/discovery",
        description: "Query candidate specialists and express interest",
        method: "POST",
      },
      {
        name: "negotiation",
        url: "/ostrid/negotiation",
        description: "Trigger solver matching or Dutch auction",
        method: "POST",
        x402: {
          fee: "0.00005", // per bid submission in auction mode
          currency: "USDC",
        },
      },
      {
        name: "confirm-escrow",
        url: "/ostrid/escrow/confirm",
        description: "Client confirms USDC escrow lock after match",
        method: "POST",
      },
      {
        name: "attest-completion",
        url: "/ostrid/validation/attest",
        description: "Submit client attestation (default validation method)",
        method: "POST",
      },
      {
        name: "observer-events",
        url: "/ostrid/observer/events",
        description:
          "WebSocket or polling endpoint for real-time task & negotiation events",
        method: "GET / WS",
      },
    ],

    negotiationModes: [
      {
        mode: "solver",
        description:
          "Fast, non-competitive direct matching using weighted multi-dimensional optimization",
        supportedDimensions: [
          "price",
          "quality",
          "time",
          "compute",
          "accuracy",
        ],
        latencyEstimate: "<1s",
        useCases:
          "routine delegations, low-contention tasks, predictable workloads",
      },
      {
        mode: "auction",
        description:
          "Competitive multi-dimensional Dutch auction with time-based parameter decay",
        supportedDimensions: [
          "price",
          "quality",
          "time",
          "error_margin",
          "resources",
        ],
        decayMechanism:
          "Linear decay on constraints (e.g. price_max -= rate × seconds, quality_min += rate × seconds)",
        latencyEstimate: "1–5s",
        useCases:
          "high-value tasks, resource-scarce environments, price discovery needed",
      },
    ],

    settlement: {
      token: "USDC",
      chain: "Sui",
      micropayments:
        "x402 (HTTP 402 Payment Required) for bid fees & solver rewards",
      mandates: "AP2 cryptographically signed intents & attestations",
      escrowMechanism:
        "Sui Move smart contracts – conditional release on valid attestation or oracle proof",
    },

    validation: {
      default: "client_attestation",
      options: ["client_attestation", "oracle", "zk_proof"],
      disputeFallback:
        "On-chain arbitration (DAO-voted post-MVP); timeout → escrow revert",
    },

    documentation: "https://docs.ostrid.network/agent-adapter",
  },
};
