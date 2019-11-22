import { PublicClient, PublicClientOptions, DefaultHeaders } from "./public";
import { Signer } from "./signer";
import { ParsedUrlQuery } from "querystring";

export type AccountId = { account_id: string };

export type Account = {
  id: string;
  currency: string;
  balance: string;
  available: string;
  hold: string;
  profile_id: string;
  trading_enabled: boolean;
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
}
