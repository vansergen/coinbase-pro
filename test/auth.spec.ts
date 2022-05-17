import { deepStrictEqual, rejects } from "node:assert";
import nock from "nock";

import {
  AuthenticatedClient,
  Account,
  AccountHistory,
  AccountHold,
  OrderParams,
  OrderInfo,
  Fill,
  DepositParams,
  DepositInfo,
  EstimatedFee,
  DepositCoinbaseParams,
  WithdrawCryptoParams,
  ConvertParams,
  Conversion,
  PaymentMethod,
  CoinbaseAccount,
  Fees,
  ReportParams,
  BaseReportStatus,
  ReportStatus,
  Profile,
  TrailingVolume,
} from "../index.js";

const product_id = "ETH-BTC";
const apiUri = "https://api.some-other-uri.com";
const key = "CoinbaseProAPIKey";
const secret = "CoinbaseProAPISecret";
const passphrase = "CoinbaseProAPIPassphrase";
const client = new AuthenticatedClient({
  key,
  secret,
  passphrase,
  apiUri,
  product_id,
});

suite("AuthenticatedClient", () => {
  test("constructor", () => {
    deepStrictEqual(client.product_id, product_id);
    deepStrictEqual(client.apiUri, new URL(apiUri));
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
        trading_enabled: true,
      },
      {
        id: "id",
        currency: "LINK",
        balance: "0.0000000000000000",
        available: "0",
        hold: "0.0000000000000000",
        profile_id: "profile_id",
        trading_enabled: true,
      },
    ];
    nock(apiUri).get("/accounts").reply(200, response);
    const data = await client.getAccounts();
    deepStrictEqual(data, response);
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
      trading_enabled: true,
    };
    nock(apiUri).get(`/accounts/${account_id}`).reply(200, response);
    const data = await client.getAccount({ account_id });
    deepStrictEqual(data, response);
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
          product_id: "BAT-USDC",
        },
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
          product_id: "BAT-USDC",
        },
      },
    ];
    nock(apiUri)
      .get(`/accounts/${account_id}/ledger`)
      .query({ after, before, limit })
      .reply(200, response);
    const data = await client.getAccountHistory({
      account_id,
      after,
      before,
      limit,
    });
    deepStrictEqual(data, response);
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
        ref: "ref",
      },
    ];
    nock(apiUri)
      .get(`/accounts/${account_id}/holds`)
      .query({ after, before, limit })
      .reply(200, response);
    const data = await client.getHolds({
      account_id,
      after,
      before,
      limit,
    });
    deepStrictEqual(data, response);
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
      stp: "dc",
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
      settled: false,
    };
    nock(apiUri)
      .post("/orders", { ...params })
      .reply(200, response);
    const data = await client.placeOrder(params);
    deepStrictEqual(data, response);
  });

  test(".placeOrder() (with missing `product_id`)", async () => {
    const params: OrderParams = {
      type: "limit",
      side: "sell",
      price: 100000,
      size: 1,
      stop: "loss",
      stop_price: 20000,
      stp: "dc",
    };
    const response: OrderInfo = {
      id: "id",
      price: "100000",
      size: "1",
      product_id: "ETH-BTC",
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
      settled: false,
    };
    nock(apiUri)
      .post("/orders", { ...params, product_id })
      .reply(200, response);
    const data = await client.placeOrder(params);
    deepStrictEqual(data, response);
  });

  test(".cancelOrder() (using `client_oid`)", async () => {
    const client_oid = "144c6f8e-713f-4682-8435-5280fbe8b2b4";
    const response = ["254b263a-dc33-4eaf-88e8-0e0df212856d"];
    nock(apiUri).delete(`/orders/client:${client_oid}`).reply(200, response);
    const data = await client.cancelOrder({ client_oid });
    deepStrictEqual(data, response);
  });

  test(".cancelOrder() (using `id`)", async () => {
    const id = "254b263a-dc33-4eaf-88e8-0e0df212856d";
    nock(apiUri).delete(`/orders/${id}`).reply(200, [id]);
    const data = await client.cancelOrder({ id });
    deepStrictEqual(data, [id]);
  });

  test(".cancelAll()", async () => {
    const response = ["71452118-efc7-4cc4-8780-a5e22d4baa53"];
    nock(apiUri).delete("/orders").reply(200, response);
    const data = await client.cancelAll();
    deepStrictEqual(data, response);
  });

  test(".cancelAll() (using `product_id`)", async () => {
    const _product_id = "BTC-USD";
    const response = ["71452118-efc7-4cc4-8780-a5e22d4baa53"];
    nock(apiUri)
      .delete("/orders")
      .query({ product_id: _product_id })
      .reply(200, response);
    const data = await client.cancelAll({ product_id: _product_id });
    deepStrictEqual(data, response);
  });

  test(".getOrders()", async () => {
    const limit = 2;
    const after = "2019-09-29T19:16:37.991967Z";
    const status = ["done", "rejected"];
    const _product_id = "BTC-USD";
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
        settled: true,
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
        settled: true,
      },
    ];
    nock(apiUri)
      .get("/orders")
      .query({ product_id: _product_id, after, limit, status })
      .reply(200, response);
    const data = await client.getOrders({
      after,
      product_id: _product_id,
      limit,
      status,
    });
    deepStrictEqual(data, response);
  });

  test(".getOrders() (with no arguments)", async () => {
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
        settled: true,
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
        settled: true,
      },
    ];
    nock(apiUri).get("/orders").reply(200, response);
    const data = await client.getOrders();
    deepStrictEqual(data, response);
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
      settled: true,
    };
    nock(apiUri).get(`/orders/${id}`).reply(200, response);
    const data = await client.getOrder({ id });
    deepStrictEqual(data, response);
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
      settled: true,
    };
    nock(apiUri).get(`/orders/client:${client_oid}`).reply(200, response);
    const data = await client.getOrder({ client_oid });
    deepStrictEqual(data, response);
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
        usd_volume: "1385.3024000000000000",
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
        usd_volume: "7272.8376000000000000",
      },
    ];
    nock(apiUri).get("/fills").query({ product_id }).reply(200, response);
    const data = await client.getFills();
    deepStrictEqual(data, response);
  });

  test(".getFills() (using `limit`)", async () => {
    const limit = 2;
    const _product_id = "BTC-USD";
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
        usd_volume: "1385.3024000000000000",
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
        usd_volume: "7272.8376000000000000",
      },
    ];
    nock(apiUri)
      .get("/fills")
      .query({ product_id: _product_id, limit })
      .reply(200, response);
    const data = await client.getFills({ limit, product_id: _product_id });
    deepStrictEqual(data, response);
  });

  test(".deposit()", async () => {
    const params: DepositParams = {
      amount: 10,
      currency: "USD",
      payment_method_id: "bc677162-d934-5f1a-968c-a496b1c1270b",
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "USD",
      payout_at: "2016-08-20T00:31:09Z",
    };
    nock(apiUri)
      .post("/deposits/payment-method", { ...params })
      .reply(200, response);
    const data = await client.deposit(params);
    deepStrictEqual(data, response);
  });

  test(".depositCoinbase()", async () => {
    const params: DepositCoinbaseParams = {
      amount: 10,
      currency: "BTC",
      coinbase_account_id: "c13cd0fc-72ca-55e9-843b-b84ef628c198",
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "BTC",
    };
    nock(apiUri)
      .post("/deposits/coinbase-account", { ...params })
      .reply(200, response);
    const data = await client.depositCoinbase(params);
    deepStrictEqual(data, response);
  });

  test(".withdraw()", async () => {
    const params: DepositParams = {
      amount: 10,
      currency: "BTC",
      payment_method_id: "bc677162-d934-5f1a-968c-a496b1c1270b",
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "USD",
      payout_at: "2016-08-20T00:31:09Z",
    };
    nock(apiUri)
      .post("/withdrawals/payment-method", { ...params })
      .reply(200, response);
    const data = await client.withdraw(params);
    deepStrictEqual(data, response);
  });

  test(".withdrawCoinbase()", async () => {
    const params: DepositCoinbaseParams = {
      amount: 10,
      currency: "BTC",
      coinbase_account_id: "c13cd0fc-72ca-55e9-843b-b84ef628c198",
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "10.00",
      currency: "BTC",
    };
    nock(apiUri)
      .post("/withdrawals/coinbase-account", { ...params })
      .reply(200, response);
    const data = await client.withdrawCoinbase(params);
    deepStrictEqual(data, response);
  });

  test(".withdrawCrypto()", async () => {
    const params: WithdrawCryptoParams = {
      amount: 20000,
      currency: "XRP",
      crypto_address: "r4hzEbkVkAaFyK23ZkgED2LZDAyHTfnBJg",
      no_destination_tag: true,
    };
    const response: DepositInfo = {
      id: "593533d2-ff31-46e0-b22e-ca754147a96a",
      amount: "20000.00",
      currency: "XRP",
    };
    nock(apiUri)
      .post("/withdrawals/crypto", { ...params })
      .reply(200, response);
    const data = await client.withdrawCrypto(params);
    deepStrictEqual(data, response);
  });

  test(".feeEstimate()", async () => {
    const query = {
      currency: "ETH",
      crypto_address: "0x5ad5769cd04681FeD900BCE3DDc877B50E83d469",
    };
    const response: EstimatedFee = { fee: 0.01 };
    nock(apiUri)
      .get("/withdrawals/fee-estimate")
      .query(query)
      .reply(200, response);
    const data = await client.feeEstimate(query);
    deepStrictEqual(data, response);
  });

  test(".convert()", async () => {
    const params: ConvertParams = {
      from: "USD",
      to: "USDC",
      amount: 10000,
    };
    const response: Conversion = {
      id: "8942caee-f9d5-4600-a894-4811268545db",
      amount: "10000.00",
      from_account_id: "7849cc79-8b01-4793-9345-bc6b5f08acce",
      to_account_id: "105c3e58-0898-4106-8283-dc5781cda07b",
      from: "USD",
      to: "USDC",
    };
    nock(apiUri)
      .post("/conversions", { ...params })
      .reply(200, response);
    const data = await client.convert(params);
    deepStrictEqual(data, response);
  });

  test(".getPaymentMethods()", async () => {
    const response: PaymentMethod[] = [
      {
        id: "bc6d7162-d984-5ffa-963c-a493b1c1370b",
        type: "ach_bank_account",
        name: "Bank of America - eBan... ********7134",
        currency: "USD",
        primary_buy: true,
        primary_sell: true,
        allow_buy: true,
        allow_sell: true,
        allow_deposit: true,
        allow_withdraw: true,
        limits: {
          buy: [
            {
              period_in_days: 1,
              total: {
                amount: "10000.00",
                currency: "USD",
              },
              remaining: {
                amount: "10000.00",
                currency: "USD",
              },
            },
          ],
          instant_buy: [
            {
              period_in_days: 7,
              total: {
                amount: "0.00",
                currency: "USD",
              },
              remaining: {
                amount: "0.00",
                currency: "USD",
              },
            },
          ],
          sell: [
            {
              period_in_days: 1,
              total: {
                amount: "10000.00",
                currency: "USD",
              },
              remaining: {
                amount: "10000.00",
                currency: "USD",
              },
            },
          ],
          deposit: [
            {
              period_in_days: 1,
              total: {
                amount: "10000.00",
                currency: "USD",
              },
              remaining: {
                amount: "10000.00",
                currency: "USD",
              },
            },
          ],
        },
      },
    ];
    nock(apiUri).get("/payment-methods").reply(200, response);
    const data = await client.getPaymentMethods();
    deepStrictEqual(data, response);
  });

  test(".getCoinbaseAccounts()", async () => {
    const response: CoinbaseAccount[] = [
      {
        id: "fc3a8a57-7142-542d-8436-95a3d82e1622",
        name: "ETH Wallet",
        balance: "0.00000000",
        currency: "ETH",
        type: "wallet",
        primary: false,
        active: true,
      },
      {
        id: "2ae3354e-f1c3-5771-8a37-6228e9d239db",
        name: "USD Wallet",
        balance: "0.00",
        currency: "USD",
        type: "fiat",
        primary: false,
        active: true,
        wire_deposit_information: {
          account_number: "0199003122",
          routing_number: "026013356",
          bank_name: "Metropolitan Commercial Bank",
          bank_address: "99 Park Ave 4th Fl New York, NY 10016",
          bank_country: {
            code: "US",
            name: "United States",
          },
          account_name: "Coinbase, Inc",
          account_address: "548 Market Street, #23008, San Francisco, CA 94104",
          reference: "BAOCAEUX",
        },
      },
      {
        id: "1bfad868-5223-5d3c-8a22-b5ed371e55cb",
        name: "BTC Wallet",
        balance: "0.00000000",
        currency: "BTC",
        type: "wallet",
        primary: true,
        active: true,
      },
      {
        id: "2a11354e-f133-5771-8a37-622be9b239db",
        name: "EUR Wallet",
        balance: "0.00",
        currency: "EUR",
        type: "fiat",
        primary: false,
        active: true,
        sepa_deposit_information: {
          iban: "EE957700771001355096",
          swift: "LHVBEE22",
          bank_name: "AS LHV Pank",
          bank_address: "Tartu mnt 2, 10145 Tallinn, Estonia",
          bank_country_name: "Estonia",
          account_name: "Coinbase UK, Ltd.",
          account_address:
            "9th Floor, 107 Cheapside, London, EC2V 6DN, United Kingdom",
          reference: "CBAEUXOVFXOXYX",
        },
      },
    ];
    nock(apiUri).get("/coinbase-accounts").reply(200, response);
    const data = await client.getCoinbaseAccounts();
    deepStrictEqual(data, response);
  });

  test(".getFees()", async () => {
    const response: Fees = {
      maker_fee_rate: "0.0000",
      taker_fee_rate: "0.0004",
      usd_volume: "1278902322.97",
    };
    nock(apiUri).get("/fees").reply(200, response);
    const data = await client.getFees();
    deepStrictEqual(data, response);
  });

  test(".createReport()", async () => {
    const params: ReportParams = {
      type: "account",
      start_date: "2019-01-06T10:34:47.000Z",
      end_date: "2019-11-06T10:34:47.000Z",
      account_id: "account_id",
      format: "pdf",
    };
    const response: BaseReportStatus = {
      id: "id",
      type: "account",
      status: "pending",
    };
    nock(apiUri)
      .post("/reports", { ...params })
      .reply(200, response);
    const data = await client.createReport(params);
    deepStrictEqual(data, response);
  });

  test(".createReport() (fils with missing `product_id`)", async () => {
    const params: ReportParams = {
      type: "fills",
      start_date: "2019-01-06T10:34:47.000Z",
      end_date: "2019-11-06T10:34:47.000Z",
      format: "pdf",
      email: "email@email.com",
    };
    const response: BaseReportStatus = {
      id: "id",
      type: "fills",
      status: "pending",
    };
    nock(apiUri)
      .post("/reports", { ...params, product_id })
      .reply(200, response);
    const data = await client.createReport(params);
    deepStrictEqual(data, response);
  });

  test(".createReport() (account with missing `account_id`)", async () => {
    const params: ReportParams = {
      type: "account",
      start_date: "2019-01-06T10:34:47.000Z",
      end_date: "2019-11-06T10:34:47.000Z",
      format: "pdf",
    };
    const error = new Error("`account_id` is missing");
    await rejects(client.createReport(params), error);
  });

  test(".getReport()", async () => {
    const id = "0428b97b-bec1-429e-a94c-59232926778d";
    const response: ReportStatus = {
      id: "0428b97b-bec1-429e-a94c-59232926778d",
      user_id: "5844eceecf7e803e259d0365",
      type: "fills",
      status: "ready",
      created_at: "2015-01-06T10:34:47.000Z",
      completed_at: "2015-01-06T10:35:47.000Z",
      expires_at: "2015-01-13T10:35:47.000Z",
      file_url: "https://example.com/0428b97b.../fills.pdf",
      params: {
        format: "pdf",
        start_date: "2014-11-01T00:00:00.000Z",
        end_date: "2014-11-30T23:59:59.000Z",
        profile_id: "75da88c5-05bf-4f54-bc85-5c775bd68254",
        new_york_state: false,
      },
    };
    nock(apiUri).get(`/reports/${id}`).reply(200, response);
    const data = await client.getReport({ id });
    deepStrictEqual(data, response);
  });

  test(".getProfiles()", async () => {
    const response: Profile[] = [
      {
        id: "86602c68-306a-4500-ac73-4ce56a91d83c",
        user_id: "5844eceecf7e803e259d0365",
        name: "default",
        active: true,
        is_default: true,
        created_at: "2019-11-18T15:08:40.236309Z",
      },
    ];
    nock(apiUri).get("/profiles").reply(200, response);
    const data = await client.getProfiles();
    deepStrictEqual(data, response);
  });

  test(".getProfile()", async () => {
    const id = "86602c68-306a-4500-ac73-4ce56a91d83c";
    const response: Profile = {
      id: "86602c68-306a-4500-ac73-4ce56a91d83c",
      user_id: "5844eceecf7e803e259d0365",
      name: "default",
      active: true,
      is_default: true,
      created_at: "2019-11-18T15:08:40.236309Z",
    };
    nock(apiUri).get(`/profiles/${id}`).reply(200, response);
    const data = await client.getProfile({ id });
    deepStrictEqual(data, response);
  });

  test(".transfer()", async () => {
    const from = "86602c68-306a-4500-ac73-4ce56a91d83c";
    const to = "e87429d3-f0a7-4f28-8dff-8dd93d383de1";
    const currency = "ETH";
    const amount = 100;
    const response = "OK" as const;
    nock(apiUri)
      .post("/profiles/transfer", { from, to, currency, amount })
      .reply(200, response);
    const data = await client.transfer({ from, to, currency, amount });
    deepStrictEqual(data, response);
  });

  test(".getTrailingVolume()", async () => {
    const response: TrailingVolume[] = [
      {
        product_id: "BTC-USD",
        exchange_volume: "11800.00000000",
        volume: "100.00000000",
        recorded_at: "1973-11-29T00:05:01.123456Z",
      },
      {
        product_id: "LTC-USD",
        exchange_volume: "51010.04100000",
        volume: "2010.04100000",
        recorded_at: "1973-11-29T00:05:02.123456Z",
      },
    ];
    nock(apiUri).get("/users/self/trailing-volume").reply(200, response);
    const data = await client.getTrailingVolume();
    deepStrictEqual(data, response);
  });
});
