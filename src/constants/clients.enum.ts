import { AgentCard, Task } from "@a2a-js/sdk";

export interface IDecodedToken {
  user_id: string;
  roles: string[];
  iat: number;
  exp: number;
}

export type OstridAgentCard = AgentCard & {
  ostrid: {
    id: string;
    a2a_version: string;
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