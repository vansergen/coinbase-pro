import { createHmac } from "crypto";

export interface SignerOptions {
  method: string;
  url: URL;
  body?: string;
  key: string;
  secret: string;
  passphrase: string;
  timestamp: number | string;
}

export interface SignedHeaders {
  "CB-ACCESS-KEY": string;
  "CB-ACCESS-SIGN": string;
  "CB-ACCESS-TIMESTAMP": string;
  "CB-ACCESS-PASSPHRASE": string;
}

export function Signer({
  method,
  url,
  body = "",
  key,
  secret,
  passphrase,
  timestamp,
}: SignerOptions): SignedHeaders {
  return {
    "CB-ACCESS-KEY": key,
    "CB-ACCESS-SIGN": createHmac("sha256", Buffer.from(secret, "base64"))
      .update(`${timestamp}${method}${url.pathname}${url.search}${body}`)
      .digest("base64"),
    "CB-ACCESS-TIMESTAMP": `${timestamp}`,
    "CB-ACCESS-PASSPHRASE": passphrase,
  };
}
