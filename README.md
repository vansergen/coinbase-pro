# coinbase-pro

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
