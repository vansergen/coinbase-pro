import { deepStrictEqual, ok, rejects } from "node:assert";
import WebSocket, { WebSocketServer } from "ws";

import {
  WebsocketClient,
  WsUri,
  SandboxWsUri,
  DefaultChannels,
  Signer,
} from "../index.js";

const port = 10000;
const wsUri = `ws://localhost:${port}`;
const key = "CoinbaseProAPIKey";
const secret = "CoinbaseProAPISecret";
const passphrase = "CoinbaseProAPIPassphrase";

suite("WebsocketClient", () => {
  let client: WebsocketClient;
  let server: WebSocketServer;

  setup(() => {
    server = new WebSocketServer({ port });
    client = new WebsocketClient({ wsUri });
  });

  teardown(async () => {
    await client.disconnect();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });

  test("constructor", () => {
    deepStrictEqual(client.channels, DefaultChannels);
    deepStrictEqual(client.wsUri, wsUri);
  });

  test("constructor (with no arguments)", () => {
    const websocket = new WebsocketClient();
    deepStrictEqual(websocket.channels, DefaultChannels);
    deepStrictEqual(websocket.wsUri, WsUri);
  });

  test("constructor (with sandbox flag)", () => {
    const websocket = new WebsocketClient({ sandbox: true });
    deepStrictEqual(websocket.channels, DefaultChannels);
    deepStrictEqual(websocket.wsUri, SandboxWsUri);
  });

  test("constructor (with api key)", () => {
    const channels = [
      { name: "level2", product_ids: ["ETH-BTC"] },
      { name: "heartbeat", product_ids: ["BTC-USD"] },
      { name: "ticker", product_ids: ["ETH-BTC", "ETH-USD"] },
    ];
    const websocket = new WebsocketClient({
      key,
      secret,
      passphrase,
      channels,
    });
    deepStrictEqual(websocket.channels, channels);
    deepStrictEqual(websocket.wsUri, WsUri);
  });

  test(".connect()", async () => {
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
  });

  test(".connect() (sends the subscription on open)", async () => {
    const serverConnect = new Promise<void>((resolve, reject) => {
      try {
        server.once("connection", (ws) =>
          ws.once("message", (data) => {
            deepStrictEqual(JSON.parse(data.toString()), {
              type: "subscribe",
              channels: DefaultChannels,
            });
            resolve();
          })
        );
      } catch (error) {
        reject(error);
      }
    });
    await client.connect();
    await serverConnect;
  });

  test(".connect() (sends the subscription on open with API key)", async () => {
    const websocket = new WebsocketClient({ wsUri, key, secret, passphrase });

    const serverConnect = new Promise<void>((resolve, reject) => {
      server.once("connection", (ws) =>
        ws.once("message", (data) => {
          try {
            const message = JSON.parse(data.toString()) as {
              timestamp: number;
            };
            const uri = "/users/self/verify";
            const method = "GET";
            const body = "";
            const headers = Signer({
              body,
              method,
              url: new URL(uri, "https://www.example.com/"),
              key,
              secret,
              passphrase,
              timestamp: message.timestamp,
            });
            deepStrictEqual(message, {
              key: headers["CB-ACCESS-KEY"],
              type: "subscribe",
              channels: DefaultChannels,
              signature: headers["CB-ACCESS-SIGN"],
              timestamp: headers["CB-ACCESS-TIMESTAMP"],
              passphrase: headers["CB-ACCESS-PASSPHRASE"],
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        })
      );
    });

    await websocket.connect();
    await serverConnect;
    await websocket.disconnect();
  });

  test(".connect() (when `readyState` is `OPEN`)", async () => {
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
  });

  test(".connect() (when `readyState` is `CONNECTING`)", async () => {
    const connect = client.connect();
    const error = new Error("Could not connect. State: 0");
    deepStrictEqual(client.ws?.readyState, WebSocket.CONNECTING);
    await rejects(client.connect(), error);
    await connect;
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
  });

  test(".connect() (when `readyState` is `CLOSING`)", async () => {
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
    const disconnect = client.disconnect();
    const error = new Error("Could not connect. State: 2");
    deepStrictEqual(client.ws?.readyState, WebSocket.CLOSING);
    await rejects(client.connect(), error);
    await disconnect;
  });

  test(".connect() (when `readyState` is `CLOSED`)", async () => {
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
    await client.disconnect();
    deepStrictEqual(client.ws?.readyState, WebSocket.CLOSED);
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
  });

  test(".disconnect()", async () => {
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
    await client.disconnect();
    deepStrictEqual(client.ws?.readyState, WebSocket.CLOSED);
  });

  test(".disconnect() (when socket is not initialized)", async () => {
    ok(typeof client.ws === "undefined");
    await client.disconnect();
    ok(typeof client.ws === "undefined");
  });

  test(".disconnect() (when `readyState` is `CLOSED`)", async () => {
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
    await client.disconnect();
    deepStrictEqual(client.ws?.readyState, WebSocket.CLOSED);
    await client.disconnect();
    deepStrictEqual(client.ws?.readyState, WebSocket.CLOSED);
  });

  test(".disconnect() (when `readyState` is `CONNECTING`)", async () => {
    const connect = client.connect();
    const error = new Error("Could not disconnect. State: 0");
    deepStrictEqual(client.ws?.readyState, WebSocket.CONNECTING);
    await rejects(client.disconnect(), error);
    await connect;
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
  });

  test(".disconnect() (when `readyState` is `CLOSING`)", async () => {
    await client.connect();
    deepStrictEqual(client.ws?.readyState, WebSocket.OPEN);
    const disconnect = client.disconnect();
    const error = new Error("Could not disconnect. State: 2");
    deepStrictEqual(client.ws?.readyState, WebSocket.CLOSING);
    await rejects(client.disconnect(), error);
    await disconnect;
    deepStrictEqual(client.ws?.readyState, WebSocket.CLOSED);
  });

  test(".subscribe()", async () => {
    const channels = [{ name: "ticker", product_ids: ["BTC-USD"] }];
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.on("connection", (ws) => {
        ws.once("message", () => {
          ws.once("message", (data) => {
            try {
              deepStrictEqual(JSON.parse(data.toString()), {
                type: "subscribe",
                channels: channels,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        });
      });
    });

    await client.connect();
    await client.subscribe({ channels });
    await serverConnect;
  });

  test(".subscribe() (when ws is not initialized)", async () => {
    const error = new Error("Websocket is not initialized");
    await rejects(client.subscribe({ channels: [] }), error);
  });

  test(".unsubscribe()", async () => {
    const channels = [{ name: "ticker", product_ids: ["BTC-USD"] }];
    const serverConnect = new Promise<void>((resolve, reject) => {
      server.on("connection", (ws) => {
        ws.once("message", () => {
          ws.once("message", (data) => {
            try {
              deepStrictEqual(JSON.parse(data.toString()), {
                type: "unsubscribe",
                channels: channels,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        });
      });
    });

    await client.connect();
    await client.unsubscribe({ channels });
    await serverConnect;
  });

  test(".unsubscribe() (rejects on errors)", async () => {
    const channels = [{ name: "ticker", product_ids: ["BTC-USD"] }];
    const message = "WebSocket is not open: readyState 3 (CLOSED)";

    await client.connect();
    await client.disconnect();
    await rejects(client.unsubscribe({ channels }), new Error(message));
  });

  suite(".ws listeners", () => {
    test("open event", async () => {
      await client.connect();
      const open = new Promise<void>((resolve) => {
        client.once("open", resolve);
      });
      client.ws?.emit("open");
      await open;
    });

    test("open event (emits error when subscribe is rejected)", async () => {
      const mesage = "WebSocket is not open: readyState 3 (CLOSED)";
      await client.connect();
      await client.disconnect();
      const error = new Promise<void>((resolve, reject) => {
        client.once("error", (err) => {
          try {
            deepStrictEqual(err, new Error(mesage));
            resolve();
          } catch (_error) {
            reject(_error);
          }
        });
      });
      client.ws?.emit("open");
      await error;
    });

    test("close event", async () => {
      await client.connect();
      const close = new Promise<void>((resolve) => {
        client.once("close", resolve);
      });
      client.ws?.emit("close");
      await close;
    });

    test("error event", async () => {
      const message = "Error message";
      await client.connect();
      const error = new Promise<void>((resolve, reject) => {
        client.once("error", (err) => {
          try {
            deepStrictEqual(err, new Error(message));
            resolve();
          } catch (_error) {
            reject(_error);
          }
        });
      });
      client.ws?.emit("error", new Error(message));
      await error;
    });

    test("message event (with error type)", async () => {
      const error = { type: "error", message: "Something bad" };
      await client.connect();
      const message = new Promise<void>((resolve, reject) => {
        client.once("error", (err) => {
          try {
            deepStrictEqual(err, error);
            resolve();
          } catch (_error) {
            reject(_error);
          }
        });
      });
      client.ws?.emit("message", JSON.stringify(error));
      await message;
    });

    test("message event (with invalid JSON)", async () => {
      const data = "NOT JSON";
      await client.connect();
      const message = new Promise<void>((resolve, reject) => {
        client.once("error", (err) => {
          try {
            deepStrictEqual(
              err,
              new SyntaxError("Unexpected token N in JSON at position 0")
            );
            resolve();
          } catch (_error) {
            reject(_error);
          }
        });
      });
      client.ws?.emit("message", data);
      await message;
    });

    test("message event", async () => {
      const data = {
        type: "heartbeat",
        sequence: 90,
        last_trade_id: 20,
        product_id: "BTC-USD",
        time: "2014-11-07T08:19:28.464459Z",
      };
      await client.connect();
      const message = new Promise<void>((resolve, reject) => {
        client.once("message", (msg) => {
          try {
            deepStrictEqual(msg, data);
            resolve();
          } catch (_error) {
            reject(_error);
          }
        });
      });
      client.ws?.emit("message", JSON.stringify(data));
      await message;
    });
  });
});
