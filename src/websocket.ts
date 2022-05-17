import { EventEmitter } from "node:events";
import WebSocket from "ws";

import {
  ProductInfo,
  CurrencyDetails,
  Side,
  DefaultProductID,
} from "./public.js";
import { Signer } from "./signer.js";

export const WsUri = "wss://ws-feed.pro.coinbase.com";
export const SandboxWsUri = "wss://ws-feed-public.sandbox.pro.coinbase.com";
export const DefaultChannels = [
  { name: "full", product_ids: [DefaultProductID] },
  { name: "heartbeat", product_ids: [DefaultProductID] },
  { name: "status", product_ids: [DefaultProductID] },
];

export type Channel =
  | { name: "status" }
  | { name: string; product_ids: string[] };

export interface SubscribeParams {
  channels: Channel[];
}

export interface Subscription extends SubscribeParams {
  type: "subscribe" | "unsubscribe";
}

export interface SignedMessage extends Subscription {
  key?: string;
  signature?: string;
  timestamp?: string;
  passphrase?: string;
}

export interface WSMessageHeartbeat {
  type: "heartbeat";
  sequence: number;
  last_trade_id: number;
  product_id: string;
  time: string;
}

export interface WSMessageSnapshot {
  type: "snapshot";
  product_id: string;
  bids: [string, string][];
  asks: [string, string][];
}

export interface WSMessageL2Update {
  type: "l2update";
  product_id: string;
  changes: [string, string, string][];
  time: string;
}

export interface WSMessageReceived {
  type: "received";
  side: Side;
  product_id: string;
  time: string;
  sequence: number;
  order_id: string;
  order_type: "limit" | "market";
  client_oid?: string;
  size?: string;
  price?: string;
  funds?: string;
  profile_id?: string;
  user_id?: string;
}

export interface WSMessageOpen {
  type: "open";
  side: Side;
  product_id: string;
  time: string;
  sequence: number;
  price: string;
  order_id: string;
  remaining_size: string;
  profile_id?: string;
  user_id?: string;
}

export interface WSMessageMatch {
  type: "match";
  trade_id: number;
  maker_order_id: string;
  taker_order_id: string;
  side: Side;
  size: string;
  price: string;
  product_id: string;
  sequence: number;
  time: string;
}

export interface WSMessageChange {
  type: "change";
  side: Side;
  product_id: string;
  time: string;
  sequence: number;
  price: string;
  order_id: string;
  new_size?: string;
  old_size?: string;
  new_funds?: string;
  old_funds?: string;
  profile_id?: string;
  user_id?: string;
}

export interface WSMessageDone {
  type: "done";
  side: Side;
  product_id: string;
  time: string;
  sequence: number;
  order_id: string;
  reason: "filled" | "canceled";
  price?: string;
  remaining_size?: string;
  profile_id?: string;
  user_id?: string;
}

export interface WSMessageActivate {
  type: "activate";
  side: Side;
  product_id: string;
  time: string;
  sequence: number;
  order_id: string;
  client_oid?: string;
  stop_price: string;
  limit_price: string;
  size: string;
  taker_fee_rate?: string;
  stop_type: string;
  profile_id?: string;
  user_id?: string;
}

export interface WSMessageTicker {
  type: "ticker";
  sequence: number;
  product_id: string;
  price: string;
  open_24h: string;
  volume_24h: string;
  low_24h: string;
  high_24h: string;
  volume_30d: string;
  best_bid: string;
  best_ask: string;
  side: Side;
  time: string;
  trade_id: number;
  last_size: string;
}

export interface WSMessageLastMatch {
  type: "last_match";
  trade_id: number;
  maker_order_id: string;
  taker_order_id: string;
  side: Side;
  size: string;
  price: string;
  product_id: string;
  sequence: number;
  time: string;
}

export interface WSMessageSubscriptions {
  type: "subscriptions";
  channels: { name: string; product_ids: string[] }[];
}

export interface WSMessageStatus {
  type: "status";
  currencies: {
    id: string;
    name: string;
    min_size: string;
    status: string;
    funding_account_id: string;
    status_message: string;
    max_precision: string;
    convertible_to: string[];
    details: CurrencyDetails;
  }[];
  products: (ProductInfo & { type: string })[];
}

