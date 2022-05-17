import { stringify } from "node:querystring";
import {
  PublicClient,
  PublicClientOptions,
  PagArgs,
  ProductID,
  Side,
} from "./public.js";
import { Signer } from "./signer.js";

export interface AccountId {
  account_id: string;
}

export type AccountHistoryParams = AccountId & PagArgs;

export interface BaseOrder extends ProductID {
  stp?: "dc" | "co" | "cn" | "cb";
  client_oid?: string;
  side: Side;
}

export type MarketOrder = BaseOrder & {
  type: "market";
} & ({ size: number; funds?: number } | { size?: number; funds: number });

export interface LimitOrder extends BaseOrder {
  type: "limit";
  price: number;
  size: number;
  time_in_force?: "GTC" | "GTT" | "IOC" | "FOK";
  cancel_after?: "min" | "hour" | "day";
  post_only?: boolean;
  stop?: "loss" | "entry";
  stop_price?: number;
}

export type OrderParams = MarketOrder | LimitOrder;

export type CancelOrderParams = { client_oid: string } | { id: string };

export type GetOrdersParams = PagArgs &
  ProductID & { status?: string | string[] };

export type GetFillsParams = PagArgs & ProductID & { order_id?: string };

export interface DepositParams {
  amount: number;
  currency: string;
  payment_method_id: string;
}

export interface DepositCoinbaseParams {
  amount: number;
  currency: string;
  coinbase_account_id: string;
}

export interface WithdrawCryptoParams {
  amount: number;
  currency: string;
  crypto_address: string;
  destination_tag?: string | number;
  no_destination_tag?: boolean;
}

export interface FeeEstimateParams {
  currency: string;
  crypto_address: string;
}

export interface ConvertParams {
  from: string;
  to: string;
  amount: number;
}

export interface ReportParams {
  type: "fills" | "account";
  start_date: string;
  end_date: string;
  product_id?: string;
  account_id?: string;
  format?: "pdf" | "csv";
  email?: string;
}

export interface TransferParams {
  from: string;
  to: string;
  currency: string;
  amount: number;
}

export interface Account {
  id: string;
  currency: string;
  balance: string;
  available: string;
  hold: string;
  profile_id: string;
  trading_enabled: boolean;
}

export interface AccountHistory {
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
}

export interface AccountHold {
  created_at: string;
  updated_at?: string;
  id: string;
  amount: string;
  type: "order" | "transfer";
  ref: string;
}

export interface OrderInfo {
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
}

export interface Fill {
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
}

export interface DepositInfo {
  id: string;
  amount: string;
  currency: string;
  payout_at?: string;
}

export interface EstimatedFee {
  fee: number;
}

export interface Conversion {
  id: string;
  amount: string;
  from_account_id: string;
  to_account_id: string;
  from: string;
  to: string;
}

export interface PaymentMethodLimit {
  period_in_days: number;
  total: { amount: string; currency: string };
  remaining: { amount: string; currency: string };
  description?: string;
  label?: string;
  next_requirement?: null;
}

export interface PaymentMethod {
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
}

export interface CoinbaseAccount {
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
}

export interface Fees {
  maker_fee_rate: string;
  taker_fee_rate: string;
  usd_volume: string | null;
}

export interface BaseReportStatus {
  id: string;
  type: string;
  status: string;
}

export interface ReportStatus extends BaseReportStatus {
  expires_at: string;
  user_id: string;
  file_url: string | null;
  params: {
    start_date: string;
    end_date: string;
    format: string;
    account_id?: string;
    product_id?: string;
    profile_id: string;
    user?: {
      created_at: string;
      active_at: string;
      terms_accepted?: string;
      id: string;
      name: string;
      email: string;
      roles: null;
      is_banned: boolean;
      permissions: null;
      user_type: string;
      fulfills_new_requirements: boolean;
      flags: null | { onboarding_group: string };
      details: null;
      default_profile_id: string;
      oauth_client: string;
      preferences: {
        post_only_disabled?: boolean;
        preferred_market: string;
        market_fee_modal_skipped_at_in_utc: string;
        mobile_app_discoverability_modal_closed_at_in_utc?: string;
      };
      has_default: boolean;
    };
    new_york_state: boolean;
  };
  file_count?: null;
  created_at: string;
  completed_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  active: boolean;
  is_default: boolean;
  created_at: string;
}

export interface TrailingVolume {
  product_id: string;
  volume: string;
  exchange_volume: string;
  recorded_at: string;
}

export interface AuthenticatedClientOptions extends PublicClientOptions {
  key: string;
  secret: string;
  passphrase: string;
}

export class AuthenticatedClient extends PublicClient {
  readonly #key: string;
  readonly #secret: string;
  readonly #passphrase: string;

  public constructor({
    key,
    secret,
    passphrase,
    ...rest
  }: AuthenticatedClientOptions) {
    super(rest);
    this.#key = key;
    this.#secret = secret;
    this.#passphrase = passphrase;
  }

  public fetch(
    path: string,
    { method, body }: { method: string; body?: string }
  ): Promise<unknown> {
    const timestamp = Date.now() / 1000;
    const headers = Signer({
      timestamp,
      method,
      key: this.#key,
      secret: this.#secret,
      passphrase: this.#passphrase,
      body,
      url: new URL(path, this.apiUri),
    });
    return super.fetch(path, {
      method,
      headers: { ...headers },
      body,
    });
  }

  /** Get a list of trading accounts from the profile of the API key. */
  public getAccounts(): Promise<Account[]> {
    return this.get("/accounts") as Promise<Account[]>;
  }

