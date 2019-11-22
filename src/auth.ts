import {
  PublicClient,
  PublicClientOptions,
  DefaultHeaders,
  PagArgs,
  ProductID,
  Side
} from "./public";
import { Signer } from "./signer";
import { ParsedUrlQuery } from "querystring";

export type AccountId = { account_id: string };

export type AccountHistoryParams = AccountId & PagArgs;

export type BaseOrder = ProductID & {
  stp?: "dc" | "co" | "cn" | "cb";
  client_oid?: string;
  side: Side;
};

export type MarketOrder = BaseOrder & {
  type: "market";
} & ({ size: number; funds?: number } | { size?: number; funds: number });

export type LimitOrder = BaseOrder & {
  type: "limit";
  price: number;
  size: number;
  time_in_force?: "GTC" | "GTT" | "IOC" | "FOK";
  cancel_after?: "min" | "hour" | "day";
  post_only?: boolean;
  stop?: "loss" | "entry";
  stop_price?: number;
};

export type OrderParams = MarketOrder | LimitOrder;

export type CancelOrderParams = {
  client_oid?: string;
  id?: string;
};

export type GetOrdersParams = PagArgs &
  ProductID & { status?: string | string[] };

export type Account = {
  id: string;
  currency: string;
  balance: string;
  available: string;
  hold: string;
  profile_id: string;
  trading_enabled: boolean;
};

export type AccountHistory = {
  created_at: string;
  id: string;
  amount: string;
  balance: string;
  type: "transfer" | "match" | "fee" | "conversion" | "rebate";
  details: {
    transfer_id?: string;
    transfer_type?: "deposit" | "withdraw";
    order_id?: string;
    trade_id?: string;
    product_id?: string;
    conversion_id?: string;
  };
};

export type AccountHold = {
  created_at: string;
  updated_at?: string;
  id: string;
  amount: string;
  type: "order" | "transfer";
  ref: string;
};

export type OrderInfo = {
  id: string;
  price?: string;
  size?: string;
  funds?: string;
  product_id: string;
  side: Side;
  stp?: "dc" | "co" | "cn" | "cb";
  type: "limit" | "market";
  time_in_force?: "GTC" | "GTT" | "IOC" | "FOK";
  post_only: boolean;
  created_at: string;
  done_at?: string;
  done_reason?: string;
  stop?: "loss" | "entry";
  stop_price?: string;
  fill_fees: string;
  filled_size: string;
  executed_value: string;
  status: "pending" | "rejected" | "open" | "done" | "active";
  settled: boolean;
};

export type AuthenticatedClientOptions = PublicClientOptions & {
  key: string;
  secret: string;
  passphrase: string;
};

export class AuthenticatedClient extends PublicClient {
  readonly key: string;
  readonly secret: string;
  readonly passphrase: string;

  constructor({
    key,
    secret,
    passphrase,
    ...rest
  }: AuthenticatedClientOptions) {
    super(rest);
    this.key = key;
    this.secret = secret;
    this.passphrase = passphrase;
  }

  request({
    body = {},
    method,
    uri,
    qs
  }: {
    body?: object;
    method: string;
    uri: string;
    qs?: ParsedUrlQuery;
  }): Promise<any> {
    const signature = Signer({
      method,
      key: this.key,
      secret: this.secret,
      passphrase: this.passphrase,
      body,
      uri,
      qs
    });
    const headers = { ...DefaultHeaders, ...signature };
    return super.request({ qs, body, method, uri, headers });
  }

  getAccounts(): Promise<Account[]> {
    return this.get({ uri: "/accounts" });
  }

  getAccount({ account_id }: AccountId): Promise<Account> {
    return this.get({ uri: "/accounts/" + account_id });
  }

  getAccountHistory({
    account_id,
    ...qs
  }: AccountHistoryParams): Promise<AccountHistory[]> {
    return this.get({ uri: "/accounts/" + account_id + "/ledger", qs });
  }

  getHolds({
    account_id,
    ...qs
  }: AccountHistoryParams): Promise<AccountHold[]> {
    return this.get({ uri: "/accounts/" + account_id + "/holds", qs });
  }

  placeOrder(body: OrderParams): Promise<OrderInfo> {
    return this.post({ uri: "/orders", body });
  }

  cancelOrder({ client_oid, id }: CancelOrderParams): Promise<string> {
    if (client_oid) {
      return this.delete({ uri: "/orders/client:" + client_oid });
    } else if (id) {
      return this.delete({ uri: "/orders/" + id });
    } else {
      throw new Error("Either `id` or `client_oid` must be provided");
    }
  }

  cancelAll(qs: ProductID = {}): Promise<string[]> {
    return this.delete({ uri: "/orders", qs });
  }

  getOrders(qs: GetOrdersParams = {}): Promise<OrderInfo[]> {
    return this.get({ uri: "/orders", qs });
  }

  getOrder({ client_oid, id }: CancelOrderParams): Promise<OrderInfo> {
    if (client_oid) {
      return this.get({ uri: "/orders/client:" + client_oid });
    } else if (id) {
      return this.get({ uri: "/orders/" + id });
    } else {
      throw new Error("Either `id` or `client_oid` must be provided");
    }
  }
}
