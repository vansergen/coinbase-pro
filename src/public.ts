import { stringify } from "node:querystring";
import { RequestInit, Response, Headers } from "node-fetch";
import { FetchClient } from "rpc-request";

export const ApiUri = "https://api.exchange.coinbase.com";
export const SandboxApiUri = "https://api-public.sandbox.exchange.coinbase.com";
export const DefaultProductID = "BTC-USD";

export interface ProductID {
  product_id?: string;
}

export interface PagArgs {
  before?: number | string;
  after?: number | string;
  limit?: number | string;
}

export type PagProductID = ProductID & PagArgs;

export interface OrderBookArgs extends ProductID {
  level?: 1 | 2 | 3;
}

export interface HistoricRatesArgs {
  product_id?: string;
  start?: string;
  end?: string;
  granularity: 60 | 300 | 900 | 3600 | 21600 | 86400;
}

export interface ProductInfo {
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
  fx_stablecoin: boolean;
  max_slippage_percentage: string;
  post_only: boolean;
  limit_only: boolean;
  cancel_only: boolean;
  trading_disabled: boolean;
  status: string;
  status_message: string;
  auction_mode: boolean;
}

export interface OrderBookLevel1 {
  sequence: number;
  bids: [[string, string, number]];
  asks: [[string, string, number]];
}

export interface OrderBookLevel2 {
  sequence: number;
  bids: [string, string, number][];
  asks: [string, string, number][];
}

export interface OrderBookLevel3 {
  sequence: number;
  bids: [string, string, string][];
  asks: [string, string, string][];
}

export type OrderBook = OrderBookLevel1 | OrderBookLevel2 | OrderBookLevel3;

export interface Ticker {
  trade_id: number;
  price: string;
  size: string;
  time: string;
  bid: string;
  ask: string;
  volume: string;
}

export type Side = "buy" | "sell";

export interface Trade {
  time: string;
  trade_id: number;
  price: string;
  size: string;
  side: Side;
}

export type Candle = [number, number, number, number, number, number];

export interface ProductStats {
  open: string;
  high: string;
  low: string;
  volume: string;
  last: string;
  volume_30day: string;
}

export interface CurrencyDetails {
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
}

export interface CurrencyInfo {
  id: string;
  name: string;
  min_size: string;
  status: string;
  message: null | string;
  details: CurrencyDetails;
  max_precision: string;
  convertible_to?: string[];
}

export interface Time {
  iso: string;
  epoch: number;
}

export interface PublicClientOptions {
  product_id?: string;
  sandbox?: boolean;
  apiUri?: string;
}

export class PublicClient extends FetchClient<unknown> {
  readonly #product_id: string;
  readonly #api_url: URL;

  public constructor({
    product_id = DefaultProductID,
    sandbox = false,
    apiUri = sandbox ? SandboxApiUri : ApiUri,
  }: PublicClientOptions = {}) {
    super({}, { rejectNotOk: false, transform: "raw", baseUrl: apiUri });
    this.#api_url = new URL(apiUri);
    this.#product_id = product_id;
  }

  public get product_id(): string {
    return this.#product_id;
  }

  public get apiUri(): URL {
    return new URL(this.#api_url.toString());
  }

  public async fetch(
    path: string,
    options: RequestInit = {}
  ): Promise<unknown> {
    const headers = new Headers(options.headers);
    if (options.body) {
      headers.set("Content-Type", "application/json");
    }
    const response = (await super.fetch(path, {
      ...options,
      headers,
    })) as Response;
    const text = await response.text();
    const data = PublicClient.#parseJSON(text);

    if (!response.ok) {
      throw new Error((data as { message: string })?.message ?? text);
    }

    return data ?? text;
  }

  public getProducts(): Promise<ProductInfo[]> {
    return this.get("/products") as Promise<ProductInfo[]>;
  }

  public getProduct({
    product_id = this.product_id,
  }: ProductID = {}): Promise<ProductInfo> {
    return this.get(`/products/${product_id}`) as Promise<ProductInfo>;
  }

  public getOrderBook({
    product_id = this.product_id,
    ...qs
  }: OrderBookArgs = {}): Promise<OrderBook> {
    const url = new URL(`/products/${product_id}/book`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<OrderBook>;
  }

  public getTicker({
    product_id = this.product_id,
  }: ProductID = {}): Promise<Ticker> {
    return this.get(`/products/${product_id}/ticker`) as Promise<Ticker>;
  }

  public getTrades({
    product_id = this.product_id,
    ...qs
  }: PagProductID = {}): Promise<Trade[]> {
    const url = new URL(`/products/${product_id}/trades`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<Trade[]>;
  }

  public getHistoricRates({
    product_id = this.product_id,
    ...qs
  }: HistoricRatesArgs): Promise<Candle[]> {
    const url = new URL(`/products/${product_id}/candles`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<Candle[]>;
  }

  public get24hrStats({
    product_id = this.product_id,
  }: ProductID = {}): Promise<ProductStats> {
    return this.get(`/products/${product_id}/stats`) as Promise<ProductStats>;
  }

  public getCurrencies(): Promise<CurrencyInfo[]> {
    return this.get("/currencies") as Promise<CurrencyInfo[]>;
  }

  public getCurrency({ id }: { id: string }): Promise<CurrencyInfo> {
    return this.get(`/currencies/${id}`) as Promise<CurrencyInfo>;
  }

  public getTime(): Promise<Time> {
    return this.get("/time") as Promise<Time>;
  }

  static #parseJSON(string: string): unknown {
    let output: unknown;
    try {
      return JSON.parse(string);
    } catch {
      return output;
    }
  }
}
