import * as assert from "assert";
import * as nock from "nock";
import {
  AuthenticatedClient,
  DefaultHeaders,
  Account,
  AccountHistory,
  AccountHold,
  OrderParams,
  OrderInfo
} from "../index";

const product_id = "ETH-BTC";
const apiUri = "https://api.some-other-uri.com";
const timeout = 20000;
const key = "CoinbaseProAPIKey";
const secret = "CoinbaseProAPISecret";
const passphrase = "CoinbaseProAPIPassphrase";

const client = new AuthenticatedClient({
  key,
  secret,
  passphrase,
  apiUri,
  product_id,
  timeout
});

suite("AuthenticatedClient", () => {
  test("constructor", () => {
    assert.deepStrictEqual(client._rpoptions, {
      useQuerystring: true,
      headers: DefaultHeaders,
      baseUrl: apiUri,
      timeout,
      json: true
    });
    assert.deepStrictEqual(client.product_id, product_id);
    assert.deepStrictEqual(client.key, key);
    assert.deepStrictEqual(client.secret, secret);
    assert.deepStrictEqual(client.passphrase, passphrase);
  });

  test(".request()", async () => {
    const uri = "/accounts";
    const method = "GET";
    const response = "response";
    nock(apiUri)
      .get(uri)
      .reply(200, response);
    const data = await client.request({ uri: "/accounts", method });
    assert.deepStrictEqual(data, response);
  });

  test(".getAccounts()", async () => {
    const response: Account[] = [
      {
        id: "id",
        currency: "USDC",
        balance: "100.2490600000000000",
        available: "100.24906",
        hold: "0.0000000000000000",
        profile_id: "profile_id",
        trading_enabled: true
      },
      {
        id: "id",
        currency: "LINK",
        balance: "0.0000000000000000",
        available: "0",
        hold: "0.0000000000000000",
        profile_id: "profile_id",
        trading_enabled: true
      }
    ];
    nock(apiUri)
      .get("/accounts")
      .reply(200, response);
    const data = await client.getAccounts();
    assert.deepStrictEqual(data, response);
  });

  test(".getAccount()", async () => {
    const account_id = "71452118-efc7-4cc4-8780-a5e22d4baa53";
    const response: Account = {
      id: "71452118-efc7-4cc4-8780-a5e22d4baa53",
      currency: "BTC",
      balance: "0.0000000000000000",
      available: "0.0000000000000000",
      hold: "0.0000000000000000",
      profile_id: "75da88c5-05bf-4f54-bc85-5c775bd68254",
      trading_enabled: true
    };
    nock(apiUri)
      .get("/accounts/" + account_id)
      .reply(200, response);
    const data = await client.getAccount({ account_id });
    assert.deepStrictEqual(data, response);
  });

  test(".getAccountHistory()", async () => {
    const account_id = "account_id";
    const after = "100";
    const before = "97";
    const limit = 2;
    const response: AccountHistory[] = [
      {
        created_at: "2019-06-11T18:55:16.086797Z",
        id: "99",
        amount: "-25.0000000000000000",
        balance: "100.3314000000000000",
        type: "match",
        details: {
          order_id: "order_id",
          trade_id: "trade_id",
          product_id: "BAT-USDC"
        }
      },
      {
        created_at: "2019-06-11T18:52:53.599609Z",
        id: "98",
        amount: "-25.0000000000000000",
        balance: "100.3314000000000000",
        type: "match",
        details: {
          order_id: "order_id",
          trade_id: "trade_id",
          product_id: "BAT-USDC"
        }
      }
    ];
    nock(apiUri)
      .get("/accounts/" + account_id + "/ledger")
      .query({ after, before, limit })
      .reply(200, response);
    const data = await client.getAccountHistory({
      account_id,
      after,
      before,
      limit
    });
    assert.deepStrictEqual(data, response);
  });

  test(".getHolds()", async () => {
    const account_id = "account_id";
    const after = "2019-11-13T16:48:43.849988Z";
    const before = "2018-11-13T16:48:43.849988Z";
    const limit = 2;
    const response: AccountHold[] = [
      {
        created_at: "2019-11-13T16:48:43.849988Z",
        id: "id",
        amount: "0.1001500000000000",
        type: "order",
        ref: "ref"
      }
    ];
    nock(apiUri)
      .get("/accounts/" + account_id + "/holds")
      .query({ after, before, limit })
      .reply(200, response);
    const data = await client.getHolds({
      account_id,
      after,
      before,
      limit
    });
    assert.deepStrictEqual(data, response);
  });

  test(".placeOrder()", async () => {
    const params: OrderParams = {
      product_id: "BTC-USD",
      type: "limit",
      side: "sell",
      price: 100000,
      size: 1,
      stop: "loss",
      stop_price: 20000,
      stp: "dc"
    };
    const response: OrderInfo = {
      id: "id",
      price: "100000",
      size: "1",
      product_id: "BTC-USD",
      side: "sell",
      stp: "dc",
      type: "limit",
      time_in_force: "GTC",
      post_only: false,
      created_at: "2019-11-14T08:26:50.846073Z",
      stop: "loss",
      stop_price: "20000",
      fill_fees: "0",
      filled_size: "0",
      executed_value: "0",
      status: "pending",
      settled: false
    };
    nock(apiUri)
      .post("/orders", params)
      .reply(200, response);
    const data = await client.placeOrder(params);
    assert.deepStrictEqual(data, response);
  });
});
