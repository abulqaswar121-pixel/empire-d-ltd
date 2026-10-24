/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EMPIRE D LTD — SITE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  This is the ONLY file you need to edit to change the company name,
 *  phone number, WhatsApp number, email address or office address.
 *
 *  After editing, run:   npm run build
 *  (then re-upload / re-deploy the "public" folder)
 *
 *  Anything marked "PLACEHOLDER" is sample data — replace it with the real
 *  details before going live.
 * ═══════════════════════════════════════════════════════════════════════════
 */

const config = {
  /* ── Company ─────────────────────────────────────────────────────────── */
  company: {
    name: "Empire D Ltd",
    legalName: "Empire D Limited",
    shortName: "Empire D",
    tagline: "Education · Logistics · Procurement",
    // Used in meta descriptions and schema.org markup:
    description:
      "A Nigerian multi-service company with education at its core — delivering online learning, e-learning solutions and educational supplies, alongside logistics and general procurement for public and private organisations.",
    rcNumber: "RC 0000000", // PLACEHOLDER — company registration number
    founded: "2016", // PLACEHOLDER — year founded
  },

  /* ── Contact details ─────────────────────────────────────────────────── */
  contact: {
    // How the number is displayed on the site:
    // Client number 0701 500 5111 — used for both calls and WhatsApp:
    phoneDisplay: "+234 701 500 5111",
    // Same number, digits only, international format (used in tel: links):
    phone: "+2347015005111",

    // WhatsApp: full international number, DIGITS ONLY, no "+" or spaces:
    // Client number 0701 500 5111 → 2347015005111 (used in every WhatsApp link).
    whatsapp: "2347015005111",
    whatsappMessage: "Hello Empire D Ltd, I would like to make an enquiry.",

    email: "hello@empiredltd.com", // PLACEHOLDER

    address: {
      line1: "12 Placeholder Crescent", // PLACEHOLDER
      line2: "Bodija",
      city: "Ibadan",
      state: "Oyo State",
      country: "Nigeria",
    },

    // Business hours shown on the contact page and in the footer:
    hours: [
      { days: "Monday – Friday", time: "8:00am – 5:00pm" },
      { days: "Saturday", time: "9:00am – 1:00pm" },
      { days: "Sunday & public holidays", time: "Closed" },
    ],

    // Optional: leave empty to use the address above for the Google Maps link.
    mapQuery: "",
  },

  /* ── Branding ────────────────────────────────────────────────────────── */
  brand: {
    // Empire D logo palette (teal / cyan / silver / wordmark blue).
    // The full palette lives in src/styles.css as CSS variables:
    // --brand-teal #0B6E8A · --brand-teal-dark #063D50 · --brand-cyan #19B5D1
    // --brand-silver #C9CED6 · --brand-blue #0A22B5 · --bg #F7F9FA
    accent: "#0B6E8A",
    // Client logo: drop the file at src/assets/brand/logo.png
    // (.svg, .jpg, .jpeg or .webp also work) and rebuild — build.js finds it
    // automatically and uses it in the header, footer and as the favicon.
    // Until that file exists, the header/footer show the bold text "Empire D".
    // You may also set an explicit path here, e.g. "/assets/img/logo.svg".
    logo: "",
  },

  /* ── SEO / sharing ───────────────────────────────────────────────────── */
  seo: {
    siteUrl: "https://www.empiredltd.com", // PLACEHOLDER — your real domain
    locale: "en_NG",
    twitterHandle: "", // e.g. "@empiredltd" (leave empty to omit)
  },

  // Optional social profiles — added to schema.org "sameAs" when filled in.
  socials: {
    linkedin: "",
    facebook: "",
    instagram: "",
    x: "",
  },

  /* ── Forms (Netlify Forms) ───────────────────────────────────────────── */
  form: {
    name: "quote-request", // form name shown in your Netlify dashboard
    successUrl: "/thank-you/", // where visitors land after submitting
  },
};

module.exports = config;
