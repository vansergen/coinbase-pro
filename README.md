# coinbase-pro [![Build Status](https://travis-ci.com/vansergen/coinbase-pro.svg?token=cg5dVMovG8Db6p5Qzzps&branch=master)](https://travis-ci.com/vansergen/coinbase-pro)

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
  granularity
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
