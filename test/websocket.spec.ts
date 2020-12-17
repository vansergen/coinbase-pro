import {
  WebsocketClient,
  WsUri,
  SandboxWsUri,
  DefaultChannels,
  Signer,
} from "../index";
import * as assert from "assert";
import { OPEN, CONNECTING, CLOSING, CLOSED, Server } from "ws";

const port = 10000;
const wsUri = "ws://localhost:" + port;

const key = "CoinbaseProAPIKey";
const secret = "CoinbaseProAPISecret";
const passphrase = "CoinbaseProAPIPassphrase";

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

  test("constructor (with no arguments)", () => {
    const websocket = new WebsocketClient();
    assert.deepStrictEqual(websocket.channels, DefaultChannels);
    assert.deepStrictEqual(websocket.product_ids, []);
    assert.deepStrictEqual(websocket.wsUri, WsUri);
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
        product_ids: ["ETH-BTC", "ETH-USD"],
      },
    ];
    const product_ids = ["ETH-USD", "ETH-EUR"];
    const websocket = new WebsocketClient({
      key,
      secret,
      passphrase,
      channels,
      product_ids,
    });
    assert.deepStrictEqual(websocket.channels, channels);
    assert.deepStrictEqual(websocket.product_ids, product_ids);
    assert.deepStrictEqual(websocket.wsUri, WsUri);
    assert.deepStrictEqual(websocket.key, key);
    assert.deepStrictEqual(websocket.secret, secret);
    assert.deepStrictEqual(websocket.passphrase, passphrase);
  });

  test(".connect()", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    server.on("connection", () => server.close(done));
    client.connect();
  });

  test(".connect() (sends the subscription on open)", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    server.on("connection", (ws) =>
      ws.once("message", (data) => {
        assert.deepStrictEqual(JSON.parse(data), {
          type: "subscribe",
          channels: DefaultChannels,
          product_ids: [],
        });
        server.close(done);
      })
    );
    client.connect();
  });

  test(".connect() (sends the subscription on open with API key)", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri, key, secret, passphrase });
    server.on("connection", (ws) =>
      ws.once("message", (data) => {
        const message = JSON.parse(data);
        const uri = "/users/self/verify";
        const method = "GET";
        const body = "";
        const headers = Signer({
          body,
          method,
          uri,
          key,
          secret,
          passphrase,
          timestamp: message.timestamp,
        });
        assert.deepStrictEqual(message, {
          key: headers["CB-ACCESS-KEY"],
          type: "subscribe",
          channels: DefaultChannels,
          product_ids: [],
          signature: headers["CB-ACCESS-SIGN"],
          timestamp: headers["CB-ACCESS-TIMESTAMP"],
          passphrase: headers["CB-ACCESS-PASSPHRASE"],
        });
        server.close(done);
      })
    );
    client.connect();
  });

  test(".connect() (when `readyState` is `OPEN`)", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    client.on("open", () => {
      if (!client.ws) {
        assert.fail("Websocket is not initialized");
      }
      assert.deepStrictEqual(client.ws.readyState, OPEN);
      client.connect();
      server.close(done);
    });
  });

  test(".connect() (when `readyState` is `CONNECTING`)", (done) => {
    function verifyClient(info: object, cb: Function): void {
      setTimeout(() => cb(true) && info, 0);
    }
    const server = new Server({ port, verifyClient });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    if (!client.ws) {
      assert.fail("Websocket is not initialized");
    }
    assert.deepStrictEqual(client.ws.readyState, CONNECTING);
    const error = new Error("Could not connect. State: 0");
    assert.throws(() => client.connect(), error);
    client.on("open", () => server.close(done));
  });

  test(".connect() (when `readyState` is `CLOSING`)", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    client.on("open", () => {
      client.disconnect();
      if (!client.ws) {
        assert.fail("Websocket is not initialized");
      }
      assert.deepStrictEqual(client.ws.readyState, CLOSING);
      const error = new Error("Could not connect. State: 2");
      assert.throws(() => client.connect(), error);
      client.on("close", () => server.close(done));
    });
    client.connect();
  });

  test(".disconnect()", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    client.once("open", client.disconnect);
    client.once("close", () => server.close(done));
    client.connect();
  });

  test(".disconnect() (when ws is not initialized)", (done) => {
    const client = new WebsocketClient({ wsUri });
    client.disconnect();
    done();
  });

  test(".disconnect() (when `readyState` is `CLOSED`)", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    client.on("open", () => client.disconnect());
    client.on("close", () => {
      if (!client.ws) {
        assert.fail("Websocket is not initialized");
      }
      assert.deepStrictEqual(client.ws.readyState, CLOSED);
      client.disconnect();
      server.close(done);
    });
    client.connect();
  });

  test(".disconnect() (when `readyState` is `CONNECTING`)", (done) => {
    function verifyClient(info: object, cb: Function): void {
      setTimeout(() => cb(true) && info, 0);
    }
    const server = new Server({ port, verifyClient });
    const client = new WebsocketClient({ wsUri });
    client.connect();
    if (!client.ws) {
      assert.fail("Websocket is not initialized");
    }
    assert.deepStrictEqual(client.ws.readyState, CONNECTING);
    const error = new Error("Could not disconnect. State: 0");
    assert.throws(() => client.disconnect(), error);
    client.on("open", () => server.close(done));
  });

  test(".disconnect() (when `readyState` is `CLOSING`)", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    client.on("open", () => {
      client.disconnect();
      if (!client.ws) {
        assert.fail("Websocket is not initialized");
      }
      assert.deepStrictEqual(client.ws.readyState, CLOSING);
      const error = new Error("Could not disconnect. State: 2");
      assert.throws(() => client.disconnect(), error);
      client.on("close", () => server.close(done));
    });
    client.connect();
  });

  test(".subscribe()", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    const channels = [{ name: "ticker", product_ids: ["BTC-USD"] }];
    server.on("connection", (ws) => {
      ws.once("message", () => {
        ws.once("message", (data) => {
          assert.deepStrictEqual(JSON.parse(data), {
            type: "subscribe",
            channels: channels,
          });
          server.close(done);
        });
        client.subscribe({ channels });
      });
    });
    client.connect();
  });

  test(".subscribe() (when ws is not initialized)", (done) => {
    const client = new WebsocketClient({ wsUri });
    const error = new Error("Websocket is not initialized");
    assert.throws(() => client.subscribe({ channels: [] }), error);
    done();
  });

  test(".unsubscribe()", (done) => {
    const server = new Server({ port });
    const client = new WebsocketClient({ wsUri });
    const channels = [{ name: "ticker", product_ids: ["BTC-USD"] }];
    server.on("connection", (ws) => {
      ws.once("message", () => {
        ws.once("message", (data) => {
          assert.deepStrictEqual(JSON.parse(data), {
            type: "unsubscribe",
            channels: channels,
          });
          server.close(done);
        });
        client.unsubscribe({ channels });
      });
    });
    client.connect();
  });

  suite(".ws listeners", () => {
    test("open event", (done) => {
      const server = new Server({ port });
      const client = new WebsocketClient({ wsUri });
      client.connect();
      client.on("open", () => server.close(done));
    });

    test("close event", (done) => {
      const server = new Server({ port });
      const client = new WebsocketClient({ wsUri });
      client.connect();
      client.on("open", client.disconnect);
      client.on("close", () => server.close(done));
    });

    test("error event", (done) => {
      const server = new Server({ port });
      const client = new WebsocketClient({ wsUri });
      const error = new Error("Error message");
      client.once("open", () => {
        if (!client.ws) {
          assert.fail("Websocket is not initialized");
        }
        client.ws.emit("error", error);
      });
      client.once("error", (err) => {
        assert.deepStrictEqual(err, error);
        server.close(done);
      });
      client.connect();
    });

    test("message event (with error type)", (done) => {
      const server = new Server({ port });
      const client = new WebsocketClient({ wsUri });
      const error = { type: "error", message: "Something bad" };
      server.on("connection", (ws) => {
        ws.send(JSON.stringify(error));
      });
      client.connect();
      client.on("error", (err) => {
        assert.deepStrictEqual(err, error);
        server.close(done);
      });
    });

    test("message event", (done) => {
      const server = new Server({ port });
      const client = new WebsocketClient({ wsUri });
      const message = {
        type: "heartbeat",
        sequence: 90,
        last_trade_id: 20,
        product_id: "BTC-USD",
        time: "2014-11-07T08:19:28.464459Z",
      };
      server.on("connection", (ws) => {
        ws.send(JSON.stringify(message));
      });
      client.connect();
      client.on("message", (msg) => {
        assert.deepStrictEqual(msg, message);
        server.close(done);
      });
    });
  });
});
