import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "index.html", "about.html", "contact.html", "privacy.html", "terms.html", "404.html",
  "robots.txt", "sitemap.xml", "llms.txt", "_headers", "_redirects", "script.js", "worker.js",
  "css/site.css", "css/fonts.css", "css/legal.css", ".well-known/security.txt"
];
const canonicalRoutes = new Set(["/", "/about", "/contact", "/privacy", "/terms"]);

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseAttributes(tag) {
  const attrs = {};
  for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

function referencesFrom(value, attributeName) {
  if (attributeName === "srcset" || attributeName === "imagesrcset") {
    return value.split(",").map((entry) => entry.trim().split(/\s+/)[0]).filter(Boolean);
  }
  return [value];
}

function isExternalReference(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value) || value.startsWith("#");
}

async function assertLocalReference(reference, baseDirectory, owner, errors) {
  if (!reference || isExternalReference(reference)) return;

  let parsed;
  try {
    parsed = new URL(reference, "https://local.invalid/");
  } catch {
    errors.push(`${owner}: invalid reference ${reference}`);
    return;
  }

  const pathname = decodeURIComponent(parsed.pathname);
  if (canonicalRoutes.has(pathname) || pathname === "/") return;

  const target = pathname.startsWith("/")
    ? path.resolve(root, "." + pathname)
    : path.resolve(baseDirectory, pathname);

  const relative = path.relative(root, target);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    errors.push(`${owner}: reference escapes repository root: ${reference}`);
    return;
  }

  if (!(await fileExists(target))) errors.push(`${owner}: missing local reference ${reference}`);
}

test("required site and security files are present", async () => {
  const missing = [];
  for (const file of requiredFiles) {
    if (!(await fileExists(path.join(root, file)))) missing.push(file);
  }
  assert.deepEqual(missing, [], `Missing required files: ${missing.join(", ")}`);
});

test("HTML pages have one H1, unique IDs, labelled images, and reserved image dimensions", async () => {
  const files = (await readdir(root)).filter((file) => file.endsWith(".html")).sort();
  assert.ok(files.includes("index.html"));
  assert.ok(files.includes("404.html"));

  for (const file of files) {
    const html = await readFile(path.join(root, file), "utf8");
    const h1Count = [...html.matchAll(/<h1\b/gi)].length;
    assert.equal(h1Count, 1, `${file} should contain exactly one H1`);

    const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file} contains duplicate element IDs`);

    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      const attrs = parseAttributes(match[0]);
      assert.ok(Object.hasOwn(attrs, "alt"), `${file}: every image needs an alt attribute`);
      assert.ok(Number(attrs.width) > 0, `${file}: image width missing or invalid: ${attrs.src ?? "(no src)"}`);
      assert.ok(Number(attrs.height) > 0, `${file}: image height missing or invalid: ${attrs.src ?? "(no src)"}`);
    }

    const fragments = [...html.matchAll(/\bhref=["']#([^"']+)["']/gi)].map((match) => match[1]);
    for (const fragment of fragments) {
      assert.ok(ids.includes(fragment), `${file}: missing fragment target #${fragment}`);
    }
  }
});

test("HTML and CSS references resolve to files inside the repository", async () => {
  const errors = [];
  const htmlFiles = (await readdir(root)).filter((file) => file.endsWith(".html"));
  const tagPattern = /<[^>]+>/g;
  const assetAttributes = new Set(["src", "href", "poster", "srcset", "imagesrcset"]);

  for (const file of htmlFiles) {
    const html = await readFile(path.join(root, file), "utf8");
    for (const tagMatch of html.matchAll(tagPattern)) {
      const tag = tagMatch[0];
      if (/^<\s*script\b/i.test(tag) || /^<\s*style\b/i.test(tag)) continue;
      const attrs = parseAttributes(tag);
      for (const [name, value] of Object.entries(attrs)) {
        if (!assetAttributes.has(name)) continue;
        for (const reference of referencesFrom(value, name)) {
          await assertLocalReference(reference, root, file, errors);
        }
      }
    }
  }

  for (const cssFile of ["css/site.css", "css/fonts.css", "css/legal.css"]) {
    const css = await readFile(path.join(root, cssFile), "utf8");
    for (const match of css.matchAll(/url\(\s*(.*?)\s*\)/gi)) {
      const reference = match[1].trim().replace(/^['"]|['"]$/g, "");
      if (!reference || isExternalReference(reference) || /^(?:data:|https?:)/i.test(reference)) continue;
      const target = path.resolve(root, path.dirname(cssFile), reference.split(/[?#]/)[0]);
      const relative = path.relative(root, target);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        errors.push(`${cssFile}: CSS URL escapes repository root: ${reference}`);
      } else if (!(await fileExists(target))) {
        errors.push(`${cssFile}: missing CSS asset ${reference}`);
      }
    }
  }

  assert.deepEqual(errors, [], errors.join("\n"));
});

test("sitemap contains exactly the canonical public pages", async () => {
  const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((match) => match[1]);
  const expected = [
    "https://burionstudio.com/",
    "https://burionstudio.com/about",
    "https://burionstudio.com/contact",
    "https://burionstudio.com/privacy",
    "https://burionstudio.com/terms"
  ];
  assert.deepEqual([...urls].sort(), [...expected].sort());
});

test("robots policy preserves search and user-requested retrieval while blocking training crawlers", async () => {
  const robots = await readFile(path.join(root, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent: Googlebot\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: Google-Extended\s*\nDisallow: \/$/mi);
  assert.match(robots, /^User-agent: OAI-SearchBot\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: GPTBot\s*\nDisallow: \/$/mi);
  assert.match(robots, /^User-agent: Claude-SearchBot\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: Claude-User\s*\nAllow: \/$/mi);
  assert.match(robots, /^User-agent: ClaudeBot\s*\nDisallow: \/$/mi);
  assert.match(robots, /Content-Signal: ai-train=no, search=yes, ai-input=yes/);
});

test("security.txt has a contact, canonical URL, and unexpired expiry date", async () => {
  const security = await readFile(path.join(root, ".well-known/security.txt"), "utf8");
  assert.match(security, /^Contact: mailto:support@burionstudio\.com$/m);
  assert.match(security, /^Canonical: https:\/\/burionstudio\.com\/.well-known\/security\.txt$/m);
  const expiry = security.match(/^Expires: (.+)$/m)?.[1];
  assert.ok(expiry && Number.isFinite(Date.parse(expiry)), "security.txt should include a valid Expires date");
  assert.ok(Date.parse(expiry) > Date.now(), "security.txt has expired");
});
