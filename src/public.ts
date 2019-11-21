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

export type PagArgs = {
  before?: number | string;
  after?: number | string;
  limit?: number | string;
};

export type PagProductID = ProductID & PagArgs;

export type OrderBookArgs = ProductID & { level?: 1 | 2 | 3 };

export type HistoricRatesArgs = {
  product_id?: string;
  start?: string;
  end?: string;
  granularity: 60 | 300 | 900 | 3600 | 21600 | 86400;
};

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

export type Ticker = {
  trade_id: number;
  price: string;
  size: string;
  time: string;
  bid: string;
  ask: string;
  volume: string;
};

export type Side = "buy" | "sell";

export type Trade = {
  time: string;
  trade_id: number;
  price: string;
  size: string;
  side: Side;
};

export type Candle = [number, number, number, number, number, number];

export type ProductStats = {
  open: string;
  high: string;
  low: string;
  volume: string;
  last: string;
  volume_30day: string;
};

export type CurrencyDetails = {
  type: string;
  symbol?: string;
  sort_order: number;
  push_payment_methods: string[];
  processing_time_seconds?: number;
  min_withdrawal_amount?: number;
  network_confirmations?: number;
  group_types?: string[];
  crypto_address_link?: string;
  crypto_transaction_link?: string;
  display_name?: string;
};

export type CurrencyInfo = {
  id: string;
  name: string;
  min_size: string;
  status: string;
  message: null | string;
  details: CurrencyDetails;
  max_precision: string;
  convertible_to?: string[];
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

  getProducts(): Promise<ProductInfo[]> {
    return this.get({ uri: "/products" });
  }

  getOrderBook({
    product_id = this.product_id,
    ...qs
  }: OrderBookArgs = {}): Promise<OrderBook> {
    return this.get({ uri: "/products/" + product_id + "/book", qs });
  }

  getTicker({ product_id = this.product_id }: ProductID = {}): Promise<Ticker> {
    return this.get({ uri: "/products/" + product_id + "/ticker" });
  }

  getTrades({
    product_id = this.product_id,
    ...qs
  }: PagProductID = {}): Promise<Trade[]> {
    return this.get({ uri: "/products/" + product_id + "/trades", qs });
  }

  getHistoricRates({
    product_id = this.product_id,
    ...qs
  }: HistoricRatesArgs): Promise<Candle[]> {
    return this.get({ uri: "/products/" + product_id + "/candles", qs });
  }

  get24hrStats({ product_id = this.product_id }: ProductID = {}): Promise<
    ProductStats
  > {
    return this.get({ uri: "/products/" + product_id + "/stats" });
  }

  getCurrencies(): Promise<CurrencyInfo[]> {
    return this.get({ uri: "/currencies" });
  }
}
