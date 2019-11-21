import * as nock from "nock";
import {
  PublicClient,
  DefaultProductID,
  DefaultTimeout,
  DefaultHeaders,
  ApiUri,
  SandboxApiUri
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
});
