#!/usr/bin/env node
/**
 * Empire D Ltd — static site builder.
 *
 *   node build.js
 *
 * Reads:   site.config.js  (contact details, brand, SEO)
 *          src/partials/   shared header, footer, head pieces
 *          src/pages/      page content
 *          src/styles.css  site styles
 *          src/main.js     site behaviour
 *          src/assets/     generated images (tools/images.py) + fonts
 * Writes:  public/         deploy this folder (netlify.toml points here)
 *
 * No dependencies — plain Node.js.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const config = require("./site.config.js");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "public");
const NOW = new Date();
const YEAR = NOW.getFullYear();
const BUILD_STAMP = NOW.toISOString();

/* ──────────────────────────────────────────────────────────────────────────
   Pages — titles, descriptions and nav order live here.
   Body copy lives in src/pages/<id>.html
   ────────────────────────────────────────────────────────────────────────── */
const PAGES = [
  {
    id: "home",
    out: "index.html",
    url: "/",
    nav: "Home",
    title: "Empire D Ltd | Education, Logistics & Procurement in Nigeria",
    description:
      "Empire D Ltd delivers online education, e-learning solutions and educational supplies — backed by dependable logistics and general procurement for public and private organisations across Nigeria.",
    ogImage: "placeholder-hero-education",
  },
  {
    id: "about",
    out: "about/index.html",
    url: "/about/",
    nav: "About",
    title: "About Empire D Ltd | Our Story, Mission & Values",
    description:
      "Empire D Ltd is a Nigerian multi-service company built around education, logistics and general procurement. Learn about our story, mission and the standards we hold.",
    ogImage: "placeholder-about-team",
    breadcrumb: "About",
  },
  {
    id: "education",
    out: "education/index.html",
    url: "/education/",
    nav: "Education",
    title: "Education Services & E-Learning Solutions | Empire D Ltd",
    description:
      "Online educational services, e-learning solutions, and supply of educational materials and computer accessories for schools, institutions and organisations in Nigeria.",
    ogImage: "placeholder-elearning",
    breadcrumb: "Education",
  },
  {
    id: "logistics",
    out: "logistics/index.html",
    url: "/logistics/",
    nav: "Logistics",
    title: "Logistics & Distribution Services in Nigeria | Empire D Ltd",
    description:
      "Haulage, distribution, warehousing and last-mile delivery across Nigeria. See how Empire D Ltd plans, collects and delivers your goods on schedule.",
    ogImage: "placeholder-logistics",
    breadcrumb: "Logistics",
  },
  {
    id: "procurement",
    out: "procurement/index.html",
    url: "/procurement/",
    nav: "Procurement",
    title: "General Procurement & Contract Supply | Empire D Ltd",
    description:
      "Contracts, supplies and trading for public and private organisations — office and ICT equipment, educational materials, furniture and more, sourced and delivered end to end.",
    ogImage: "placeholder-procurement",
    breadcrumb: "General Procurement",
  },
  {
    id: "contact",
    out: "contact/index.html",
    url: "/contact/",
    nav: "Contact",
    title: "Contact Empire D Ltd | Request a Quote",
    description:
      "Speak to Empire D Ltd about education services, logistics or procurement. Send an enquiry, call, or message us on WhatsApp — we respond within one business day.",
    ogImage: "placeholder-contact",
    breadcrumb: "Contact",
  },
  {
    id: "thank-you",
    out: "thank-you/index.html",
    url: "/thank-you/",
    noindex: true,
    title: "Thank You | Empire D Ltd",
    description: "Your enquiry has been received. The Empire D Ltd team will respond within one business day.",
    ogImage: "placeholder-contact",
  },
  {
    id: "404",
    out: "404.html",
    url: "/404.html",
    noindex: true,
    title: "Page Not Found | Empire D Ltd",
    description: "The page you are looking for could not be found.",
    ogImage: "placeholder-hero-education",
  },
];

const NAV_PAGES = PAGES.filter((p) => p.nav);
const SITE = config.seo.siteUrl.replace(/\/+$/, "");

