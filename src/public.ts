import { RPC } from "rpc-request";

export const ApiUri = "https://api.pro.coinbase.com";
export const SandboxApiUri = "https://api-public.sandbox.pro.coinbase.com";
export const DefaultProductID = "BTC-USD";
export const DefaultTimeout = 30000;
export const DefaultHeaders = {
  "User-Agent": "coinbase-pro-node-api-client"
};

export type PublicClientOptions = {
  product_id?: string;
  sandbox?: boolean;
  apiUri?: string;
  timeout?: number;
};

export class PublicClient extends RPC {
  readonly product_id: string;

  constructor({
    product_id = DefaultProductID,
    sandbox = false,
    apiUri = sandbox ? SandboxApiUri : ApiUri,
    timeout = DefaultTimeout
  }: PublicClientOptions = {}) {
    const useQuerystring = true;
    const headers = DefaultHeaders;
    super({ useQuerystring, timeout, json: true, baseUrl: apiUri, headers });
    this.product_id = product_id;
  }
}
