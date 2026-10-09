const MARKDOWN_PAGES = {
  "/": `---
title: Burion Studio — Independent Software Studio
description: Independent software studio creating games, applications and digital products from idea to release.
image: https://burionstudio.com/assets/brand/burion-hero-mobile-1080.webp
---

# Burion Studio

## Ideas, built into reality.

Independent software studio creating games, applications and digital products from idea to release.

[Explore projects](https://burionstudio.com/#projects)  
[Get in touch](mailto:support@burionstudio.com)

## Selected Work

### Trivia

**Game · In development**

A competitive quiz experience designed around knowledge, speed and progression.

### Agricultural Platform

**Application · Concept**

A digital platform focused on smarter agricultural decisions.

### More products are coming.

New games and digital products are taking shape behind the scenes.

## What We Build

### Games

**Interactive experiences**

Interactive worlds, gameplay systems and experiences built from the ground up.

### Applications

**Digital solutions**

Useful digital products designed around real problems and real people.

### Digital Products

**Web · Platforms · Experiences**

Websites, platforms and experiences when ideas need a place to live.

## The Studio

### Built independently. Designed to last.

Burion Studio is an independent software studio founded by **İrfan Aslan BÜRİAN**.

Games, applications and digital products are built from scratch with a focus on clear design, solid systems and long-term usability.

One developer today. A studio built to grow with every product.

**İrfan Aslan BÜRİAN**  
Founder · Developer

## Contact

### Let's build something.

[support@burionstudio.com](mailto:support@burionstudio.com)

© 2026 Burion Studio.
`,

  "/privacy": `---
title: Privacy Policy — Burion Studio
description: Privacy Policy for Burion Studio.
---

# Privacy Policy

Last updated: 2 September 2026

## 1. Overview

Burion Studio operates this website as an independent software studio. This Privacy Policy explains what information is handled when you visit **burionstudio.com** and when you choose to contact us.

## 2. Information you provide

The website does not contain a contact form, account system, registration system, newsletter form, or other field where you submit personal information directly to the website.

The Contact section uses a **mailto** link. When you select the email address, your device opens your configured email application. Any name, email address, message or other information you include is sent through your own email provider directly to [support@burionstudio.com](mailto:support@burionstudio.com). The website itself does not receive, store, or transmit that message through a website database or application server.

## 3. Website activity and cookies

The current website does not intentionally use advertising cookies, analytics cookies, tracking pixels, user accounts, or browser-based storage such as localStorage to identify or track visitors.

The website's JavaScript is limited to interface functionality such as the mobile navigation, section carousels, responsive behavior, accessibility states, and visual reveal effects. It does not collect or send personal information to Burion Studio.

## 4. Technical information and hosting

Like most websites, requests to the website may be processed by the hosting, domain, CDN, or other infrastructure used to deliver the site. Those systems may automatically handle technical information such as an IP address, browser type, device information, requested page, date and time, and similar connection data for security, reliability, and delivery purposes.

Burion Studio does not use this website to build a personal profile of visitors or intentionally combine such technical information with other personal information.

## 5. Third-party services

The current website does not intentionally embed analytics, advertising, social-media tracking, payment, authentication, or other third-party tracking services.

Links to external websites or services may be provided in the future. When you leave this website and use an external service, that service's own privacy policy and terms apply.

## 6. Email communications

If you contact Burion Studio by email, the information in your email is processed by the email service used by the sender and recipient. Burion Studio may retain correspondence for as long as reasonably necessary to respond, maintain business records, or handle a related request.

## 7. Your requests

For questions about this Privacy Policy or about information you have voluntarily sent to Burion Studio, contact [support@burionstudio.com](mailto:support@burionstudio.com).

## 8. Changes to this policy

This policy may be updated if the website's functionality, services, or data practices change. The latest version will be published on this page with its updated date.

© 2026 Burion Studio. All rights reserved.
`,

  "/terms": `---
title: Terms of Use — Burion Studio
description: Terms of Use for the Burion Studio website.
---

# Terms of Use

Last updated: 2 September 2026

## 1. Acceptance

By using the Burion Studio website, you agree to use it lawfully and respectfully and to comply with these terms.

## 2. Website content

Unless otherwise stated, the website's text, branding, graphics, visual assets and original materials are owned by or used by Burion Studio with appropriate rights. You may view the website for personal and informational purposes, but you may not reproduce, redistribute or commercially exploit its original materials without permission.

## 3. Projects and information

Project descriptions, concepts, development status and other information may change as products evolve. A project shown as a concept or in development is not a promise of release, functionality or availability.

## 4. External links and services

The website may reference third-party services or resources. Burion Studio is not responsible for the content, availability or policies of third-party websites.

## 5. Contact

Messages sent to Burion Studio should not contain confidential, unlawful or sensitive information unless specifically requested. For general enquiries, contact [support@burionstudio.com](mailto:support@burionstudio.com).

## 6. Changes

These terms may be updated as the website and studio evolve. The latest version will be published on this page.

## 7. Questions

Questions about these terms can be sent to [support@burionstudio.com](mailto:support@burionstudio.com).

© 2026 Burion Studio. All rights reserved.
`
};

