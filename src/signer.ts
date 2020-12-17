import { createHmac } from "crypto";
import { stringify, ParsedUrlQuery } from "querystring";

export type SignerOptions = {
  method: string;
  uri: string;
  body?: object | "";
  key: string;
  secret: string;
  passphrase: string;
  timestamp?: number;
  qs?: ParsedUrlQuery;
};

export type SignedHeaders = {
  "CB-ACCESS-KEY": string;
  "CB-ACCESS-SIGN": string;
  "CB-ACCESS-TIMESTAMP": number;
  "CB-ACCESS-PASSPHRASE": string;
};

export function Signer({
  method,
  uri,
  body = {},
  key,
  secret,
  passphrase,
  timestamp = Date.now() / 1000,
  qs,
}: SignerOptions): SignedHeaders {
  if (qs && Object.keys(qs).length) {
    uri += "?" + stringify(qs);
  }
  return {
    "CB-ACCESS-KEY": key,
    "CB-ACCESS-SIGN": createHmac("sha256", Buffer.from(secret, "base64"))
      .update(timestamp + method + uri + (body ? JSON.stringify(body) : ""))
      .digest("base64"),
    "CB-ACCESS-TIMESTAMP": timestamp,
    "CB-ACCESS-PASSPHRASE": passphrase,
  };
}
