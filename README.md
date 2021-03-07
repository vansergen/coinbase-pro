# coinbase-pro-node-api ![CI Status](https://github.com/vansergen/coinbase-pro/workflows/CI/badge.svg) ![npm](https://img.shields.io/npm/v/coinbase-pro-node-api) [![Coverage Status](https://coveralls.io/repos/github/vansergen/coinbase-pro/badge.svg?branch=master)](https://coveralls.io/github/vansergen/coinbase-pro?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/vansergen/coinbase-pro/badge.svg)](https://snyk.io/test/github/vansergen/coinbase-pro) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) ![NPM license](https://img.shields.io/npm/l/coinbase-pro-node-api) ![node version](https://img.shields.io/node/v/coinbase-pro-node-api) ![npm downloads](https://img.shields.io/npm/dt/coinbase-pro-node-api) ![GitHub top language](https://img.shields.io/github/languages/top/vansergen/coinbase-pro)

Node.js library for [Coinbase Pro](https://pro.coinbase.com/)

## Installation

```bash
npm install coinbase-pro-node-api
```

## Usage

### PublicClient

```typescript
import { PublicClient } from "coinbase-pro-node-api";
const sandbox = true;
const client = new PublicClient({ sandbox });
```

- [`getProducts`](https://docs.pro.coinbase.com/#get-products)

```typescript
const products = await client.getProducts();
```

- [`getProduct`](https://docs.pro.coinbase.com/#get-single-product)

```typescript
const product_id = "ETH-BTC";
const product = await client.getProduct({ product_id });
```

- [`getOrderBook`](https://docs.pro.coinbase.com/#get-product-order-book)

```typescript
const level = 2;
const book = await client.getOrderBook({ level });
```

- [`getTicker`](https://docs.pro.coinbase.com/#get-product-ticker)

```typescript
const product_id = "ETH-BTC";
const ticker = await client.getTicker({ product_id });
```

- [`getTrades`](https://docs.pro.coinbase.com/#get-trades)

```typescript
const product_id = "ETH-BTC";
const limit = 10;
const after = 74;
const trades = await client.getTrades({ product_id, limit, after });
```

- [`getHistoricRates`](https://docs.pro.coinbase.com/#get-historic-rates)

```typescript
const product_id = "ETH-BTC";
const end = "2019-11-12T16:40:00-0500";
const start = "2019-11-12T16:37:00-0500";
const granularity = 60;
const candles = await client.getHistoricRates({
  product_id,
  end,
  start,
  granularity,
});
```

- [`get24hrStats`](https://docs.pro.coinbase.com/#get-24hr-stats)

```typescript
const product_id = "ETH-BTC";
const stats = await client.get24hrStats({ product_id });
```

- [`getCurrencies`](https://docs.pro.coinbase.com/#get-currencies)

```typescript
const currencies = await client.getCurrencies();
```

- [`getCurrency`](https://docs.pro.coinbase.com/#get-a-currency)

```typescript
const id = "BTC";
const currency = await client.getCurrency({ id });
```

- [`getTime`](https://docs.pro.coinbase.com/#time)

```typescript
const time = await client.getTime();
```

### AuthenticatedClient

```typescript
import { AuthenticatedClient } from "coinbase-pro-node-api";
const key = "CoinbaseProAPIKey";
const secret = "CoinbaseProAPISecret";
const passphrase = "CoinbaseProAPIPassphrase";
const client = new AuthenticatedClient({ key, secret, passphrase });
```

- [`getAccounts`](https://docs.pro.coinbase.com/#list-accounts)

```typescript
const accounts = await client.getAccounts();
```

- [`getAccount`](https://docs.pro.coinbase.com/#get-an-account)

```typescript
const account_id = "71452118-efc7-4cc4-8780-a5e22d4baa53";
const account = await client.getAccount({ account_id });
```

- [`getAccountHistory`](https://docs.pro.coinbase.com/#get-account-history)

```typescript
const account_id = "71452118-efc7-4cc4-8780-a5e22d4baa53";
const after = "100";
const limit = 5;
const history = await client.getAccountHistory({ account_id, after, limit });
```

- [`getHolds`](https://docs.pro.coinbase.com/#get-holds)

```typescript
const account_id = "71452118-efc7-4cc4-8780-a5e22d4baa53";
const after = "2019-11-22T14:33:58.093436Z";
const before = "2019-11-21T14:33:58.093436Z";
const limit = 40;
const holds = await client.getHolds({ account_id, after, before, limit });
```

- [`placeOrder`](https://docs.pro.coinbase.com/#place-a-new-order)

```typescript
const client_oid = "71452118-efc7-4cc4-8780-a5e22d4baa53";
const type = "limit";
const side = "buy";
const product_id = "BTC-USD";
const stp = "cb";
const price = 10000;
const size = 1;
const post_only = true;
const cancel_after = "hour";
const order = await client.placeOrder({
  client_oid,
  type,
  side,
  product_id,
  stp,
  price,
  size,
  post_only,
  cancel_after,
});
```

- [`cancelOrder`](https://docs.pro.coinbase.com/#cancel-an-order)

```typescript
const id = "71452118-efc7-4cc4-8780-a5e22d4baa53";
let result = await client.cancelOrder({ id });
// or by `client_oid`
const client_oid = "5523db2a-f6cb-4680-86a5-23ff21d9f514";
result = await client.cancelOrder({ client_oid });
```

- [`cancelAll`](https://docs.pro.coinbase.com/#cancel-all)

```typescript
const product_id = "BTC-USD";
const result = await client.cancelAll({ product_id });
```

- [`getOrders`](https://docs.pro.coinbase.com/#list-orders)

```typescript
const limit = 2;
const after = "2019-09-29T19:16:37.991967Z";
const status = ["done", "rejected"];
const product_id = "BTC-USD";
const orders = await client.getOrders({ after, product_id, limit, status });
```

- [`getOrder`](https://docs.pro.coinbase.com/#get-an-order)

```typescript
const id = "71452118-efc7-4cc4-8780-a5e22d4baa53";
let order = await client.getOrder({ id });
// or by `client_oid`
const client_oid = "5523db2a-f6cb-4680-86a5-23ff21d9f514";
order = await client.getOrder({ client_oid });
```

- [`getFills`](https://docs.pro.coinbase.com/#list-fills)

```typescript
const product_id = "BTC-ETH";
const before = 74;
const fills = await client.getFills({ product_id, before });
```

- [`deposit`](https://docs.pro.coinbase.com/#payment-method)

```typescript
const amount = 10000;
const currency = "USD";
const payment_method_id = "bc677162-d934-5f1a-968c-a496b1c1270b";
const deposit = await client.deposit({ amount, currency, payment_method_id });
```

- [`depositCoinbase`](https://docs.pro.coinbase.com/#coinbase)

```typescript
const amount = 10;
const currency = "BTC";
const coinbase_account_id = "c13cd0fc-72ca-55e9-843b-b84ef628c198";
const deposit = await client.depositCoinbase({
  amount,
  currency,
  coinbase_account_id,
});
```

- [`withdraw`](https://docs.pro.coinbase.com/#payment-method45)

```typescript
const amount = 10000;
const currency = "USD";
const payment_method_id = "bc677162-d934-5f1a-968c-a496b1c1270b";
const withdraw = await client.withdraw({ amount, currency, payment_method_id });
```

- [`withdrawCoinbase`](https://docs.pro.coinbase.com/#coinbase46)

```typescript
const amount = 10;
const currency = "BTC";
const coinbase_account_id = "c13cd0fc-72ca-55e9-843b-b84ef628c198";
const withdraw = await client.withdrawCoinbase({
  amount,
  currency,
  coinbase_account_id,
});
```

- [`withdrawCrypto`](https://docs.pro.coinbase.com/#crypto)

```typescript
const amount = 20000;
const currency = "XRP";
const crypto_address = "r4hzEbkVkAaFyK23ZkgED2LZDAyHTfnBJg";
const no_destination_tag = true;
const withdraw = await client.withdrawCrypto({
  amount,
  currency,
  crypto_address,
  no_destination_tag,
});
```

- [`feeEstimate`](https://docs.pro.coinbase.com/#fee-estimate)

```typescript
const currency = "ETH";
const crypto_address = "0x5ad5769cd04681FeD900BCE3DDc877B50E83d469";
const estimate = await client.feeEstimate({ currency, crypto_address });
```

- [`convert`](https://docs.pro.coinbase.com/#create-conversion)

```typescript
const amount = 100;
const from = "USD";
const to = "USDC";
const conversion = await client.convert({ amount, from, to });
```

- [`getPaymentMethods`](https://docs.pro.coinbase.com/#list-payment-methods)

```typescript
const methods = await client.getPaymentMethods();
```

- [`getCoinbaseAccounts`](https://docs.pro.coinbase.com/#list-accounts53)

```typescript
const accounts = await client.getCoinbaseAccounts();
```

- [`getFees`](https://docs.pro.coinbase.com/#get-current-fees)

```typescript
const fees = await client.getFees();
```

- [`createReport`](https://docs.pro.coinbase.com/#create-a-new-report)

```typescript
const type = "fills";
const start_date = "2019-01-01T00:00:00.000Z";
const end_date = "2019-11-30T23:59:59.000Z";
const report = await client.createReport({ type, start_date, end_date });
```

- [`getReport`](https://docs.pro.coinbase.com/#get-report-status)

```typescript
const id = "0428b97b-bec1-429e-a94c-59232926778d";
const report = await client.getReport({ id });
```

- [`getProfiles`](https://docs.pro.coinbase.com/#list-profiles)

```typescript
const profiles = await client.getProfiles();
```

- [`getProfile`](https://docs.pro.coinbase.com/#get-a-profile)

```typescript
const id = "86602c68-306a-4500-ac73-4ce56a91d83c";
const profile = await client.getProfile({ id });
```

- [`transfer`](https://docs.pro.coinbase.com/#create-profile-transfer)

```typescript
const from = "86602c68-306a-4500-ac73-4ce56a91d83c";
const to = "e87429d3-f0a7-4f28-8dff-8dd93d383de1";
const currency = "ETH";
const amount = 100;
const result = await client.transfer({ from, to, currency, amount });
```

- [`getTrailingVolume`](https://docs.pro.coinbase.com/#user-account)

```typescript
const volume = await client.getTrailingVolume();
```

### WebsocketClient

```typescript
import { WebsocketClient } from "coinbase-pro-node-api";
const sandbox = false;
const key = "CoinbaseProAPIKey";
const secret = "CoinbaseProAPISecret";
const passphrase = "CoinbaseProAPIPassphrase";
const channels = [
  { name: "status" },
  { name: "ticker", product_ids: ["BTC-USD"] },
];
const websocket = new WebsocketClient({
  key,
  secret,
  passphrase,
  channels,
  sandbox,
});
```

- [`connect`](https://docs.pro.coinbase.com/#websocket-feed)

```typescript
await websocket.connect();
```

- [`disconnect`](https://docs.pro.coinbase.com/#websocket-feed)

```typescript
await websocket.disconnect();
```

- [`subscribe`](https://docs.pro.coinbase.com/#subscribe)

```typescript
const channels = [
  { name: "heartbeat", product_ids: ["ETH-USD"] },
  { name: "ticker", product_ids: ["ETH-EUR"] },
  { name: "status" },
];
await websocket.subscribe({ channels });
```

- [`unsubscribe`](https://docs.pro.coinbase.com/#subscribe)

```typescript
const channels = [{ name: "ticker", product_ids: ["ETH-USD", "ETH-EUR"] }];
await websocket.unsubscribe({ channels });
```
