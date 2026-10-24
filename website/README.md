# Empire D Ltd — corporate website

A fast, accessible, mobile-first static website for **Empire D Ltd**, a Nigerian company
built around **Education** (lead business), **Logistics** and **General Procurement**.

Plain HTML, CSS and a little JavaScript — no framework, no database, no build dependencies
beyond Node.js. Deploys to Netlify in one step.

---

## 1. Quick start

```bash
npm run build      # builds the site into ./public
npm start          # preview at http://localhost:4173
```

To work on it while editing: `npm run dev` (builds, then serves).

Node 18 or newer is the only requirement. There is nothing to install.

> **Editing images** needs Python 3 with Pillow: `python3 -m pip install pillow`, then
> `npm run images`.

---

## 2. Change the company details — one file

Everything about the company lives in **`site.config.js`**:

| What | Where |
| --- | --- |
| Company name, legal name, tagline, RC number, year founded | `company` |
| Phone (display + link), WhatsApp number, email, address, opening hours | `contact` |
| Brand accent colour, optional logo file | `brand` |
| Live domain, social profiles, Twitter handle | `seo`, `socials` |
| Netlify form name and thank-you page | `form` |

After any edit: `npm run build` (or let Netlify rebuild on push).

**Phone vs WhatsApp.** `phone` and `whatsapp` are digits only, in international format,
with no `+` or spaces — e.g. `2348012345678`. `phoneDisplay` is what visitors see.

**Brand colours.** The site is recoloured to the Empire D logo. The palette lives in
`src/styles.css` as CSS variables: `--brand-teal #0B6E8A`, `--brand-teal-dark #063D50`,
`--brand-cyan #19B5D1`, `--brand-silver #C9CED6`, `--brand-blue #0A22B5` (primary buttons),
`--bg #F7F9FA`, text `#0F1E26` on light and white on dark. Hero overlays and section
accents use a teal-to-cyan gradient.

**Logo.** The logo in use is `src/assets/brand/logo.png` — the client's actual logo,
extracted from the screenshot they supplied. To swap in cleaner original artwork,
replace that file (or drop a `logo.svg`/`.jpg`/`.jpeg`/`.webp` alongside it) and run
`npm run build`. The build uses
it automatically in the header (44px mobile / 56px desktop, on the white header), the
footer (on a white rounded plate, since the footer is dark) and as the favicon. If no
logo file exists at all, the header and footer fall back to the bold text **"Empire D"**.

---

## 3. Where the content lives

| Page | File |
| --- | --- |
| Home | `src/pages/home.html` |
| About | `src/pages/about.html` |
| Education | `src/pages/education.html` |
| Logistics | `src/pages/logistics.html` |
| General Procurement | `src/pages/procurement.html` |
| Contact / Request a quote | `src/pages/contact.html` |
| Thank-you (after a form submit) | `src/pages/thank-you.html` |
| 404 | `src/pages/404.html` |
| Shared header, footer, Dee assistant | `src/partials/*.html` |
| Design tokens & all styles | `src/styles.css` |
| Behaviour (menu, reveals, form) | `src/main.js` |
| Page titles, descriptions, nav labels | the `PAGES` array at the top of `build.js` |

Shared tokens you can drop into any page file:

```
{{company.name}} {{company.legalName}} {{company.rcNumber}} {{company.founded}}
{{contact.phoneDisplay}} {{contact.email}} {{addressHtml}} {{hoursLine}}
{{links.tel}} {{links.email}} {{links.whatsapp}} {{links.maps}}
{{year}}
```

Images are inserted with a small helper — see `src/images/README.md`.

---

## 4. Replace the placeholder images

Every image on the site is a generated placeholder and is marked in two places:

1. an HTML comment directly above it — `<!-- PLACEHOLDER IMAGE — swap src/images/… -->`
2. the file name itself — `placeholder-*.jpg`

**To swap:** save your photograph into `src/images/` using the **same file name**, then run
`npm run images && npm run build`. The pipeline regenerates every responsive size, the WebP
versions, the 1200×630 social card and the favicon.

| File in `src/images/` | Used for |
| --- | --- |
| `placeholder-hero-education.jpg` | Homepage hero |
| `placeholder-about-team.jpg` | About page, story section |
| `placeholder-elearning.jpg` | Education page hero |
| `placeholder-education-materials.jpg` | Education page, supplies section |
| `placeholder-logistics.jpg` | Logistics page hero |
| `placeholder-procurement.jpg` | Procurement page hero |
| `placeholder-procurement-meeting.jpg` | Procurement page, "how we work" |
| `placeholder-contact.jpg` | Contact page social card |

Tips: landscape photographs, at least 1600px wide, JPG. Faces and detail in the left third
of the hero image work best on desktop (the headline sits on the left).

Placeholder **text** is marked in the page files with `★ SAMPLE CONTENT` comments. Search
the project for that string to find everything that needs a real-world rewrite:

```bash
grep -rn "★ SAMPLE" src/
```

The build also prints a reminder at the end whenever contact details still look like
placeholders.

---

## 4b. Dee, the Empire D assistant

The floating WhatsApp button has been replaced by **Dee**, a circular avatar button
(bottom-right, green "online" dot, gentle pulse). Clicking it opens a chat panel
(full width on mobile, 380px on desktop) with quick-reply chips: *Education · Logistics ·
General Procurement · Request a Quote · Contact the team*.

