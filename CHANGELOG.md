# Changelog

## [1.3.0] - 2019-12-23

### Added

- `AuthenticatedClient` methods:
  - `getProfiles`
  - `getProfile`
  - `transfer`

## [1.2.0] - 2019-11-27

### Added

- `WebsocketClient` methods:
  - `connect`
  - `disconnect`
  - `subscribe`
  - `unsubscribe`

### Fixed

- `AuthenticatedClient`

  - `placeOrder` method: allow to omit the `product_id`.

### Added

## [1.1.0] - 2019-11-23

### Added

- `AuthenticatedClient` methods:
  - `getAccounts`
  - `getAccount`
  - `getAccountHistory`
  - `getHolds`
  - `placeOrder`
  - `cancelOrder`
  - `cancelAll`
  - `getOrders`
  - `getOrder`
  - `getFills`
  - `deposit`
  - `depositCoinbase`
  - `withdraw`
  - `withdrawCoinbase`
  - `withdrawCrypto`
  - `convert`
  - `getPaymentMethods`
  - `getCoinbaseAccounts`
  - `getFees`
  - `createReport`
  - `getReport`
  - `getTrailingVolume`

## [1.0.0] - 2019-11-21

### Added

- `PublicClient` methods:
  - `getProducts`
  - `getOrderBook`
  - `getTicker`
  - `getTrades`
  - `getHistoricRates`
  - `get24hrStats`
  - `getCurrencies`
  - `getTime`

[1.3.0]: https://github.com/vansergen/coinbase-pro/releases/tag/v1.3.0
[1.2.0]: https://github.com/vansergen/coinbase-pro/releases/tag/v1.2.0
[1.1.0]: https://github.com/vansergen/coinbase-pro/releases/tag/v1.1.0
[1.0.0]: https://github.com/vansergen/coinbase-pro/releases/tag/v1.0.0
