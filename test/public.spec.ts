import * as nock from "nock";
import {
  PublicClient,
  DefaultProductID,
  DefaultTimeout,
  DefaultHeaders,
  ApiUri,
  SandboxApiUri,
  ProductInfo
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
});