/* ──────────────────────────────────────────────────────────────────────────
   Small helpers
   ────────────────────────────────────────────────────────────────────────── */
const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const hex = (h) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim());
  if (!m) throw new Error(`Invalid hex colour in site.config.js: ${h}`);
  return m[1];
};

/** Blend a hex colour towards black (pct < 0) or white (pct > 0). */
function shade(colour, pct) {
  const n = hex(colour);
  const target = pct < 0 ? 0 : 255;
  const p = Math.abs(pct) / 100;
  const parts = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16);
    return Math.round(c + (target - c) * p)
      .toString(16)
      .padStart(2, "0");
  });
  return "#" + parts.join("");
}

const accent = config.brand.accent;
const accentRgb = [0, 2, 4].map((i) => parseInt(hex(accent).slice(i, i + 2), 16)).join(", ");

const theme = {
  accent,
  accentRgb,
  accentDark: shade(accent, -14),
  accentInk: shade(accent, -46), // readable accent text on white
  accentLight: shade(accent, 30), // accent text on navy
  accentSoft: shade(accent, 90), // tinted backgrounds
};

const addr = config.contact.address;
const addressLines = [addr.line1, addr.line2, `${addr.city}, ${addr.state}`, addr.country].filter(Boolean);
const addressOneLine = addressLines.join(", ");
const mapsQuery = config.contact.mapQuery || addressOneLine;

const links = {
  whatsapp: `https://wa.me/${config.contact.whatsapp}?text=${encodeURIComponent(config.contact.whatsappMessage)}`,
  tel: `tel:${config.contact.phone.replace(/\s+/g, "")}`,
  email: `mailto:${config.contact.email}`,
  // Note: rendered into an attribute, so the "&" is escaped for valid HTML.
  maps: `https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(mapsQuery)}`,
  quote: "/contact/",
};

const addressHtml = addressLines.map(esc).join("<br>");
const hoursHtml = config.contact.hours
  .map((h) => `<div class="hours__row"><span>${esc(h.days)}</span><span>${esc(h.time)}</span></div>`)
  .join("\n            ");

/* ── Client logo ──────────────────────────────────────────────────────────
   Drop the client's logo at src/assets/brand/logo.png (.svg/.jpg/.jpeg/
   .webp also work) and rebuild: it is used in the header, footer and as
   the favicon automatically. brand.logo in site.config.js overrides this.
   Until a file exists, the bold text "Empire D" is shown instead.        */
const LOGO_CANDIDATES = ["logo.png", "logo.svg", "logo.jpg", "logo.jpeg", "logo.webp"];
const detectedLogoFile = LOGO_CANDIDATES.find((name) =>
  fs.existsSync(path.join(SRC, "assets/brand", name))
);
const logoUrl = config.brand.logo || (detectedLogoFile ? `/${detectedLogoFile}` : "");
const LOGO_MIME = { ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };
const faviconLinks = logoUrl
  ? `<link rel="icon" href="${esc(logoUrl)}" type="${LOGO_MIME[path.extname(logoUrl).toLowerCase()] || "image/png"}">\n  <link rel="apple-touch-icon" href="${esc(logoUrl)}">`
  : `<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n  <link rel="icon" href="/favicon.ico" sizes="32x32">\n  <link rel="apple-touch-icon" href="/apple-touch-icon.png">`;

const brandLockup = logoUrl
  ? `<img class="brand__logo" src="${esc(logoUrl)}" alt="${esc(config.company.name)}" width="220" height="56">`
  : `<span class="brand__fallback">Empire D</span>`;

const hoursLine = `${config.contact.hours[0].days}, ${config.contact.hours[0].time}`;

/* Custom domain e-mail + WhatsApp link used in several places. */
const tokens = {
  company: config.company,
  contact: config.contact,
  brand: config.brand,
  brandLockup,
  faviconLinks,
  logoUrl,
  hoursLine,
  seo: config.seo,
  form: config.form,
  theme,
  links,
  addressHtml,
  addressOneLine: esc(addressOneLine),
  hoursHtml,
  year: YEAR,
  siteUrl: SITE,
};

