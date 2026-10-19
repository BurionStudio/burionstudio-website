import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const workerModule = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const worker = workerModule.default;

function makeEnv(status = 404, body = "static response") {
  return {
    ASSETS: {
      fetch: async (request) => new Response(body, {
        status,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      })
    }
  };
}

test("Markdown 404 keeps HTTP 404 and provides a useful Markdown body and discovery links", async () => {
  const request = new Request("https://burionstudio.com/__test-missing-path", {
    headers: { Accept: "text/markdown" }
  });
  const response = await worker.fetch(request, makeEnv(404));

  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") ?? "", /^text\/markdown; charset=utf-8$/i);
  assert.match(response.headers.get("vary") ?? "", /Accept/i);

  const body = await response.text();
  assert.ok(body.length >= 20);
  assert.match(body, /requested page does not exist/i);
  assert.match(body, /https:\/\/burionstudio\.com\/llms\.txt/);
  assert.match(body, /https:\/\/burionstudio\.com\/sitemap\.xml/);
});

test("ordinary non-Markdown 404 remains the original asset response", async () => {
  const request = new Request("https://burionstudio.com/__test-missing-path");
  const response = await worker.fetch(request, makeEnv(404, "original 404"));

  assert.equal(response.status, 404);
  assert.equal(await response.text(), "original 404");
  assert.match(response.headers.get("content-type") ?? "", /text\/html/i);
});

test("mapped pages are served as Markdown with HTTP 200 when requested", async () => {
  const request = new Request("https://burionstudio.com/about", {
    headers: { Accept: "text/markdown" }
  });
  const response = await worker.fetch(request, makeEnv(200));

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/markdown; charset=utf-8$/i);
  assert.match(await response.text(), /# About Burion Studio/);
});

test("legacy .html trust-page URLs redirect to their canonical extensionless paths", async () => {
  for (const [from, to] of [
    ["/about.html", "/about"],
    ["/contact.html", "/contact"],
    ["/privacy.html", "/privacy"],
    ["/terms.html", "/terms"]
  ]) {
    const response = await worker.fetch(
      new Request(`https://burionstudio.com${from}`),
      makeEnv(200)
    );
    assert.equal(response.status, 301, from);
    assert.equal(new URL(response.headers.get("location")).pathname, to, from);
  }
});

test("llms.txt gives concrete agent use cases and honest invocation guidance", async () => {
  const llms = await readFile(new URL("../llms.txt", import.meta.url), "utf8");

  assert.match(llms, /## When to use this site/);
  assert.match(llms, /## How agents should use the site/);
  assert.match(llms, /There is no published public API or agent-call endpoint/);
  assert.match(llms, /support@burionstudio\.com/);
  assert.match(llms, /https:\/\/burionstudio\.com\/about/);
  assert.match(llms, /https:\/\/burionstudio\.com\/sitemap\.xml/);
});
