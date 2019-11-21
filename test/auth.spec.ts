import * as assert from "assert";
import * as nock from "nock";
import { AuthenticatedClient, DefaultHeaders } from "../index";

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
});
