import { EventEmitter } from "events";
import * as Websocket from "ws";
import { Signer, ProductInfo, CurrencyDetails, Side } from "../index";

export const WsUri = "wss://ws-feed.pro.coinbase.com";
export const SandboxWsUri = "wss://ws-feed-public.sandbox.pro.coinbase.com";
export const DefaultChannels = [
  { name: "full", product_ids: ["BTC-USD"] },
  { name: "heartbeat", product_ids: ["BTC-USD"] },
  { name: "status", product_ids: ["BTC-USD"] }
];

export type Channel = string | { name: string; product_ids?: string[] };

export type SubscribeParams = {
  product_ids?: string[];
  channels: Channel[];
};

export type Subscription = SubscribeParams & {
  type: "subscribe" | "unsubscribe";
};

export type SignedMessage = Subscription & {
  key?: string;
  signature?: string;
  timestamp?: number;
  passphrase?: string;
};

export type WSMessageHeartbeat = {
  type: "heartbeat";
  sequence: number;
  last_trade_id: number;
  product_id: string;
  time: string;
};

export type WSMessageSnapshot = {
  type: "snapshot";
  product_id: string;
  bids: [string, string][];
  asks: [string, string][];
};

export type WSMessageL2Update = {
  type: "l2update";
  product_id: string;
  changes: [string, string, string][];
  time: string;
};

export type WSMessageReceived = {
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
};

export type WSMessageOpen = {
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
};

export type WSMessageMatch = {
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
};

export type WSMessageChange = {
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
};

export type WSMessageDone = {
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
};

export type WSMessageActivate = {
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
};

export type WSMessageTicker = {
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
};

export type WSMessageLastMatch = {
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
};

export type WSMessageSubscriptions = {
  type: "subscriptions";
  channels: { name: string; product_ids: string[] }[];
};

export type WSMessageStatus = {
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
};

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

export type WSError =
  | Error
  | { type: "error"; message: string; reason: string };

export type WebsocketClientOptions = {
  product_ids?: string[];
  wsUri?: string;
  channels?: Channel[];
  key?: string;
  secret?: string;
  passphrase?: string;
  sandbox?: boolean;
};

export declare interface WebsocketClient {
  on(event: "open", eventListener: () => void): this;
  on(event: "close", eventListener: () => void): this;
  on(event: "message", eventListener: (data: WSMessage) => void): this;
  on(event: "error", eventListener: (error: WSError) => void): this;

  once(event: "open", eventListener: () => void): this;
  once(event: "close", eventListener: () => void): this;
  once(event: "message", eventListener: (data: WSMessage) => void): this;
  once(event: "error", eventListener: (error: WSError) => void): this;
}

export class WebsocketClient extends EventEmitter {
  private ws?: Websocket;
  readonly channels: Channel[];
  readonly product_ids: string[];
  readonly key?: string;
  readonly secret?: string;
  readonly passphrase?: string;
  readonly wsUri: string;

  constructor({
    channels = DefaultChannels,
    product_ids = [],
    key,
    secret,
    passphrase,
    sandbox = false,
    wsUri = sandbox ? SandboxWsUri : WsUri
  }: WebsocketClientOptions = {}) {
    super();
    this.channels = channels;
    this.product_ids = product_ids;
    this.wsUri = wsUri;
    if (key && secret && passphrase) {
      this.key = key;
      this.secret = secret;
      this.passphrase = passphrase;
    }
  }

  connect(): void {
    if (this.ws) {
      switch (this.ws.readyState) {
        case Websocket.OPEN:
          return;
        case Websocket.CLOSING:
        case Websocket.CONNECTING:
          throw new Error("Could not connect. State: " + this.ws.readyState);
      }
    }

    this.ws = new Websocket(this.wsUri);
    this.ws.on("open", () => {
      this.emit("open");
      const { product_ids } = this;
      this.subscribe({ channels: this.channels, product_ids });
    });
    this.ws.on("close", () => this.emit("close"));
    this.ws.on("error", error => this.emit("error", error));
    this.ws.on("message", (data: string) => {
      const message = JSON.parse(data);
      if (message.type === "error") {
        this.emit("error", message);
      } else {
        this.emit("message", message);
      }
    });
  }

  disconnect(): void {
    if (!this.ws) {
      return;
    }
    switch (this.ws.readyState) {
      case Websocket.CLOSED:
        return;
      case Websocket.CLOSING:
      case Websocket.CONNECTING:
        throw new Error("Could not connect. State: " + this.ws.readyState);
    }

    this.ws.close();
  }

  subscribe(params: SubscribeParams): void {
    this.send({ ...params, type: "subscribe" });
  }

  unsubscribe(params: SubscribeParams): void {
    this.send({ ...params, type: "unsubscribe" });
  }

  private send(params: Subscription): void {
    if (!this.ws) {
      throw new Error("Websocket is not initialized");
    }

    const message: SignedMessage = params;
    if (this.key && this.secret && this.passphrase) {
      const signature = Signer({
        body: "",
        method: "GET",
        uri: "/users/self/verify",
        key: this.key,
        secret: this.secret,
        passphrase: this.passphrase
      });
      message.key = signature["CB-ACCESS-KEY"];
      message.signature = signature["CB-ACCESS-SIGN"];
      message.timestamp = signature["CB-ACCESS-TIMESTAMP"];
      message.passphrase = signature["CB-ACCESS-PASSPHRASE"];
    }

    this.ws.send(JSON.stringify(message));
  }
}
