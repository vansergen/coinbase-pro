import * as nock from "nock";
import {
  PublicClient,
  DefaultProductID,
  DefaultTimeout,
  DefaultHeaders,
  ApiUri,
  SandboxApiUri,
  ProductInfo,
  OrderBook,
  Ticker,
  Trade,
  Candle,
  ProductStats
} from "../index";
import * as assert from "assert";

const product_id = "ETH-BTC";
const apiUri = "https://api.some-other-uri.com";
const timeout = 20000;
const client = new PublicClient({ product_id, apiUri, timeout });

suite("PublicClient", () => {
  test("constructor", () => {
    assert.deepStrictEqual(client._rpoptions, {
      useQuerystring: true,
      headers: DefaultHeaders,
      baseUrl: apiUri,
      timeout,
      json: true
    });
    assert.deepStrictEqual(client.product_id, product_id);
  });

  test("constructor (default options)", () => {
    const client = new PublicClient();
    assert.deepStrictEqual(client._rpoptions, {
      useQuerystring: true,
      headers: DefaultHeaders,
      baseUrl: ApiUri,
      timeout: DefaultTimeout,
      json: true
    });
    assert.deepStrictEqual(client.product_id, DefaultProductID);
  });

  test("constructor (with sandox flag)", () => {
    const sandbox = true;
    const client = new PublicClient({ product_id, sandbox, timeout });
    assert.deepStrictEqual(client._rpoptions, {
      useQuerystring: true,
      headers: DefaultHeaders,
      baseUrl: SandboxApiUri,
      timeout,
      json: true
    });
    assert.deepStrictEqual(client.product_id, product_id);
  });

  test(".get()", async () => {
    const response = "response";
    const uri = "/products";
    nock(apiUri)
      .get(uri)
      .reply(200, response);
    const data = await client.get({ uri });
    assert.deepStrictEqual(data, response);
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
        status_message: ""
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
        status_message: ""
      }
    ];
    nock(apiUri)
      .get("/products")
      .reply(200, response);
    const data = await client.getProducts();
    assert.deepStrictEqual(data, response);
  });

  test(".getOrderBook()", async () => {
    const response: OrderBook = {
      sequence: 11228249048,
      bids: [["8736.97", "21.90409501", 6]],
      asks: [["8736.98", "1.182", 1]]
    };
    nock(apiUri)
      .get("/products/" + product_id + "/book")
      .reply(200, response);
    const data = await client.getOrderBook();
    assert.deepStrictEqual(data, response);
  });

  test(".getOrderBook() (with level)", async () => {
    const level = 2;
    const response: OrderBook = {
      sequence: 11228259122,
      bids: [
        ["8736.08", "0.73298845", 2],
        ["8735", "1.00456364", 2]
      ],
      asks: [
        ["8736.09", "3.43889621", 3],
        ["8736.3", "0.2", 1]
      ]
    };
    nock(apiUri)
      .get("/products/" + product_id + "/book")
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
      volume: "6079.45359045"
    };
    nock(apiUri)
      .get("/products/" + product_id + "/ticker")
      .reply(200, response);
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
        side: "sell"
      },
      {
        time: "2019-11-12T19:46:30.075Z",
        trade_id: 77695137,
        price: "8749.83000000",
        size: "0.03499187",
        side: "sell"
      }
    ];
    nock(apiUri)
      .get("/products/" + product_id + "/trades")
      .reply(200, response);
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
        side: "sell"
      },
      {
        time: "2019-11-12T19:46:30.075Z",
        trade_id: 77695137,
        price: "8749.83000000",
        size: "0.03499187",
        side: "sell"
      }
    ];
    nock(apiUri)
      .get("/products/" + product_id + "/trades")
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
      [1573594620, 8758.51, 8759.37, 8758.75, 8758.87, 3.03687967]
    ];
    nock(apiUri)
      .get("/products/" + product_id + "/candles")
      .query({ granularity, start, end })
      .reply(200, response);
    const data = await client.getHistoricRates({ granularity, start, end });
    assert.deepStrictEqual(data, response);
  });

  test(".getHistoricRates() (with no `start` and `end`)", async () => {
    const granularity = 60;
    const response: Candle[] = [
      [1573594800, 8767.97, 8777.59, 8767.98, 8769.35, 12.02368428],
      [1573594740, 8758.86, 8767.98, 8758.87, 8767.97, 1.6353693]
    ];
    nock(apiUri)
      .get("/products/" + product_id + "/candles")
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
      volume_30day: "392055.30746805"
    };
    nock(apiUri)
      .get("/products/" + product_id + "/stats")
      .reply(200, response);
    const data = await client.get24hrStats({ product_id });
    assert.deepStrictEqual(data, response);
  });
});