/* ──────────────────────────────────────────────────────────────────────────
   Images — a <picture> element built from the generated manifest
   Usage:  {{img|name=hero|alt=Students learning|ratio=3:2|sizes=50vw|eager=1}}
   ────────────────────────────────────────────────────────────────────────── */
const manifestPath = path.join(SRC, "assets/img/manifest.json");
if (!fs.existsSync(manifestPath)) {
  console.error("\n✖ Missing src/assets/img/manifest.json — run: npm run images\n");
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function imageToken(args) {
  const a = {};
  args.split("|").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) a[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  });
  const name = a.name;
  const meta = manifest[name];
  if (!meta) throw new Error(`Unknown image "${name}" — available: ${Object.keys(manifest).join(", ")}`);
  if (!a.alt) throw new Error(`Image "${name}" needs alt text (alt=...)`);

  const widths = meta.variants;
  const webp = widths.map((w) => `/assets/img/${name}-${w}.webp ${w}w`).join(", ");
  const jpg = widths.map((w) => `/assets/img/${name}-${w}.jpg ${w}w`).join(", ");

  const ratio = (a.ratio || `${meta.width}:${meta.height}`).split(":").map(Number);
  if (ratio.length !== 2 || !ratio[0] || !ratio[1]) throw new Error(`Bad ratio for "${name}"`);
  const maxW = widths[widths.length - 1];
  const w = Math.round(maxW);
  const h = Math.round((maxW * ratio[1]) / ratio[0]);

  const loading = a.eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" decoding="async"';
  const cls = a.class ? ` class="${esc(a.class)}"` : "";
  const pid = a.id ? ` id="${esc(a.id)}"` : "";

  return `<picture${pid}${cls}>
          <source type="image/webp" srcset="${webp}" sizes="${esc(a.sizes || "100vw")}">
          <img src="/assets/img/${name}-${widths[Math.min(1, widths.length - 1)]}.jpg" srcset="${jpg}" sizes="${esc(
    a.sizes || "100vw"
  )}" width="${w}" height="${h}" alt="${esc(a.alt)}" ${loading}${a.eager ? "" : ""}>
        </picture>`;
}

/* ──────────────────────────────────────────────────────────────────────────
   Template rendering
   ────────────────────────────────────────────────────────────────────────── */
const readSrc = (rel) => fs.readFileSync(path.join(SRC, rel), "utf8");

function get(obj, key) {
  return key.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function render(str, ctx, label) {
  // Includes: {{> header.html }}
  str = str.replace(/\{\{>\s*([\w./-]+)\s*\}\}/g, (m, file) => readSrc(path.join("partials", file)).trim());
  // Image helper
  str = str.replace(/\{\{img\|([^}]+)\}\}/g, (m, args) => imageToken(args));
  // Tokens
  str = str.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key) => {
    const value = get(ctx, key);
    return value === undefined ? m : String(value);
  });
  const leftover = str.match(/\{\{[^}]*\}\}/g);
  if (leftover) {
    throw new Error(`Unresolved template token in ${label}: ${[...new Set(leftover)].join(" ")}`);
  }
  return str;
}

/* ──────────────────────────────────────────────────────────────────────────
   Head / SEO
   ────────────────────────────────────────────────────────────────────────── */