export type WSMessage =
  | WSMessageHeartbeat
  | WSMessageSnapshot
  | WSMessageL2Update
  | WSMessageReceived
  | WSMessageOpen
  | WSMessageMatch
  | WSMessageChange
  | WSMessageDone
  | WSMessageActivate
  | WSMessageTicker
  | WSMessageLastMatch
  | WSMessageSubscriptions
  | WSMessageStatus;

export interface WebSocketClientOptions {
  wsUri?: string;
  channels?: Channel[];
  key?: string;
  secret?: string;
  passphrase?: string;
  sandbox?: boolean;
}

export declare interface WebSocketClient {
  on(event: "open" | "close", eventListener: () => void): this;
  on(event: "message", eventListener: (data: WSMessage) => void): this;
  on(event: "error", eventListener: (error: unknown) => void): this;

  once(event: "open" | "close", eventListener: () => void): this;
  once(event: "message", eventListener: (data: WSMessage) => void): this;
  once(event: "error", eventListener: (error: unknown) => void): this;
}

export class WebSocketClient extends EventEmitter {
  public ws?: WebSocket;
  public readonly wsUri: string;
  public readonly channels: Channel[];

  readonly #key?: string;
  readonly #secret?: string;
  readonly #passphrase?: string;

  public constructor({
    channels = DefaultChannels,
    key,
    secret,
    passphrase,
    sandbox = false,
    wsUri = sandbox ? SandboxWsUri : WsUri,
  }: WebSocketClientOptions = {}) {
    super();
    this.channels = channels;
    this.wsUri = wsUri;
    if (key && secret && passphrase) {
      this.#key = key;
      this.#secret = secret;
      this.#passphrase = passphrase;
    }
  }

  public connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      switch (this.ws?.readyState) {
        case WebSocket.CLOSING:
        case WebSocket.CONNECTING:
          reject(new Error(`Could not connect. State: ${this.ws.readyState}`));
          return;
        case WebSocket.OPEN:
          resolve();
          return;
        default:
          break;
      }

      (this.ws = new WebSocket(this.wsUri))
        .once("open", resolve)
        .once("error", reject)
        .on("message", (data: string) => {
          try {
            const message = JSON.parse(data) as { type?: string };
            if (message.type === "error") {
              this.emit("error", message);
            } else {
              this.emit("message", message as WSMessage);
            }
          } catch (error) {
            this.emit("error", error);
          }
        })
        .on("open", () => {
          this.emit("open");
          this.subscribe({ channels: this.channels }).catch((error) => {
            this.emit("error", error);
          });
        })
        .on("close", () => {
          this.emit("close");
        })
        .on("error", (error) => {
          this.emit("error", error);
        });
    });
  }

  public disconnect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      switch (this.ws?.readyState) {
        case WebSocket.CLOSED:
          resolve();
          return;
        case WebSocket.CLOSING:
        case WebSocket.CONNECTING:
          reject(
            new Error(`Could not disconnect. State: ${this.ws.readyState}`)
          );
          return;
        default:
          break;
      }

      if (!this.ws) {
        resolve();
      } else {
        this.ws.once("error", reject).once("close", resolve).close();
      }
    });
  }

  public subscribe(params: SubscribeParams): Promise<void> {
    return this.#send({ ...params, type: "subscribe" });
  }

  public unsubscribe(params: SubscribeParams): Promise<void> {
    return this.#send({ ...params, type: "unsubscribe" });
  }

  #send(params: Subscription): Promise<void> {
    return new Promise((resolve, reject) => {
      const { ws } = this;

      if (!ws) {
        reject(new Error("WebSocket is not initialized"));
        return;
      }

      const message: SignedMessage = params;

      if (this.#key && this.#secret && this.#passphrase) {
        const timestamp = Date.now() / 1000;
        const signature = Signer({
          timestamp,
          body: "",
          method: "GET",
          url: new URL("/users/self/verify", this.wsUri),
          key: this.#key,
          secret: this.#secret,
          passphrase: this.#passphrase,
        });
        message.key = signature["CB-ACCESS-KEY"];
        message.signature = signature["CB-ACCESS-SIGN"];
        message.timestamp = signature["CB-ACCESS-TIMESTAMP"];
        message.passphrase = signature["CB-ACCESS-PASSPHRASE"];
      }

      const data = JSON.stringify(message);

      ws.send(data, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}
