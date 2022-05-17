import nock from "nock";
import {
  PublicClient,
  DefaultProductID,
  ApiUri,
  SandboxApiUri,
  ProductInfo,
  OrderBook,
  Ticker,
  Trade,
  Candle,
  ProductStats,
  CurrencyInfo,
  Time,
} from "../index.js";
import assert from "assert";
import http from "http";
import { FetchError } from "node-fetch";

const product_id = "ETH-BTC";
const apiUri = "https://api.some-other-uri.com";
const client = new PublicClient({ product_id, apiUri });

suite("PublicClient", () => {
  test("constructor", () => {
    assert.deepStrictEqual(client.product_id, product_id);
    assert.deepStrictEqual(client.apiUri, new URL(apiUri));
  });

  test("constructor (default options)", () => {
    const otherClient = new PublicClient();
    assert.deepStrictEqual(otherClient.product_id, DefaultProductID);
    assert.deepStrictEqual(otherClient.apiUri, new URL(ApiUri));
  });

  test("constructor (with sandox flag)", () => {
    const sandbox = true;
    const otherClient = new PublicClient({ product_id, sandbox });
    assert.deepStrictEqual(otherClient.product_id, product_id);
    assert.deepStrictEqual(otherClient.apiUri, new URL(SandboxApiUri));
  });

  test(".fetch()", async () => {
    const response = "response";
    const uri = "/products";
    nock(apiUri).get(uri).reply(200, JSON.stringify({ response }));

    const data = await client.fetch(uri);
    assert.deepStrictEqual(data, { response });
  });

  test(".get() (reject non 2xx responses)", async () => {
    const uri = "/some/path";
    const response = { message: "Not Found" };
    nock(apiUri).get(uri).delay(1).reply(404, response);

    await assert.rejects(client.get(uri), new Error(response.message));
  });

  test(".get() (reject non 2xx responses with invalid JSON response) ", async () => {
    const uri = "/some/path";
    const response = "Not valid JSON";
    nock(apiUri).get(uri).delay(1).reply(404, response);

    await assert.rejects(client.get(uri), new Error(response));
  });

  test(".get() (reject on errors)", async () => {
    const port = 28080;
    const otherUrl = `http://127.0.0.1:${port}`;
    const server = await new Promise<http.Server>((resolve) => {
      const _server = new http.Server((_request, response) => {
        response.destroy();
      });
      _server
        .on("listening", () => {
          resolve(_server);
        })
        .listen(port);
    });

    const otherClient = new PublicClient({ apiUri: otherUrl });
    const uri = "/some/path";
    try {
      await otherClient.get(uri);
      assert.fail("Should throw an error");
    } catch (error) {
      assert.ok(error instanceof FetchError);
    }
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

  test(".get()", async () => {
    const response = "response";
    const uri = "/products";
    nock(apiUri).get(uri).reply(200, JSON.stringify({ response }));

    const data = await client.get(uri);
    assert.deepStrictEqual(data, { response });
  });

  test(".getProducts()", async () => {
    const response: ProductInfo[] = [
      {
        id: "DASH-BTC",
        base_currency: "DASH",
        quote_currency: "BTC",
        base_min_size: "0.01000000",
        base_max_size: "1500.00000000",
        quote_increment: "0.00000001",
        base_increment: "0.00100000",
        display_name: "DASH/BTC",
        min_market_funds: "0.0001",
        max_market_funds: "10",
        margin_enabled: false,
        post_only: false,
        limit_only: false,
        cancel_only: false,
        status: "online",
        status_message: "",
        trading_disabled: false,
      },
      {
        id: "BTC-GBP",
        base_currency: "BTC",
        quote_currency: "GBP",
        base_min_size: "0.00100000",
        base_max_size: "80.00000000",
        quote_increment: "0.01000000",
        base_increment: "0.00000001",
        display_name: "BTC/GBP",
        min_market_funds: "10",
        max_market_funds: "200000",
        margin_enabled: false,
        post_only: false,
        limit_only: false,
        cancel_only: false,
        status: "online",
        status_message: "",
        trading_disabled: false,
      },
    ];
    nock(apiUri).get("/products").reply(200, response);
    const data = await client.getProducts();
    assert.deepStrictEqual(data, response);
  });

  test(".getProduct()", async () => {
    const response: ProductInfo = {
      id: "ETH-USD",
      base_currency: "ETH",
      quote_currency: "USD",
      base_min_size: "0.01000000",
      base_max_size: "2800.00000000",
      quote_increment: "0.01000000",
      base_increment: "0.00000001",
      display_name: "ETH/USD",
      min_market_funds: "5",
      max_market_funds: "1000000",
      margin_enabled: false,
      post_only: false,
      limit_only: false,
      cancel_only: false,
      trading_disabled: false,
      status: "online",
      status_message: "",
    };
    nock(apiUri).get(`/products/${product_id}`).reply(200, response);
    const data = await client.getProduct();
    assert.deepStrictEqual(data, response);
  });

  test(".getOrderBook()", async () => {
    const response: OrderBook = {
      sequence: 11228249048,
      bids: [["8736.97", "21.90409501", 6]],
      asks: [["8736.98", "1.182", 1]],
    };
    nock(apiUri).get(`/products/${product_id}/book`).reply(200, response);
    const data = await client.getOrderBook();
    assert.deepStrictEqual(data, response);
  });

  test(".getOrderBook() (with level)", async () => {
    const level = 2;
    const response: OrderBook = {
      sequence: 11228259122,
      bids: [
        ["8736.08", "0.73298845", 2],
        ["8735", "1.00456364", 2],
      ],
      asks: [
        ["8736.09", "3.43889621", 3],
        ["8736.3", "0.2", 1],
      ],
    };
    nock(apiUri)
      .get(`/products/${product_id}/book`)
      .query({ level })
      .reply(200, response);
    const data = await client.getOrderBook({ level });
    assert.deepStrictEqual(data, response);
  });

  test(".getTicker()", async () => {
    const response: Ticker = {
      trade_id: 77692587,
      price: "8735.01",
      size: "0.02225439",
      time: "2019-11-12T18:28:34.962Z",
      bid: "8735",
      ask: "8735.01",
      volume: "6079.45359045",
    };
    nock(apiUri).get(`/products/${product_id}/ticker`).reply(200, response);
    const data = await client.getTicker();
    assert.deepStrictEqual(data, response);
  });

  test(".getTrades()", async () => {
    const response: Trade[] = [
      {
        time: "2019-11-12T19:46:40.935Z",
        trade_id: 77695138,
        price: "8748.91000000",
        size: "0.00267368",
        side: "sell",
      },
      {
        time: "2019-11-12T19:46:30.075Z",
        trade_id: 77695137,
        price: "8749.83000000",
        size: "0.03499187",
        side: "sell",
      },
    ];
    nock(apiUri).get(`/products/${product_id}/trades`).reply(200, response);
    const data = await client.getTrades();
    assert.deepStrictEqual(data, response);
  });

  test(".getTrades() (with options)", async () => {
    const limit = 2;
    const after = 77695139;
    const response: Trade[] = [
      {
        time: "2019-11-12T19:46:40.935Z",
        trade_id: 77695138,
        price: "8748.91000000",
        size: "0.00267368",
        side: "sell",
      },
      {
        time: "2019-11-12T19:46:30.075Z",
        trade_id: 77695137,
        price: "8749.83000000",
        size: "0.03499187",
        side: "sell",
      },
    ];
    nock(apiUri)
      .get(`/products/${product_id}/trades`)
      .query({ limit, after })
      .reply(200, response);
    const data = await client.getTrades({ after, limit });
    assert.deepStrictEqual(data, response);
  });

  test(".getHistoricRates()", async () => {
    const granularity = 60;
    const end = "2019-11-12T16:40:00-0500";
    const start = "2019-11-12T16:37:00-0500";
    const response: Candle[] = [
      [1573594800, 8767.97, 8777.59, 8767.98, 8769.35, 12.02368428],
      [1573594740, 8758.86, 8767.98, 8758.87, 8767.97, 1.6353693],
      [1573594680, 8758.64, 8758.87, 8758.87, 8758.87, 2.30955483],
      [1573594620, 8758.51, 8759.37, 8758.75, 8758.87, 3.03687967],
    ];
    nock(apiUri)
      .get(`/products/${product_id}/candles`)
      .query({ granularity, start, end })
      .reply(200, response);
    const data = await client.getHistoricRates({ granularity, start, end });
    assert.deepStrictEqual(data, response);
  });

  test(".getHistoricRates() (with no `start` and `end`)", async () => {
    const granularity = 60;
    const response: Candle[] = [
      [1573594800, 8767.97, 8777.59, 8767.98, 8769.35, 12.02368428],
      [1573594740, 8758.86, 8767.98, 8758.87, 8767.97, 1.6353693],
    ];
    nock(apiUri)
      .get(`/products/${product_id}/candles`)
      .query({ granularity })
      .reply(200, response);
    const data = await client.getHistoricRates({ granularity });
    assert.deepStrictEqual(data, response);
  });

  test(".get24hrStats()", async () => {
    const response: ProductStats = {
      open: "0.02167000",
      high: "0.02169000",
      low: "0.02101000",
      volume: "12454.23017859",
      last: "0.02115000",
      volume_30day: "392055.30746805",
    };
    nock(apiUri).get(`/products/${product_id}/stats`).reply(200, response);
    const data = await client.get24hrStats({ product_id });
    assert.deepStrictEqual(data, response);
  });

  test(".get24hrStats() (with no arguments)", async () => {
    const response: ProductStats = {
      open: "0.02167000",
      high: "0.02169000",
      low: "0.02101000",
      volume: "12454.23017859",
      last: "0.02115000",
      volume_30day: "392055.30746805",
    };
    nock(apiUri).get(`/products/${product_id}/stats`).reply(200, response);
    const data = await client.get24hrStats();
    assert.deepStrictEqual(data, response);
  });

  test(".getCurrencies()", async () => {
    const response: CurrencyInfo[] = [
      {
        id: "USDC",
        name: "USD Coin",
        min_size: "0.000001",
        status: "online",
        message: "",
        details: {
          type: "crypto",
          symbol: "$",
          network_confirmations: 35,
          sort_order: 80,
          crypto_address_link:
            "https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48?a={{address}}",
          crypto_transaction_link: "https://etherscan.io/tx/0x{{txId}}",
          push_payment_methods: ["crypto"],
          group_types: ["stablecoin", "usdc", "crypto"],
        },
        max_precision: "0.000001",
        convertible_to: ["USD"],
      },
      {
        id: "DASH",
        name: "Dash",
        min_size: "1",
        status: "online",
        message: null,
        details: {
          type: "crypto",
          network_confirmations: 2,
          sort_order: 47,
          crypto_address_link: "https://chain.so/address/DASH/{{address}}",
          crypto_transaction_link: "https://chain.so/tx/DASH/{{address}}",
          push_payment_methods: ["crypto"],
          min_withdrawal_amount: 0.01,
        },
        max_precision: "0.00000001",
      },
    ];
    nock(apiUri).get("/currencies").reply(200, response);
    const data = await client.getCurrencies();
    assert.deepStrictEqual(data, response);
  });

  test(".getCurrency()", async () => {
    const id = "BTC";
    const response: CurrencyInfo = {
      id: "BTC",
      name: "Bitcoin",
      min_size: "0.00000001",
      status: "online",
      max_precision: "0.01",
      message: "",
      details: {
        type: "crypto",
        symbol: "₿",
        network_confirmations: 3,
        sort_order: 3,
        crypto_address_link:
          "https://live.blockcypher.com/btc/address/{{address}}",
        crypto_transaction_link: "https://live.blockcypher.com/btc/tx/{{txId}}",
        push_payment_methods: ["crypto"],
        group_types: ["btc", "crypto"],
      },
    };
    nock(apiUri).get(`/currencies/${id}`).reply(200, response);
    const data = await client.getCurrency({ id });
    assert.deepStrictEqual(data, response);
  });

  test(".getTime()", async () => {
    const response: Time = {
      iso: "2019-11-13T10:16:24.124Z",
      epoch: 1573640184.124,
    };
    nock(apiUri).get("/time").reply(200, response);
    const data = await client.getTime();
    assert.deepStrictEqual(data, response);
  });
});
