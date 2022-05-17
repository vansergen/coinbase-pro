import { deepStrictEqual } from "node:assert";

import { Signer } from "../index.js";

suite("Signer", () => {
  test("Correct signature", () => {
    const passphrase = "3628c235c9b5";
    const key = "0c9618dbe16af57d9316a6cc78f431cc";
    const secret =
      "QiM6irV9cW5NJo3xei+MLD0a4GLnsz+HSFwucGXdt+c8gZwRUxTltMfh09w8pZ2VHXKdM8LzqxhaMUg4WHSsvQ==";
    const method = "POST";
    const from = "86602c68-306a-4500-ac73-4ce56a91d83c";
    const to = "e87429d3-f0a7-4f28-8dff-8dd93d383de1";
    const currency = "ETH";
    const amount = 100;
    const body = { from, to, currency, amount };
    const url = new URL("/profiles/transfer", "http://www.example.com/");
    const timestamp = 1573653521.402;
    const signature = Signer({
      passphrase,
      key,
      secret,
      method,
      url,
      body: JSON.stringify(body),
      timestamp,
    });
    const sign = "xBQCYBLmE0rX9tKUzNL4vgeuX7kIlpMdqILMftUiFzU=";
    const expectedSignature = {
      "CB-ACCESS-KEY": key,
      "CB-ACCESS-SIGN": sign,
      "CB-ACCESS-TIMESTAMP": `${timestamp}`,
      "CB-ACCESS-PASSPHRASE": passphrase,
    };
    deepStrictEqual(signature, expectedSignature);
  });

  test("Correct signature (no body)", () => {
    const passphrase = "3628c235c9b5";
    const key = "0c9618dbe16af57d9316a6cc78f431cc";
    const secret =
      "QiM6irV9cW5NJo3xei+MLD0a4GLnsz+HSFwucGXdt+c8gZwRUxTltMfh09w8pZ2VHXKdM8LzqxhaMUg4WHSsvQ==";
    const method = "GET";
    const url = new URL("/accounts", "http://www.example.com/");
    const timestamp = 1573653521.402;
    const signature = Signer({
      passphrase,
      key,
      secret,
      method,
      url,
      timestamp,
    });
    const sign = "7fF/Orhb4TQmCJ+nQ3f/q25/4ZU3kwDGCkOr/JyG4jA=";
    const expectedSignature = {
      "CB-ACCESS-KEY": key,
      "CB-ACCESS-SIGN": sign,
      "CB-ACCESS-TIMESTAMP": `${timestamp}`,
      "CB-ACCESS-PASSPHRASE": passphrase,
    };
    deepStrictEqual(signature, expectedSignature);
  });

  test("Correct signature (body is an empty string)", () => {
    const passphrase = "3628c235c9b5";
    const key = "0c9618dbe16af57d9316a6cc78f431cc";
    const secret =
      "QiM6irV9cW5NJo3xei+MLD0a4GLnsz+HSFwucGXdt+c8gZwRUxTltMfh09w8pZ2VHXKdM8LzqxhaMUg4WHSsvQ==";
    const method = "GET";
    const url = new URL("/users/self/verify", "http://www.example.com/");
    const body = "";
    const timestamp = 1573653521.402;
    const signature = Signer({
      passphrase,
      key,
      secret,
      method,
      url,
      body,
      timestamp,
    });
    const sign = "EMszpon/Yv43GqmRLemmJgTBB2i5YRWnKV0+gXUe8Xc=";
    const expectedSignature = {
      "CB-ACCESS-KEY": key,
      "CB-ACCESS-SIGN": sign,
      "CB-ACCESS-TIMESTAMP": `${timestamp}`,
      "CB-ACCESS-PASSPHRASE": passphrase,
    };
    deepStrictEqual(signature, expectedSignature);
  });
});
