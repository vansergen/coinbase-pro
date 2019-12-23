import {
  WebsocketClient,
  WsUri,
  SandboxWsUri,
  DefaultChannels
} from "../index";
import * as assert from "assert";
import { Server } from "ws";

const port = 10000;
const wsUri = "ws://localhost:" + port;

suite("WebsocketClient", () => {
  test("constructor", () => {
    const websocket = new WebsocketClient({ wsUri });
    assert.deepStrictEqual(websocket.channels, DefaultChannels);
    assert.deepStrictEqual(websocket.product_ids, []);
    assert.deepStrictEqual(websocket.wsUri, wsUri);
    assert.deepStrictEqual(websocket.key, undefined);
    assert.deepStrictEqual(websocket.secret, undefined);
    assert.deepStrictEqual(websocket.passphrase, undefined);
  });

  test("constructor (with sandbox flag)", () => {
    const websocket = new WebsocketClient({ sandbox: true });
    assert.deepStrictEqual(websocket.channels, DefaultChannels);
    assert.deepStrictEqual(websocket.product_ids, []);
    assert.deepStrictEqual(websocket.wsUri, SandboxWsUri);
    assert.deepStrictEqual(websocket.key, undefined);
    assert.deepStrictEqual(websocket.secret, undefined);
    assert.deepStrictEqual(websocket.passphrase, undefined);
  });

  test("constructor (with api key)", () => {
    const key = "key";
    const secret = "secret";
    const passphrase = "passphrase";
    const channels = [
      "level2",
      "heartbeat",
      {
        name: "ticker",
        product_ids: ["ETH-BTC", "ETH-USD"]
      }
    ];
    const product_ids = ["ETH-USD", "ETH-EUR"];
    const websocket = new WebsocketClient({
      key,
      secret,
      passphrase,
      channels,
      product_ids
    });
    assert.deepStrictEqual(websocket.channels, channels);
    assert.deepStrictEqual(websocket.product_ids, product_ids);
    assert.deepStrictEqual(websocket.wsUri, WsUri);
    assert.deepStrictEqual(websocket.key, key);
    assert.deepStrictEqual(websocket.secret, secret);
    assert.deepStrictEqual(websocket.passphrase, passphrase);
  });

  test(".connect()", done => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    server.on("connection", ws => {
      ws.once("message", data => {
        assert.deepStrictEqual(JSON.parse(data), {
          type: "subscribe",
          channels: DefaultChannels,
          product_ids: []
        });
        server.close(done);
      });
    });
    client.connect();
  });

  test(".disconnect()", done => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    server.on("connection", ws => {
      ws.once("message", data => {
        assert.deepStrictEqual(JSON.parse(data), {
          type: "subscribe",
          channels: DefaultChannels,
          product_ids: []
        });
        client.disconnect();
      });
    });
    client.once("close", () => server.close(done));
    client.connect();
  });

  test(".subscribe()", done => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    const channels = [{ name: "ticker", product_ids: ["BTC-USD"] }];
    server.on("connection", ws => {
      ws.once("message", data => {
        assert.deepStrictEqual(JSON.parse(data), {
          type: "subscribe",
          channels: DefaultChannels,
          product_ids: []
        });
        ws.once("message", data => {
          assert.deepStrictEqual(JSON.parse(data), {
            type: "subscribe",
            channels: channels
          });
          server.close(done);
        });
        client.subscribe({ channels });
      });
    });
    client.connect();
  });

  test(".unsubscribe()", done => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    const channels = [{ name: "ticker", product_ids: ["BTC-USD"] }];
    server.on("connection", ws => {
      ws.once("message", data => {
        assert.deepStrictEqual(JSON.parse(data), {
          type: "subscribe",
          channels: DefaultChannels,
          product_ids: []
        });
        ws.once("message", data => {
          assert.deepStrictEqual(JSON.parse(data), {
            type: "unsubscribe",
            channels: channels
          });
          server.close(done);
        });
        client.unsubscribe({ channels });
      });
    });
    client.connect();
  });
});
