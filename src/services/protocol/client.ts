import { SuiGrpcClient } from "@mysten/sui/grpc";
import config from "../../config";

const client = new SuiGrpcClient({
  baseUrl: config.sui.rpcUrl,
  network: config.sui.network,
});
export default client;