  public getAccount({ account_id }: AccountId): Promise<Account> {
    return this.get(`/accounts/${account_id}`) as Promise<Account>;
  }

  /** List account activity of the API key’s profile. */
  public getAccountHistory({
    account_id,
    ...qs
  }: AccountHistoryParams): Promise<AccountHistory[]> {
    const url = new URL(`/accounts/${account_id}/ledger`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<AccountHistory[]>;
  }

  /** List holds of an account that belong to the same profile as the API key. */
  public getHolds({
    account_id,
    ...qs
  }: AccountHistoryParams): Promise<AccountHold[]> {
    const url = new URL(`/accounts/${account_id}/holds`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<AccountHold[]>;
  }

  public placeOrder({
    product_id = this.product_id,
    ...rest
  }: OrderParams): Promise<OrderInfo> {
    return this.post("/orders", {
      body: JSON.stringify({ product_id, ...rest }),
    }) as Promise<OrderInfo>;
  }

  public cancelOrder(params: CancelOrderParams): Promise<string> {
    return this.delete(
      "client_oid" in params
        ? `/orders/client:${params.client_oid}`
        : `/orders/${params.id}`
    ) as Promise<string>;
  }

  public cancelAll(qs: ProductID = {}): Promise<string[]> {
    const url = new URL(`/orders`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.delete(url.toString()) as Promise<string[]>;
  }

  public getOrders(qs: GetOrdersParams = {}): Promise<OrderInfo[]> {
    const url = new URL(`/orders`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<OrderInfo[]>;
  }

  public getOrder(params: CancelOrderParams): Promise<OrderInfo> {
    return this.get(
      "client_oid" in params
        ? `/orders/client:${params.client_oid}`
        : `/orders/${params.id}`
    ) as Promise<OrderInfo>;
  }

  public getFills(qs: GetFillsParams = {}): Promise<Fill[]> {
    if (!qs.order_id && !qs.product_id) {
      qs.product_id = this.product_id;
    }
    const url = new URL("/fills", this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<Fill[]>;
  }

  public deposit(params: DepositParams): Promise<DepositInfo> {
    return this.post("/deposits/payment-method", {
      body: JSON.stringify(params),
    }) as Promise<DepositInfo>;
  }

  public depositCoinbase(params: DepositCoinbaseParams): Promise<DepositInfo> {
    return this.post("/deposits/coinbase-account", {
      body: JSON.stringify(params),
    }) as Promise<DepositInfo>;
  }

  public withdraw(params: DepositParams): Promise<DepositInfo> {
    return this.post("/withdrawals/payment-method", {
      body: JSON.stringify(params),
    }) as Promise<DepositInfo>;
  }

  public withdrawCoinbase(params: DepositCoinbaseParams): Promise<DepositInfo> {
    return this.post("/withdrawals/coinbase-account", {
      body: JSON.stringify(params),
    }) as Promise<DepositInfo>;
  }

  public withdrawCrypto(params: WithdrawCryptoParams): Promise<DepositInfo> {
    return this.post("/withdrawals/crypto", {
      body: JSON.stringify(params),
    }) as Promise<DepositInfo>;
  }

  /** Get the network fee estimate when sending to the given address. */
  public feeEstimate(qs: FeeEstimateParams): Promise<EstimatedFee> {
    const url = new URL(`/withdrawals/fee-estimate`, this.apiUri);
    url.search = stringify({ ...qs });
    return this.get(url.toString()) as Promise<EstimatedFee>;
  }

  public convert(params: ConvertParams): Promise<Conversion> {
    return this.post("/conversions", {
      body: JSON.stringify(params),
    }) as Promise<Conversion>;
  }

  public getPaymentMethods(): Promise<PaymentMethod[]> {
    return this.get("/payment-methods") as Promise<PaymentMethod[]>;
  }

  public getCoinbaseAccounts(): Promise<CoinbaseAccount[]> {
    return this.get("/coinbase-accounts") as Promise<CoinbaseAccount[]>;
  }

  public getFees(): Promise<Fees> {
    return this.get("/fees") as Promise<Fees>;
  }

  public createReport(params: ReportParams): Promise<BaseReportStatus> {
    return new Promise<BaseReportStatus>((resolve, reject) => {
      if (params.type === "fills" && !params.product_id) {
        params.product_id = this.product_id;
      } else if (params.type === "account" && !params.account_id) {
        reject(new Error("`account_id` is missing"));
        return;
      }

      this.post("/reports", { body: JSON.stringify(params) })
        .then((data) => {
          resolve(data as BaseReportStatus);
        })
        .catch(reject);
    });
  }

  public getReport({ id }: { id: string }): Promise<ReportStatus> {
    return this.get(`/reports/${id}`) as Promise<ReportStatus>;
  }

  /** List your profiles. */
  public getProfiles(): Promise<Profile[]> {
    return this.get("/profiles") as Promise<Profile[]>;
  }

  /** Get a single profile by profile id. */
  public getProfile({ id }: { id: string }): Promise<Profile> {
    return this.get(`/profiles/${id}`) as Promise<Profile>;
  }

  /** Transfer funds from API key’s profile to another user owned profile. */
  public transfer(params: TransferParams): Promise<"OK"> {
    return this.post("/profiles/transfer", {
      body: JSON.stringify(params),
    }) as Promise<"OK">;
  }

  /** Get your 30-day trailing volume for all products of the API key’s profile. */
  public getTrailingVolume(): Promise<TrailingVolume[]> {
    return this.get("/users/self/trailing-volume") as Promise<TrailingVolume[]>;
  }
}
