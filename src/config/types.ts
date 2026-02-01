export interface IProcessEnv {
  [key: string]: string | undefined;
}
export interface IBaseConfig {
  nodeEnv: string;
  isTest: boolean;
  isDev: boolean;
  isStage: boolean;
  isProd: boolean;
}

interface IApp {
  host: string;
  port: number;
  url:string;
}

interface IApi {
  prefix: string;
  version: string;
  jsonLimit: string;
  extUrlencoded: boolean;
  keys: string[];
}

interface IRatelimiter {
  max: number;
  window: string;
}

interface IJwt {
  secretUser: string;
  secretAdmin: string;
  secretApp: string;
  expiredIn: string;
}

interface ICors {
  allowOrigin: string;
}

interface IBcrypt {
  saltRounds: number;
}
interface IKafka {
  url: string;
  port: string;
}

export interface IEnvConfig {
  app: IApp;
  // ssl: ISsl;
  api: IApi;
  ratelimiter: IRatelimiter;
  //   jwt: IJwt;
  //   cors: ICors;
  kafka: IKafka;
  bcrypt: IBcrypt;
  // debug: IDebug;
}