function organisationSchema() {
  const sameAs = Object.values(config.socials).filter(Boolean);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE}/#organization`,
    name: config.company.name,
    legalName: config.company.legalName,
    url: `${SITE}/`,
    logo: {
      "@type": "ImageObject",
      url: logoUrl ? `${SITE}${logoUrl}` : `${SITE}/assets/img/logo-512.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE}/assets/img/${PAGES[0].ogImage}-og.jpg`,
    description: config.company.description,
    telephone: config.contact.phone,
    email: config.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: [addr.line1, addr.line2].filter(Boolean).join(", "),
      addressLocality: addr.city,
      addressRegion: addr.state,
      addressCountry: "NG",
    },
    areaServed: { "@type": "Country", name: "Nigeria" },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: config.contact.phone,
        email: config.contact.email,
        contactType: "customer service",
        areaServed: "NG",
        availableLanguage: ["en"],
      },
    ],
    department: [
      {
        "@type": "Organization",
        name: `${config.company.name} — Education`,
        description:
          "Online educational services, e-learning solutions, and supply of educational materials and computer accessories.",
        url: `${SITE}/education/`,
      },
      {
        "@type": "Organization",
        name: `${config.company.name} — Logistics`,
        description: "Logistics and distribution services, including haulage, warehousing and last-mile delivery.",
        url: `${SITE}/logistics/`,
      },
      {
        "@type": "Organization",
        name: `${config.company.name} — General Procurement`,
        description: "Contracts, supplies and trading for public and private organisations.",
        url: `${SITE}/procurement/`,
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Empire D Ltd services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Education services & e-learning",
            url: `${SITE}/education/`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: "Logistics & distribution", url: `${SITE}/logistics/` },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "General procurement & contract supply",
            url: `${SITE}/procurement/`,
          },
        },
      ],
    },
  };
  if (sameAs.length) schema.sameAs = sameAs;
  return schema;
}

function breadcrumbSchema(page) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: page.breadcrumb || page.nav, item: `${SITE}${page.url}` },
    ],
  };
}

