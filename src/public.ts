import { RPC } from "rpc-request";

export const ApiUri = "https://api.pro.coinbase.com";
export const SandboxApiUri = "https://api-public.sandbox.pro.coinbase.com";
export const DefaultProductID = "BTC-USD";
export const DefaultTimeout = 30000;
export const DefaultHeaders = {
  "User-Agent": "coinbase-pro-node-api-client"
};

export type ProductID = {
  product_id?: string;
};

export type OrderBookArgs = ProductID & { level?: 1 | 2 | 3 };

export type ProductInfo = {
  id: string;
  base_currency: string;
  quote_currency: string;
  base_min_size: string;
  base_max_size: string;
  base_increment: string;
  quote_increment: string;
  display_name: string;
  min_market_funds: string;
  max_market_funds: string;
  margin_enabled: boolean;
  post_only: boolean;
  limit_only: boolean;
  cancel_only: boolean;
  status: string;
  status_message: string;
};

export type OrderBookLevel1 = {
  sequence: number;
  bids: [[string, string, number]];
  asks: [[string, string, number]];
};

export type OrderBookLevel2 = {
  sequence: number;
  bids: [string, string, number][];
  asks: [string, string, number][];
};

export type OrderBookLevel3 = {
  sequence: number;
  bids: [string, string, string][];
  asks: [string, string, string][];
};

export type OrderBook = OrderBookLevel1 | OrderBookLevel2 | OrderBookLevel3;

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

  getProducts(): Promise<ProductInfo[]> {
    return this.get({ uri: "/products" });
  }

  getOrderBook({
    product_id = this.product_id,
    ...qs
  }: OrderBookArgs = {}): Promise<OrderBook> {
    return this.get({ uri: "/products/" + product_id + "/book", qs });
  }
}
