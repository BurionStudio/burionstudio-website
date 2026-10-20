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
  assert.match(llms, /GET https:\/\/burionstudio\.com\/\?mode=agent/);
  assert.match(llms, /There is no published public API or agent-call endpoint/);
  assert.match(llms, /support@burionstudio\.com/);
  assert.match(llms, /https:\/\/burionstudio\.com\/about/);
  assert.match(llms, /https:\/\/burionstudio\.com\/sitemap\.xml/);
});

test("homepage Organization JSON-LD has a descriptive entity and public contact point", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  assert.ok(match, "JSON-LD script should exist");

  const data = JSON.parse(match[1]);
  const organization = data["@graph"].find((item) => item["@type"] === "Organization");
  assert.ok(organization);
  assert.match(organization.description, /game development and software studio/i);
  assert.equal(organization.contactPoint.contactType, "customer support");
  assert.equal(organization.contactPoint.email, "support@burionstudio.com");
});

test("trust pages have canonical URLs and substantial first-party content", async () => {
  for (const [filename, canonical, heading] of [
    ["about.html", "https://burionstudio.com/about", "About Burion Studio"],
    ["contact.html", "https://burionstudio.com/contact", "Contact Burion Studio"],
    ["privacy.html", "https://burionstudio.com/privacy", "Privacy Policy"],
    ["terms.html", "https://burionstudio.com/terms", "Terms of Use"]
  ]) {
    const html = await readFile(new URL(`../${filename}`, import.meta.url), "utf8");
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical.replace(/[.*+?^${}()|[\]\\\\]/g, "\\$&")}"`));
    assert.ok(html.length > 500, `${filename} should have at least 500 characters`);
    assert.ok(html.includes(`<h1>${heading}</h1>`), `${filename} should have the expected heading`);
  }
});

test("sitemap lists canonical trust pages and the agent discovery file remains linked", async () => {
  const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");
  for (const path of ["/about", "/contact", "/privacy"]) {
    assert.ok(sitemap.includes(`https://burionstudio.com${path}`), `sitemap should include ${path}`);
  }
  const llms = await readFile(new URL("../llms.txt", import.meta.url), "utf8");
  assert.ok(llms.includes("https://burionstudio.com/sitemap.xml"));
});


test("robots policy separates search access from model-training crawlers", async () => {
  const robots = await readFile(new URL("../robots.txt", import.meta.url), "utf8");

  assert.match(robots, /^User-agent: Googlebot\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: Google-Extended\s*\nDisallow: \/$/mi);
  assert.match(robots, /^User-agent: OAI-SearchBot\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: GPTBot\s*\nDisallow: \/$/mi);
  assert.match(robots, /^User-agent: Claude-SearchBot\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: Claude-User\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: ClaudeBot\s*\nDisallow: \/$/mi);
  assert.match(robots, /Content-Signal: ai-train=no, search=yes, ai-input=yes/);
});

test("font declarations register requested DM Sans weights and exclude unused Playfair 700", async () => {
  const fonts = await readFile(new URL("../css/fonts.css", import.meta.url), "utf8");
  const assetsIgnore = await readFile(new URL("../.assetsignore", import.meta.url), "utf8");
  const weights = [...fonts.matchAll(/font-family:\s*['"]DM Sans['"];[\s\S]*?font-weight:\s*(\d+)/g)].map((match) => Number(match[1]));

  for (const weight of [400, 500, 600, 700]) {
    assert.ok(weights.includes(weight), `DM Sans weight ${weight} should be registered`);
  }
  assert.match(fonts, /font-family:\s*['"]Playfair Display['"];[\s\S]*?font-weight:\s*600/);
  assert.match(assetsIgnore, /^assets\/fonts\/playfair-display-700\.woff2$/m);
});

test("homepage ?mode=agent returns structured JSON with honest API and authentication details", async () => {
  const request = new Request("https://burionstudio.com/?mode=agent");
  const response = await worker.fetch(request, makeEnv(200, "<html>marketing homepage</html>"));

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json; charset=utf-8$/i);
  assert.match(response.headers.get("cache-control") ?? "", /max-age=300/);
  assert.match(response.headers.get("vary") ?? "", /Accept/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);

  const data = await response.json();
  assert.equal(data.kind, "agent-mode");
  assert.equal(data.site.url, "https://burionstudio.com/");
  assert.equal(data.authentication.required_for_public_resources, false);
  assert.deepEqual(data.api.endpoints, []);
  assert.equal(data.api.available, false);
  assert.ok(data.endpoints.some((endpoint) => endpoint.url === "https://burionstudio.com/llms.txt"));
  assert.ok(data.capabilities.some((capability) => capability.id === "markdown_content_negotiation" && capability.available));
  assert.ok(data.capabilities.some((capability) => capability.id === "remote_actions_or_product_execution" && !capability.available));
  assert.ok(data.projects.some((project) => project.name === "Trivia" && project.status === "in_development"));
});

test("homepage without mode=agent keeps the regular HTML asset response", async () => {
  const response = await worker.fetch(
    new Request("https://burionstudio.com/"),
    makeEnv(200, "<html>marketing homepage</html>")
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /text\/html/i);
  assert.equal(await response.text(), "<html>marketing homepage</html>");
});

test("homepage HEAD ?mode=agent returns JSON headers without a response body", async () => {
  const response = await worker.fetch(
    new Request("https://burionstudio.com/?mode=agent", { method: "HEAD" }),
    makeEnv(200)
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^application\/json; charset=utf-8$/i);
  assert.equal(await response.text(), "");
});