function head(page) {
  const canonical = `${SITE}${page.url}`;
  const ogImg = `${SITE}/assets/img/${page.ogImage}-og.jpg`;
  const schemas = [organisationSchema()];
  if (page.id === "home") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: `${SITE}/`,
      name: config.company.name,
      description: config.company.description,
      publisher: { "@id": `${SITE}/#organization` },
      inLanguage: "en-NG",
    });
  }
  if (page.breadcrumb) schemas.push(breadcrumbSchema(page));

  const schemaTags = schemas
    .map(
      (s) =>
        `<script type="application/ld+json">\n${JSON.stringify(s, null, 2).replace(/<\/script/gi, "<\\/script")}\n</script>`
    )
    .join("\n  ");

  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script>(function(){try{var t=localStorage.getItem("empire-d-theme-v2");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;}}catch(e){}})();</script>
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  <link rel="canonical" href="${canonical}">
  ${page.noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
  <meta name="theme-color" content="#063D50">
  <meta name="format-detection" content="telephone=no">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(config.company.name)}">
  <meta property="og:title" content="${esc(page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:locale" content="${config.seo.locale}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(page.title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${ogImg}">
  ${config.seo.twitterHandle ? `<meta name="twitter:site" content="${esc(config.seo.twitterHandle)}">` : ""}

  <!-- Icons -->
  ${faviconLinks}
  <link rel="manifest" href="/site.webmanifest">

  <!-- Fonts (self-hosted, preloaded) -->
  <link rel="preload" href="/assets/fonts/manrope-var-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-var-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/css/styles.css?v=4">

  <!-- schema.org structured data -->
  ${schemaTags}
  <script>document.documentElement.className += " js";</script>`;
}

function navList(activeId) {
  return `<ul class="nav__list" role="list">
            ${NAV_PAGES.map(
              (p) =>
                `<li><a class="nav__link" href="${p.url}"${
                  p.id === activeId ? ' aria-current="page"' : ""
                }>${esc(p.nav)}</a></li>`
            ).join("\n            ")}
          </ul>`;
}

function mobileNavList(activeId) {
  return `<ul class="mobile-nav__list" role="list">
            ${NAV_PAGES.map(
              (p) =>
                `<li><a class="mobile-nav__link" href="${p.url}"${
                  p.id === activeId ? ' aria-current="page"' : ""
                }>${esc(p.nav)}</a></li>`
            ).join("\n            ")}
          </ul>`;
}

/* ──────────────────────────────────────────────────────────────────────────
   Build
   ────────────────────────────────────────────────────────────────────────── */
function copyDir(from, to, filter = () => true) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (!filter(entry.name)) continue;
    if (entry.isDirectory()) copyDir(src, dest, filter);
    else fs.copyFileSync(src, dest);
  }
}

/**
 * Comments are kept in src/ for editors but removed from the published HTML.
 * A single build notice is left at the top of each page.
 */
function stripComments(html) {
  const cleaned = html.replace(/<!--(?!\[if)[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n");
  return cleaned.replace(
    "<!doctype html>",
    "<!doctype html>\n<!-- " +
      config.company.legalName +
      " — generated by build.js. Edit the files in src/ and rebuild. -->"
  );
}

function write(rel, content) {
  const dest = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

/* ── Dee knowledge: src/data/assistant-knowledge.ts → browser JS ──────────
   The .ts file is the source of truth. Strip its type-only exports, turn
   `export const X` into `window.X`, fill config tokens, and fail loudly if
   any TypeScript-only syntax survives.                                  */
function assistantKnowledgeJs() {
  let ts = readSrc("data/assistant-knowledge.ts");
  // Remove `export interface Name { ... }` blocks (brace-counted).
  for (;;) {
    const m = /export\s+interface\s+\w+\s*\{/.exec(ts);
    if (!m) break;
    let depth = 0;
    let i = m.index + m[0].length - 1;
    for (; i < ts.length; i++) {
      if (ts[i] === "{") depth++;
      else if (ts[i] === "}" && --depth === 0) break;
    }
    ts = ts.slice(0, m.index) + ts.slice(i + 1);
  }
  ts = ts.replace(/^export\s+type\s+.*$/gm, "");
  ts = ts.replace(/^export\s+const\s+(\w+)/gm, "window.$1");
  ts = ts.replace(/\s+as\s+AssistantTopic\[\]/g, "");
  if (/\bexport\b/.test(ts)) throw new Error("assistant-knowledge.ts: unconverted `export` survived the build transform");
  const js = render(ts, tokens, "assistant-knowledge.ts");
  return "/* Generated from src/data/assistant-knowledge.ts — edit that file, then rebuild. */\n" + js;
}

function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  /* Assets ---------------------------------------------------------------- */
  copyDir(path.join(SRC, "assets/img"), path.join(OUT, "assets/img"), (n) => n !== "manifest.json");
  copyDir(path.join(SRC, "assets/fonts"), path.join(OUT, "assets/fonts"));
  copyDir(path.join(SRC, "assets/brand"), path.join(OUT), (n) => !n.endsWith(".md") && n !== "mark.png");

  // Interim favicon, drawn from the logo description (teal-to-cyan ring +
  // twin flame blades + swoosh) until the client's logo file arrives, at
  // which point head() points the icon links at the logo itself.
  write(
    "favicon.svg",
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${esc(config.company.name)}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B6E8A"/><stop offset="1" stop-color="#19B5D1"/></linearGradient></defs>
  <rect width="64" height="64" rx="14" fill="#FFFFFF"/>
  <circle cx="32" cy="30" r="20" fill="none" stroke="url(#g)" stroke-width="5.5" stroke-dasharray="106 20" transform="rotate(-38 32 30)" stroke-linecap="round"/>
  <path d="M32 15c5.5 6.5 7.5 12 5 17.5-1.8 4-6.8 5-9.5 1.5C25 30.2 27 23.5 29.8 19c.8-1.4 1.5-2.7 2.2-4Z" fill="#0B6E8A"/>
  <path d="M40.5 23.5c3.8 4.3 4.8 8.8 2.7 12.3-1.6 2.7-5.5 2.8-7 .2-1.2-2.2-.2-6.2 1.8-9.2.9-1.3 1.7-2.4 2.5-3.3Z" fill="#C9CED6"/>
  <path d="M17 45.5c9-4.8 21-4.8 30 0-9 4.3-21 4.3-30 0Z" fill="#19B5D1"/>
</svg>
`
  );

  const css = render(readSrc("fonts/fonts.css").trim() + "\n\n" + readSrc("styles.css"), tokens, "styles.css");
  write("assets/css/styles.css", css);
  write("assets/js/main.js", readSrc("main.js"));
  write("assets/js/assistant-knowledge.js", assistantKnowledgeJs());
  write("assets/js/assistant.js", readSrc("assistant.js"));

  fs.mkdirSync(path.join(OUT, "assets/js"), { recursive: true });

  /* Pages ----------------------------------------------------------------- */
  const built = [];
  for (const page of PAGES) {
    const body = readSrc(path.join("pages", `${page.id}.html`));
    const ctx = {
      ...tokens,
      page: {
        id: page.id,
        url: page.url,
        title: page.title,
        description: page.description,
      },
      nav: navList(page.id),
      mobileNav: mobileNavList(page.id),
    };
    const html = render(
      `<!doctype html>
<html lang="en-NG">
<head>
  ${head(page)}
</head>
<body class="page-${page.id}">
  {{> icons.html }}
  <a class="skip-link" href="#main">Skip to main content</a>
  {{> header.html }}
  ${body}
  {{> footer.html }}
  {{> assistant.html }}
  <script src="/assets/js/main.js?v=4" defer></script>
  <script src="/assets/js/assistant-knowledge.js?v=4" defer></script>
  <script src="/assets/js/assistant.js?v=4" defer></script>
</body>
</html>
`,
      ctx,
      page.id
    );
    write(page.out, stripComments(html));
    built.push({ ...page, bytes: Buffer.byteLength(html) });
  }

  /* sitemap.xml + robots.txt ---------------------------------------------- */
  const urls = PAGES.filter((p) => !p.noindex)
    .map(
      (p) => `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${BUILD_STAMP.slice(0, 10)}</lastmod>
    <changefreq>${p.id === "home" ? "monthly" : "yearly"}</changefreq>
    <priority>${p.id === "home" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("\n");
  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  );
  write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

  write(
    "site.webmanifest",
    JSON.stringify(
      {
        name: config.company.legalName,
        short_name: config.company.shortName,
        description: config.company.description,
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#063D50",
        icons: [
          { src: "/logo-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/assets/img/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/assets/img/logo-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      null,
      2
    ) + "\n"
  );

  /* Report ---------------------------------------------------------------- */
  const warnings = [];
  const placeholderFields = Object.entries({
    "contact.phoneDisplay": config.contact.phoneDisplay,
    "contact.phone": config.contact.phone,
    "contact.whatsapp": config.contact.whatsapp,
    "contact.email": config.contact.email,
    "contact.address.line1": config.contact.address.line1,
    "seo.siteUrl": config.seo.siteUrl,
  })
    .filter(([, v]) => /000|placeholder|empiredltd\.com/i.test(String(v)))
    .map(([k]) => k);
  if (placeholderFields.length) warnings.push(`Contact/site details still placeholders: ${placeholderFields.join(", ")}`);

  const usedPlaceholderImages = [...new Set(
    PAGES.map((p) => p.ogImage)
  )].filter((n) => n.startsWith("placeholder"));

  console.log("");
  console.log("  Empire D Ltd — build complete");
  console.log("  ────────────────────────────────────────────────────────────");
  for (const p of built) {
    console.log(`  ✓ ${p.out.padEnd(24)} ${(p.bytes / 1024).toFixed(1)} kB   ${p.url}`);
  }
  console.log(`  ✓ ${"sitemap.xml / robots.txt".padEnd(24)}`);
  console.log(`\n  Output: ${path.relative(process.cwd(), OUT)}/  ·  deploy this folder to Netlify`);
  if (warnings.length) {
    console.log("\n  ⚠  Before launch:");
    warnings.forEach((w) => console.log(`     • ${w}`));
    console.log("     • Placeholder images: " + usedPlaceholderImages.length + " in use (see src/images/)");
  }
  console.log("");
}

build();
