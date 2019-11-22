import * as assert from "assert";
import * as nock from "nock";
import {
  AuthenticatedClient,
  DefaultHeaders,
  Account,
  AccountHistory,
  AccountHold,
  OrderParams,
  OrderInfo,
  Fill,
  DepositParams,
  DepositInfo,
  DepositCoinbaseParams,
  WithdrawCryptoParams,
  ConvertParams,
  Conversion
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

  test(".cancelOrder() (using `client_oid`)", async () => {
    const client_oid = "144c6f8e-713f-4682-8435-5280fbe8b2b4";
    const response = "254b263a-dc33-4eaf-88e8-0e0df212856d";
    nock(apiUri)
      .delete("/orders/client:" + client_oid)
      .reply(200, response);
    const data = await client.cancelOrder({ client_oid });
    assert.deepStrictEqual(data, response);
  });

  test(".cancelOrder() (using `id`)", async () => {
    const id = "254b263a-dc33-4eaf-88e8-0e0df212856d";
    nock(apiUri)
      .delete("/orders/" + id)
      .reply(200, id);
    const data = await client.cancelOrder({ id });
    assert.deepStrictEqual(data, id);
  });

  test(".cancelAll()", async () => {
    const response = ["71452118-efc7-4cc4-8780-a5e22d4baa53"];
    nock(apiUri)
      .delete("/orders")
      .reply(200, response);
    const data = await client.cancelAll();
    assert.deepStrictEqual(data, response);
  });

  test(".cancelAll() (using `product_id`)", async () => {
    const product_id = "BTC-USD";
    const response = ["71452118-efc7-4cc4-8780-a5e22d4baa53"];
    nock(apiUri)
      .delete("/orders")
      .query({ product_id })
      .reply(200, response);
    const data = await client.cancelAll({ product_id });
    assert.deepStrictEqual(data, response);
  });

  test(".getOrders()", async () => {
    const limit = 2;
    const after = "2019-09-29T19:16:37.991967Z";
    const status = ["done", "rejected"];
    const product_id = "BTC-USD";
    const response: OrderInfo[] = [
      {
        id: "id1",
        price: "20000.00000000",
        size: "1.00000000",
        product_id: "BTC-USD",
        side: "buy",
        type: "limit",
        time_in_force: "GTC",
        post_only: false,
        created_at: "2019-09-29T19:16:34.518011Z",
        done_at: "2019-09-29T19:16:36.305Z",
        done_reason: "filled",
        fill_fees: "0.0000000000000000",
        filled_size: "1.00000000",
        executed_value: "20000.0000000000000000",
        status: "done",
        settled: true
      },
      {
        id: "id2",
        price: "20000.00000000",
        size: "1.00000000",
        product_id: "BTC-USD",
        side: "buy",
        type: "limit",
        time_in_force: "GTC",
        post_only: false,
        created_at: "2019-09-29T19:16:32.154026Z",
        done_at: "2019-09-29T19:16:33.147Z",
        done_reason: "filled",
        fill_fees: "0.0000000000000000",
        filled_size: "1.00000000",
        executed_value: "20000.0000000000000000",
        status: "done",
        settled: true
      }
    ];
    nock(apiUri)
      .get("/orders")
      .query({ product_id, after, limit, status })
      .reply(200, response);
    const data = await client.getOrders({ after, product_id, limit, status });
    assert.deepStrictEqual(data, response);
  });

  test(".getOrder() (using `id`)", async () => {
    const id = "71452118-efc7-4cc4-8780-a5e22d4baa53";
    const response: OrderInfo = {
      id: "71452118-efc7-4cc4-8780-a5e22d4baa53",
      price: "20000.00000000",
      size: "1.00000000",
      product_id: "BTC-USD",
      side: "buy",
      type: "limit",
      time_in_force: "GTC",
      post_only: false,
      created_at: "2019-09-29T19:16:34.518011Z",
      done_at: "2019-09-29T19:16:36.305Z",
      done_reason: "filled",
      fill_fees: "0.0000000000000000",
      filled_size: "1.00000000",
      executed_value: "20000.0000000000000000",
      status: "done",
      settled: true
    };
    nock(apiUri)
      .get("/orders/" + id)
      .reply(200, response);
    const data = await client.getOrder({ id });
    assert.deepStrictEqual(data, response);
  });

  test(".getOrder() (using `client_oid`)", async () => {
    const client_oid = "71452118-efc7-4cc4-8780-a5e22d4baa53";
    const response: OrderInfo = {
      id: "id",
      price: "10000.00000000",
      size: "1.00000000",
      product_id: "BTC-USD",
      side: "buy",
      type: "limit",
      time_in_force: "GTC",
      post_only: true,
      created_at: "2019-11-22T15:00:06.019834Z",
      reject_reason: "post only",
      fill_fees: "0.0000000000000000",
      filled_size: "0.00000000",
      executed_value: "0.0000000000000000",
      status: "rejected",
      settled: true
    };
    nock(apiUri)
      .get("/orders/client:" + client_oid)
      .reply(200, response);
    const data = await client.getOrder({ client_oid });
    assert.deepStrictEqual(data, response);
  });

  test(".getFills()", async () => {
    const response: Fill[] = [
      {
        created_at: "2019-11-14T10:31:34.255Z",
        trade_id: 1,
        product_id: "BTC-USD",
        order_id: "order_id",
        user_id: "user_id",
        profile_id: "profile_id",
        liquidity: "T",
        price: "8658.14000000",
        size: "0.16000000",
        fee: "2.0779536000000000",
        side: "buy",
        settled: true,
        usd_volume: "1385.3024000000000000"
      },
      {
        created_at: "2019-11-14T10:31:34.255Z",
        trade_id: 2,
        product_id: "BTC-USD",
        order_id: "order_id",
        user_id: "user_id",
        profile_id: "profile_id",
        liquidity: "M",
        price: "8658.14000000",
        size: "0.84000000",
        fee: "10.9092564000000000",
        side: "buy",
        settled: true,
        usd_volume: "7272.8376000000000000"
      }
    ];
    nock(apiUri)
      .get("/fills")
      .query({ product_id })
      .reply(200, response);
    const data = await client.getFills();
    assert.deepStrictEqual(data, response);
  });

  test(".getFills() (using `limit`)", async () => {
    const limit = 2;
    const product_id = "BTC-USD";
    const response: Fill[] = [
      {
        created_at: "2019-11-14T10:31:34.255Z",
        trade_id: 3,
        product_id: "BTC-USD",
        order_id: "order_id",
        user_id: "user_id",
        profile_id: "profile_id",
        liquidity: "T",
        price: "8658.14000000",
        size: "0.16000000",
        fee: "2.0779536000000000",
        side: "buy",
        settled: true,
        usd_volume: "1385.3024000000000000"
      },
      {
        created_at: "2019-11-14T10:31:34.255Z",
        trade_id: 5,
        product_id: "BTC-USD",
        order_id: "order_id",
        user_id: "user_id",
        profile_id: "profile_id",
        liquidity: "T",
        price: "8658.14000000",
        size: "0.84000000",
        fee: "10.9092564000000000",
        side: "buy",
        settled: true,
        usd_volume: "7272.8376000000000000"
      }
    ];
    nock(apiUri)
      .get("/fills")
      .query({ product_id, limit })
      .reply(200, response);
    const data = await client.getFills({ limit, product_id });
    assert.deepStrictEqual(data, response);
  });

  test(".deposit()", async () => {
    const params: DepositParams = {
      amount: 10,
      currency: "USD",
      payment_method_id: "bc677162-d934-5f1a-968c-a496b1c1270b"
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "USD",
      payout_at: "2016-08-20T00:31:09Z"
    };
    nock(apiUri)
      .post("/deposits/payment-method", params)
      .reply(200, response);
    const data = await client.deposit(params);
    assert.deepStrictEqual(data, response);
  });

  test(".depositCoinbase()", async () => {
    const params: DepositCoinbaseParams = {
      amount: 10,
      currency: "BTC",
      coinbase_account_id: "c13cd0fc-72ca-55e9-843b-b84ef628c198"
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "BTC"
    };
    nock(apiUri)
      .post("/deposits/coinbase-account", params)
      .reply(200, response);
    const data = await client.depositCoinbase(params);
    assert.deepStrictEqual(data, response);
  });

  test(".withdraw()", async () => {
    const params: DepositParams = {
      amount: 10,
      currency: "BTC",
      payment_method_id: "bc677162-d934-5f1a-968c-a496b1c1270b"
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "USD",
      payout_at: "2016-08-20T00:31:09Z"
    };
    nock(apiUri)
      .post("/withdrawals/payment-method", params)
      .reply(200, response);
    const data = await client.withdraw(params);
    assert.deepStrictEqual(data, response);
  });

  test(".withdrawCoinbase()", async () => {
    const params: DepositCoinbaseParams = {
      amount: 10,
      currency: "BTC",
      coinbase_account_id: "c13cd0fc-72ca-55e9-843b-b84ef628c198"
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "BTC"
    };
    nock(apiUri)
      .post("/withdrawals/coinbase-account", params)
      .reply(200, response);
    const data = await client.withdrawCoinbase(params);
    assert.deepStrictEqual(data, response);
  });

  test(".withdrawCrypto()", async () => {
    const params: WithdrawCryptoParams = {
      amount: 20000,
      currency: "XRP",
      crypto_address: "r4hzEbkVkAaFyK23ZkgED2LZDAyHTfnBJg",
      no_destination_tag: true
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "20000.00",
      currency: "XRP"
    };
    nock(apiUri)
      .post("/withdrawals/crypto", params)
      .reply(200, response);
    const data = await client.withdrawCrypto(params);
    assert.deepStrictEqual(data, response);
  });

  test(".convert()", async () => {
    const params: ConvertParams = {
      from: "USD",
      to: "USDC",
      amount: 10000
    };
    const response: Conversion = {
      id: "8942caee-f9d5-4600-a894-4811268545db",
      amount: "10000.00",
      from_account_id: "7849cc79-8b01-4793-9345-bc6b5f08acce",
      to_account_id: "105c3e58-0898-4106-8283-dc5781cda07b",
      from: "USD",
      to: "USDC"
    };
    nock(apiUri)
      .post("/conversions", params)
      .reply(200, response);
    const data = await client.convert(params);
    assert.deepStrictEqual(data, response);
  });
});
