import { EventEmitter } from "events";
import * as Websocket from "ws";
import { Signer } from "../index";

export const WsUri = "wss://ws-feed.pro.coinbase.com";
export const SandboxWsUri = "wss://ws-feed-public.sandbox.pro.coinbase.com";
export const DefaultChannels = ["full", "heartbeat", "status"];
export const DefaultProductIds = ["BTC-USD"];

export type Channel = string | { name: string; product_ids?: string[] };

export type SubscribeParams = {
  product_ids?: string | string[];
  channels: Channel | Channel[];
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

export type WebsocketClientOptions = {
  product_ids?: string | string[];
  wsUri?: string;
  channels?: Channel | Channel[];
  key?: string;
  secret?: string;
  passphrase?: string;
  sandbox?: boolean;
};

export class WebsocketClient extends EventEmitter {
  ws?: Websocket;
  readonly channels: Channel[];
  readonly product_ids: string[];
  readonly key?: string;
  readonly secret?: string;
  readonly passphrase?: string;
  readonly wsUri: string;

  constructor({
    channels = DefaultChannels,
    product_ids = DefaultProductIds,
    key,
    secret,
    passphrase,
    sandbox,
    wsUri = sandbox ? SandboxWsUri : WsUri
  }: WebsocketClientOptions = {}) {
    super();
    this.channels = Array.isArray(channels) ? channels : [channels];
    this.product_ids = Array.isArray(product_ids) ? product_ids : [product_ids];
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
      this.subscribe({
        channels: this.channels,
        product_ids: this.product_ids
      });
    });
    this.ws.on("close", () => {
      this.emit("close");
    });
    this.ws.on("error", error => {
      this.emit("error", error);
    });
    this.ws.on("message", (data: string) => {
      const message = JSON.parse(data);
      if (message.type === "error") {
        this.emit("error", message);
      } else {
        this.emit("message", message);
      }
    });
  }

  subscribe({ channels, ...product_ids }: SubscribeParams): void {
    this.send({ ...product_ids, channels, type: "subscribe" });
  }

  unsubscribe({ channels, ...product_ids }: SubscribeParams): void {
    this.send({ ...product_ids, channels, type: "unsubscribe" });
  }

  send({ type, channels, ...product_ids }: Subscription): void {
    if (!this.ws) {
      throw new Error("Websocket is not initialized");
    }

    const message: SignedMessage = {
      type,
      channels,
      ...product_ids
    };
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
