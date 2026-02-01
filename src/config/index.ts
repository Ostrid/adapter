import * as dotenv from "dotenv";
import { IBaseConfig, IEnvConfig, IProcessEnv } from "./types";

dotenv.config();
const processEnv: IProcessEnv = process.env;
const nodeEnv: string = processEnv.NODE_ENV || "development";

const baseConfig: IBaseConfig = {
  nodeEnv,
  isTest: nodeEnv === "test",
  isDev: nodeEnv === "development",
  isStage: nodeEnv === "staging",
  isProd: nodeEnv === "production",
};
let envConfig: IEnvConfig;

switch (nodeEnv) {
  case "development":
    envConfig = {
      app: {
        host: processEnv.HOST_URL || "localhost",
        port: (processEnv.PORT && parseInt(processEnv.PORT, 10)) || 8910,
        url: processEnv.APP_URL || "http://localhost:8910",
      },
      api: {
        version: processEnv.API_VERSION || "v1.0.0",
        jsonLimit: processEnv.API_JSON_LIMIT || "5mb",
        extUrlencoded: processEnv.API_EXT_URLENCODED == "false" || true,
        prefix: processEnv.API_PREFIX || "api",
        keys: (processEnv.API_KEYS && processEnv.API_KEYS.split(",")) || [],
      },
      ratelimiter: {
        max:
          (processEnv.RATE_LIMIT_MAX &&
            parseInt(processEnv.RATE_LIMIT_MAX, 10)) ||
          30,
        window: processEnv.RATE_LIMIT_WINDOW || "1 minute",
      },
      bcrypt: {
        saltRounds:
          (processEnv.BCRYPT_SALT_ROUNDS &&
            parseInt(processEnv.BCRYPT_SALT_ROUNDS, 10)) ||
          10,
      },
      kafka: {
        url: processEnv.KAFKA_URL || "localhost",
        port: processEnv.kAFKA_PORT || "9092",
      },
    };
    break;

  default:
    envConfig = {
      app: {
        host: processEnv.HOST_URL || "localhost",
        port: (processEnv.PORT && parseInt(processEnv.PORT, 10)) || 8910,
        url: processEnv.APP_URL || "http://localhost:8910",
      },
      api: {
        version: processEnv.API_VERSION || "v2",
        jsonLimit: processEnv.API_JSON_LIMIT || "5mb",
        extUrlencoded: processEnv.API_EXT_URLENCODED == "false" || true,
        prefix: processEnv.API_PREFIX || "api",
        keys: (processEnv.API_KEYS && processEnv.API_KEYS.split(",")) || [],
      },
      ratelimiter: {
        max:
          (processEnv.RATE_LIMIT_MAX &&
            parseInt(processEnv.RATE_LIMIT_MAX, 10)) ||
          30,
        window: processEnv.RATE_LIMIT_WINDOW || "1 minute",
      },
      bcrypt: {
        saltRounds:
          (processEnv.BCRYPT_SALT_ROUNDS &&
            parseInt(processEnv.BCRYPT_SALT_ROUNDS, 10)) ||
          10,
      },
      kafka: {
        url: processEnv.KAFKA_URL || "localhost",
        port: processEnv.kAFKA_PORT || "9092",
      },
    };
}
const config = { ...baseConfig, ...envConfig };

export default config;
