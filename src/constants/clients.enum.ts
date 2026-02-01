import { AgentCard, Task } from "@a2a-js/sdk";

export interface IDecodedToken {
  user_id: string;
  roles: string[];
  iat: number;
  exp: number;
}

export type OstridAgentCard = AgentCard & {
   ostrid: {
    version: string;
    protocolOverview?: string;
    baseApiUrl?: string;
    endpoints?: {
      name: string;
      url: string;
      description?: string;
      method?: string;
      x402?: {
        fee: string;
        currency: string;
      };
    }[];
    negotiationModes?: {
      mode?: string;
      description?: string;
      supportedDimensions?: any;
      decayMechanism?: any;
      latencyEstimate?: string;
      useCases?: string;
    }[];
    settlement?: {
      token?: string;
      chain?: string;
      micropayments?: string;
      mandates?: string;
      escrowMechanism?: string;
    };
    validation?: {
      default: string;
      options?: any;
      disputeFallback?: string;
    };
    documentation?: string;
  };
};

export type TaskJob = Task & 
{
  ostrid:{
    id: string;
    budget:string;   // USDC amount in bigint string format
    quality?:number; // 0 to 1
  }
}