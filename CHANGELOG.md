# Changelog

## [3.3.0](https://github.com/vansergen/coinbase-pro/compare/v3.2.0...v3.3.0) (2021-03-07)

### Features

- add the `feeEstimate` method ([1b046de](https://github.com/vansergen/coinbase-pro/commit/1b046dee038af0d2c754cffd08a1fa414f6fc2b6))

### Dependencies

- upgrade `rpc-request` to `v5.0.3` ([8a888c2](https://github.com/vansergen/coinbase-pro/commit/8a888c2dbc7f4ad7beee528314298afba94d60b6))
- upgrade `ws` to `v7.4.4` ([b19a370](https://github.com/vansergen/coinbase-pro/commit/b19a370c10924c2c4ac72a7fa4500b8bbf4e1507))

## [3.2.0](https://github.com/vansergen/coinbase-pro/compare/v3.1.1...v3.2.0) (2021-02-15)

### Features

- add the `getCurrency` method ([284e146](https://github.com/vansergen/coinbase-pro/commit/284e14683645c8b3018ead538c7dd933fa052a30))

### [3.1.1](https://github.com/vansergen/coinbase-pro/compare/v3.1.0...v3.1.1) (2021-02-14)

### Dependencies

- upgrade `rpc-request` to `v5.0.2` ([61ff8ed](https://github.com/vansergen/coinbase-pro/commit/61ff8ed89cb2d512d9ffb06fee297eef46f5f94d))

## [3.1.0](https://github.com/vansergen/coinbase-pro/compare/v3.0.0...v3.1.0) (2021-02-08)

### Features

- add the `getProduct` method ([da35a92](https://github.com/vansergen/coinbase-pro/commit/da35a924e102eaa4d72792fdd26bdc00210af530))

## [3.0.0](https://github.com/vansergen/coinbase-pro/compare/v2.0.1...v3.0.0) (2021-02-07)

### ⚠ BREAKING CHANGES

- drop Node <14.15.4 support
- methods of the `WebsocketClient` class return promises
- update AuthenticatedClient
- pass `body` as string and `url` as `URL`
- the class `PublicClient` extends `FetchClient`

### Bug Fixes

- package.json, package-lock.json & .snyk to reduce vulnerabilities ([dae8a9c](https://github.com/vansergen/coinbase-pro/commit/dae8a9c1c695b13d7224e8dad7845b51853022e2))
- package.json, package-lock.json & .snyk to reduce vulnerabilities ([b9d4739](https://github.com/vansergen/coinbase-pro/commit/b9d4739eb12b3ad51499e44cdb0626ea3b04c6c5))
- package.json, package-lock.json & .snyk to reduce vulnerabilities ([ec208e4](https://github.com/vansergen/coinbase-pro/commit/ec208e4ad70e3874b33fc838a63e4ab97b2a9f78))
- update AuthenticatedClient ([21767ed](https://github.com/vansergen/coinbase-pro/commit/21767edc4fe4bfbc62561983b41765a9945c1de3))
- upgrade @types/ws from 7.2.1 to 7.2.2 ([3b4b16b](https://github.com/vansergen/coinbase-pro/commit/3b4b16b425104d839f5d81d01a808e243ede2cd2))
- upgrade snyk from 1.316.1 to 1.316.2 ([75eae5e](https://github.com/vansergen/coinbase-pro/commit/75eae5e229071ec797cb07606bccbb71de33dc49))
- upgrade snyk from 1.316.1 to 1.316.2 ([2126aef](https://github.com/vansergen/coinbase-pro/commit/2126aef0f3b37308987b8cf459c7e11c8fb85a54))

### Performance Improvements

- methods of the `WebsocketClient` class return promises ([fb79b54](https://github.com/vansergen/coinbase-pro/commit/fb79b5412d1de25766d2b92c8460e18bbc374d6e))
- pass `body` as string and `url` as `URL` ([f299a4e](https://github.com/vansergen/coinbase-pro/commit/f299a4e69a8ab7224378e89e71c75fdd90813287))
- the class `PublicClient` extends `FetchClient` ([60492bb](https://github.com/vansergen/coinbase-pro/commit/60492bb232751a0f862279b4320e98252018dae9))

### Miscellaneous Chores

- drop Node <14.15.4 support ([0b52c79](https://github.com/vansergen/coinbase-pro/commit/0b52c79e5d45d46619e153ccc2e1a04ffa6748a9))

### Dependencies

- remove snyk ([9b07bb2](https://github.com/vansergen/coinbase-pro/commit/9b07bb24cd052211d0b28336139796b410d710fd))
- update `rpc-request` to `v5.0.1` ([ac742d3](https://github.com/vansergen/coinbase-pro/commit/ac742d363bb6a0be372d566152ec9207772f4a80))
- upgrade `ws` to `v7.4.3` ([6bf67ac](https://github.com/vansergen/coinbase-pro/commit/6bf67acc70caed4fedfd1d36e1ca4357a8683391))
