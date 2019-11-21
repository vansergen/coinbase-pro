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
