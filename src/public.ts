import { FetchClient } from "rpc-request";
import { RequestInit, Response, Headers } from "node-fetch";
import { stringify } from "querystring";

export const ApiUri = "https://api.pro.coinbase.com";
export const SandboxApiUri = "https://api-public.sandbox.pro.coinbase.com";
export const DefaultProductID = "BTC-USD";
export const DefaultHeaders = { "User-Agent": "coinbase-pro-node-api" };

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
  post_only: boolean;
  limit_only: boolean;
  cancel_only: boolean;
  trading_disabled: boolean;
  status: string;
  status_message: string;
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
  public readonly product_id: string;
  public readonly apiUri: URL;

  public constructor({
    product_id = DefaultProductID,
    sandbox = false,
    apiUri = sandbox ? SandboxApiUri : ApiUri,
  }: PublicClientOptions = {}) {
    super(
      { headers: DefaultHeaders },
      { rejectNotOk: false, transform: "raw", baseUrl: apiUri }
    );
    this.apiUri = new URL(apiUri);
    this.product_id = product_id;
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

  public async getProducts(): Promise<ProductInfo[]> {
    const products = (await this.get("/products")) as ProductInfo[];
    return products;
  }

  public async getProduct({
    product_id = this.product_id,
  }: ProductID = {}): Promise<ProductInfo> {
    const product = (await this.get(`/products/${product_id}`)) as ProductInfo;
    return product;
  }

  public async getOrderBook({
    product_id = this.product_id,
    ...qs
  }: OrderBookArgs = {}): Promise<OrderBook> {
    const url = new URL(`/products/${product_id}/book`, this.apiUri);
    url.search = stringify({ ...qs });
    const book = (await this.get(url.toString())) as OrderBook;
    return book;
  }

  public async getTicker({
    product_id = this.product_id,
  }: ProductID = {}): Promise<Ticker> {
    const ticker = (await this.get(`/products/${product_id}/ticker`)) as Ticker;
    return ticker;
  }

  public async getTrades({
    product_id = this.product_id,
    ...qs
  }: PagProductID = {}): Promise<Trade[]> {
    const url = new URL(`/products/${product_id}/trades`, this.apiUri);
    url.search = stringify({ ...qs });
    const trades = (await this.get(url.toString())) as Trade[];
    return trades;
  }

  public async getHistoricRates({
    product_id = this.product_id,
    ...qs
  }: HistoricRatesArgs): Promise<Candle[]> {
    const url = new URL(`/products/${product_id}/candles`, this.apiUri);
    url.search = stringify({ ...qs });
    const rates = (await this.get(url.toString())) as Candle[];
    return rates;
  }

  public async get24hrStats({
    product_id = this.product_id,
  }: ProductID = {}): Promise<ProductStats> {
    const path = `/products/${product_id}/stats`;
    const stats = (await this.get(path)) as ProductStats;
    return stats;
  }

  public async getCurrencies(): Promise<CurrencyInfo[]> {
    const currencies = (await this.get("/currencies")) as CurrencyInfo[];
    return currencies;
  }

  public async getCurrency({ id }: { id: string }): Promise<CurrencyInfo> {
    const currency = (await this.get(`/currencies/${id}`)) as CurrencyInfo;
    return currency;
  }

  public async getTime(): Promise<Time> {
    const time = (await this.get("/time")) as Time;
    return time;
  }

  static #parseJSON(string: string): unknown {
    let output: unknown;
    try {
      output = JSON.parse(string);
      return output;
    } catch {
      return output;
    }
  }
}