function wantsMarkdown(request) {
  const accept = request.headers.get("Accept") || "";
  return /(?:^|,|;)\s*text\/markdown(?:\s*[;,]|$)/i.test(accept);
}

function withMarkdownHeaders(source, markdown) {
  const headers = new Headers(source.headers);

  // _headers applies to static asset responses, not responses created by
  // this Worker. Keep the same security policy on the Markdown variant.
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("X-Frame-Options", "DENY");
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: blob:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; form-action 'self' mailto:; upgrade-insecure-requests"
  );
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  headers.set("Vary", "Accept");
  headers.set("Content-Signal", "ai-train=no, search=yes, ai-input=yes");
  headers.set("X-Markdown-Tokens", String(Math.ceil(markdown.length / 4)));
  headers.set("X-Original-Tokens", String(Math.ceil(markdown.length / 3)));
  headers.delete("Content-Encoding");
  headers.delete("Content-Length");
  headers.delete("Content-Range");
  headers.delete("Transfer-Encoding");
  headers.delete("ETag");
  headers.delete("Last-Modified");
  return headers;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const redirects = {
      "/tr": "/",
      "/tr/": "/",
      "/ru": "/",
      "/ru/": "/",
      "/privacy.html": "/privacy",
      "/terms.html": "/terms"
    };

    const redirectTarget = redirects[url.pathname];
    if (redirectTarget) {
      return Response.redirect(new URL(redirectTarget, url).toString(), 301);
    }

    // Resolve extensionless content pages explicitly to HTML files.
    // This avoids serving directory indexes as downloadable/unknown files
    // when the Worker is run first for these routes.
    const htmlRoutes = {
      "/studio": "/studio/index.html",
      "/studio/": "/studio/index.html",
      "/services": "/services/index.html",
      "/services/": "/services/index.html",
      "/projects/trivia": "/projects/trivia/index.html",
      "/projects/trivia/": "/projects/trivia/index.html",
      "/projects/agricultural-platform": "/projects/agricultural-platform/index.html",
      "/projects/agricultural-platform/": "/projects/agricultural-platform/index.html"
    };

    const htmlTarget = htmlRoutes[url.pathname];
    if (htmlTarget) {
      const assetUrl = new URL(htmlTarget, url);
      const assetRequest = new Request(assetUrl.toString(), request);
      const response = await env.ASSETS.fetch(assetRequest);
      const headers = new Headers(response.headers);
      headers.set("Content-Type", "text/html; charset=utf-8");
      return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
    }

    const key = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");

    if (wantsMarkdown(request) && MARKDOWN_PAGES[key]) {
      const assetResponse = await env.ASSETS.fetch(request);
      const markdown = MARKDOWN_PAGES[key];
      return new Response(markdown, {
        status: assetResponse.status,
        headers: withMarkdownHeaders(assetResponse, markdown)
      });
    }

    return env.ASSETS.fetch(request);
  }
};