- **Answers today are scripted** from `src/data/assistant-knowledge.ts` (converted at
  build time to `assets/js/assistant-knowledge.js`). Dee never invents prices, dates or
  promises; for quotes or anything she can't answer she says the team will confirm and
  offers the quote form or a *Chat on WhatsApp* button inside the panel.
- **IELTS Tutorials, Port Harcourt** is listed on the Education page and in Dee's
  knowledge marked *to be confirmed with client* — no schedule or fee is stated.
- **Going live with real AI later:** `netlify/functions/chat.js` is a stub served at
  `/.netlify/functions/chat`. Set `DEE_AI_API_KEY` in *Netlify → Site settings →
  Environment variables* and wire the provider call where marked `TODO` in that file.
  The key is read from the environment on the server only — never put it in front-end
  code or in this repo.

## 5. Deploy to Netlify

**Option A — connect a repository (recommended)**

1. Push this folder to GitHub/GitLab.
2. In Netlify: *Add new site → Import an existing project* and pick the repo.
3. Netlify reads `netlify.toml`, so the settings are already correct:
   - build command `node build.js`
   - publish directory `public`
4. Deploy. Every push rebuilds automatically.

**Option B — drag and drop**

Run `npm run build` locally, then drag the **`public`** folder onto
[app.netlify.com/drop](https://app.netlify.com/drop).

**After the first deploy**

- Add your custom domain in *Site settings → Domain management*, then set
  `seo.siteUrl` in `site.config.js` to the live URL and rebuild (canonical links,
  Open Graph URLs, sitemap and schema.org all use it).
- Add the domain to Netlify's *Domain management* so HTTPS is provisioned.

### Forms

The contact form uses Netlify Forms — no backend, no account, nothing to configure.

- The form is detected automatically at deploy time because it has `data-netlify="true"`
  and a hidden `form-name` field. Its name is **`quote-request`**.
- Submissions appear under *Netlify → Forms*; set up email/Slack notifications there.
- Spam is filtered by the honeypot field (`netlify-honeypot="bot-field"`). If you start
  seeing spam, enable Netlify's reCAPTCHA in *Forms → Settings*.
- Successful submissions redirect to `/thank-you/`; the page also works as the
  `action` fallback.
- **The form only submits once deployed.** When previewing locally it shows a friendly note
  pointing visitors to the phone/WhatsApp instead of failing silently.

> Renaming the form? Change the hidden `form-name` value and `name` in
> `src/pages/contact.html`, and `form.name` in `site.config.js`, then rebuild.

---

## 6. What's included

**Pages:** Home · About · Education · Logistics · General Procurement · Contact/Quote ·
Thank you · 404

**Design:** deep navy (`#081A33`) and white with one warm accent, Manrope for headlines and
Inter for body text (self-hosted, no Google Fonts request), generous whitespace, large
photography, restrained scroll reveals, full respect for `prefers-reduced-motion`.

**Homepage** is deliberately short: sticky nav → hero → three service cards → slim footer.

**Technical**

- Sticky navigation with a mobile drawer (keyboard accessible, closes on Escape)
- Floating **Dee** AI assistant on every page (scripted answers today; see below)
- Plain HTML form with `data-netlify="true"`
- Per-page `<title>`, meta description, canonical URL, Open Graph and Twitter tags
- schema.org `Organization` markup (with departments and a service catalogue) on every
  page, `WebSite` on the homepage, `BreadcrumbList` on interior pages
- `sitemap.xml` and `robots.txt` generated at build time
- Responsive images: WebP with JPG fallback, `srcset`/`sizes`, explicit dimensions to
  prevent layout shift, lazy loading everywhere except the hero
- Self-hosted variable fonts, preloaded
- SVG sprite icons (no icon-font, no external requests)
- Favicon (SVG + ICO), Apple touch icon, web manifest
- Accessibility: skip link, landmarks, visible focus states, 44px+ touch targets,
  `aria-current` navigation, colour contrast verified with axe (0 violations)
- Deploy headers and cache policy in `netlify.toml`

**No JavaScript?** Every page still renders and the menu becomes a set of links at the
top; only the flap of the mobile drawer and the scroll reveals are lost.

---

## 7. Housekeeping

```
site.config.js        ← the one config file
build.js              ← static builder (no dependencies)
netlify.toml          ← deploy, headers, caching
src/
  pages/              page content
  partials/           header, footer, icons, Dee assistant
  styles.css          design tokens + all styles
  main.js             behaviour
  fonts/              @font-face declarations
  images/             source photographs (replace these)
  assets/             generated images, fonts and brand icons
tools/
  images.py           image pipeline
  serve.js            local preview server
  fonts/              font used to draw social cards
public/               ← build output — this is what you deploy
```

Everything in `src/assets/` is generated: re-run `npm run images` and `npm run build`
rather than editing those files by hand.

---

## 8. Before you go live — checklist

- [ ] `site.config.js`: real phone, WhatsApp, email, address, RC number
- [ ] `site.config.js`: real domain in `seo.siteUrl`
- [ ] `brand.accent` matched to the logo; `brand.logo` set if you have a logo file
- [ ] Replace all eight `placeholder-*.jpg` photographs
- [ ] Rewrite the `★ SAMPLE` copy (story, statistics, service lists, claims)
- [ ] Confirm the claims you make are accurate for your business
- [ ] Social profiles added (or left empty) in `site.config.js`
- [ ] Deployed to Netlify, test submission received, notifications configured
- [ ] Custom domain + HTTPS active
- [ ] Submit `sitemap.xml` in Google Search Console
