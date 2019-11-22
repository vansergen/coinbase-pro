import {
  PublicClient,
  PublicClientOptions,
  DefaultHeaders,
  PagArgs
} from "./public";
import { Signer } from "./signer";
import { ParsedUrlQuery } from "querystring";

export type AccountId = { account_id: string };

export type AccountHistoryParams = AccountId & PagArgs;

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
}
