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

export type GetFillsParams = PagArgs & ProductID & { order_id?: string };

export type DepositParams = {
  amount: number;
  currency: string;
  payment_method_id: string;
};

export type DepositCoinbaseParams = {
  amount: number;
  currency: string;
  coinbase_account_id: string;
};

export type WithdrawCryptoParams = {
  amount: number;
  currency: string;
  crypto_address: string;
  destination_tag?: string | number;
  no_destination_tag?: boolean;
};

export type ConvertParams = { from: string; to: string; amount: number };

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
  reject_reason?: string;
  stop?: "loss" | "entry";
  stop_price?: string;
  fill_fees: string;
  filled_size: string;
  executed_value: string;
  status: "pending" | "rejected" | "open" | "done" | "active";
  settled: boolean;
};

export type Fill = {
  created_at: string;
  trade_id: number;
  product_id: string;
  order_id: string;
  user_id: string;
  profile_id: string;
  liquidity: "T" | "M";
  price: string;
  size: string;
  fee: string;
  side: Side;
  settled: boolean;
  usd_volume?: string;
};

export type DepositInfo = {
  id: string;
  amount: string;
  currency: string;
  payout_at?: string;
};

export type Conversion = {
  id: string;
  amount: string;
  from_account_id: string;
  to_account_id: string;
  from: string;
  to: string;
};

export type PaymentMethodLimit = {
  period_in_days: number;
  total: { amount: string; currency: string };
  remaining: { amount: string; currency: string };
  description?: string;
  label?: string;
  next_requirement?: null;
};

export type PaymentMethod = {
  id: string;
  type: string;
  name: string;
  currency: string;
  primary_buy: boolean;
  primary_sell: boolean;
  instant_buy?: boolean;
  instant_sell?: boolean;
  created_at?: string;
  updated_at?: string;
  resource?: string;
  resource_path?: string;
  limits: {
    type?: string;
    name?: string;
    buy?: PaymentMethodLimit[];
    deposit?: PaymentMethodLimit[];
    sell?: PaymentMethodLimit[];
    instant_buy?: PaymentMethodLimit[];
  };
  fiat_account?: {
    id: string;
    resource: string;
  };
  allow_buy?: boolean;
  allow_sell?: boolean;
  allow_deposit?: boolean;
  allow_withdraw?: boolean;
  verified?: boolean;
  picker_data?: {
    symbol: string;
    customer_name: string;
    account_name: string;
    account_number: string;
    account_type: string;
    institution_code: string;
    institution_name: string;
  };
  hold_business_days?: number;
  hold_days?: number;
  verification_method?: string;
  cdv_status?: string;
};

export type CoinbaseAccount = {
  id: string;
  name: string;
  balance: string;
  currency: string;
  type: "wallet" | "fiat";
  wire_deposit_information?: {
    account_number: string | null;
    routing_number: string;
    bank_name: string;
    bank_address: string;
    bank_country: { code: string; name: string };
    account_name: string;
    account_address: string;
    reference: string;
  };
  swift_deposit_information?: null;
  destination_tag_name?: string;
  destination_tag_regex?: string;
  primary: boolean;
  active: boolean;
  sepa_deposit_information?: {
    iban: string;
    swift: string;
    bank_name: string;
    bank_address: string;
    bank_country_name: string;
    account_name: string;
    account_address: string;
    reference: string;
  };
  uk_deposit_information?: {
    sort_code: string;
    account_name: string;
    account_number: string;
    bank_name: string;
    reference: string;
  };
  hold_balance?: string;
  hold_currency?: string;
  available_on_consumer?: boolean;
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

  getFills(qs: GetFillsParams = {}): Promise<Fill[]> {
    if (!qs.order_id && !qs.product_id) {
      qs.product_id = this.product_id;
    }
    return this.get({ uri: "/fills", qs });
  }

  deposit(body: DepositParams): Promise<DepositInfo> {
    return this.post({ uri: "/deposits/payment-method", body });
  }

  depositCoinbase(body: DepositCoinbaseParams): Promise<DepositInfo> {
    return this.post({ uri: "/deposits/coinbase-account", body });
  }

  withdraw(body: DepositParams): Promise<DepositInfo> {
    return this.post({ uri: "/withdrawals/payment-method", body });
  }

  withdrawCoinbase(body: DepositCoinbaseParams): Promise<DepositInfo> {
    return this.post({ uri: "/withdrawals/coinbase-account", body });
  }

  withdrawCrypto(body: WithdrawCryptoParams): Promise<DepositInfo> {
    return this.post({ uri: "/withdrawals/crypto", body });
  }

  convert(body: ConvertParams): Promise<Conversion> {
    return this.post({ uri: "/conversions", body });
  }

  getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.get({ uri: "/payment-methods" });
  }

  getCoinbaseAccounts(): Promise<CoinbaseAccount[]> {
    return this.get({ uri: "/coinbase-accounts" });
  }
}
