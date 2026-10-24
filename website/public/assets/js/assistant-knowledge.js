/* Generated from src/data/assistant-knowledge.ts — edit that file, then rebuild. */
/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DEE — EMPIRE D ASSISTANT KNOWLEDGE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Single source of truth for what Dee (the Empire D virtual assistant)
 *  can say. Everything here is drawn from the public pages of this site —
 *  Dee must never invent prices, dates, timelines or promises.
 *
 *  How it is used today: `build.js` converts this file into
 *  `assets/js/assistant-knowledge.js` (window.DEE_KNOWLEDGE) and
 *  `src/assistant.js` answers from it instantly, with no network call.
 *
 *  How it will be used later: the Netlify Function at
 *  `netlify/functions/chat.js` (served at /.netlify/functions/chat) can send
 *  DEE_RULES + these topics to a real AI provider server-side. The API key
 *  lives only in a Netlify environment variable (DEE_AI_API_KEY) and must
 *  never be copied into front-end code.
 *
 *  Template tokens such as +234 701 500 5111 are filled in from
 *  site.config.js at build time, so contact answers always match the site.
 * ═══════════════════════════════════════════════════════════════════════════
 */



/**
 * Dee's standing rules — enforced by the scripted matcher today and intended
 * as the system-prompt guardrails when a real AI service is connected.
 */
window.DEE_RULES = [
  "You are Dee, Empire D Ltd's virtual assistant. Be friendly, brief and professional.",
  "Answer only from the knowledge provided. Never invent prices, fees, dates, timelines, discounts or promises.",
  "IELTS Tutorials in Port Harcourt are to be confirmed with the client — say so and never invent a schedule, venue detail or fee for them.",
  "For quotes, pricing or anything you cannot answer, say the Empire D team will confirm, and offer the Request a Quote form or the Chat on WhatsApp button.",
  "Do not ask for passwords, PINs, card details or other sensitive information.",
];

window.DEE_KNOWLEDGE = {
  assistantName: "Dee",
  assistantTitle: "Dee, Empire D assistant",
  greeting: "Hello! I'm Dee, Empire D's virtual assistant. How can I help you today?",
  quickReplies: ["Education", "Logistics", "General Procurement", "Request a Quote", "Contact the team"],
  fallback:
    "I can't answer that from the information on this site, and I don't want to guess. The Empire D team will confirm for you — you can send the Request a Quote form or chat with the team on WhatsApp, and they'll take it from there.",
  quote:
    "I can't give prices or confirm timelines here — every job is quoted against the actual details, and the team will confirm. If you send the Request a Quote form with what you need (quantities, location and any timing that matters), the team can prepare a quotation. You can also chat with the team on WhatsApp.",
  topics: [
    {
      id: "education",
      label: "Education",
      keywords: [
        "education",
        "e-learning",
        "elearning",
        "online learning",
        "online class",
        "tutor",
        "tutoring",
        "school",
        "student",
        "learner",
        "course",
        "lms",
        "learning management",
        "textbook",
        "educational material",
      ],
      answer:
        "Education is Empire D's core service. It covers: online educational services (live and self-paced learning, one-to-one and small-group tutoring, exam preparation and progress reports); e-learning solutions (learning management system setup, course structuring, virtual classroom support and teacher training); and supply of educational materials and computer accessories. Tell me a little about what you need, or use Request a Quote and the team will confirm the details.",
      action: "quote-whatsapp",
    },
    {
      id: "ielts",
      label: "IELTS Tutorials, Port Harcourt",
      keywords: ["ielts", "port harcourt", "english test", "study abroad test"],
      answer:
        "We have an IELTS Tutorials service in Port Harcourt listed on our Education page, marked to be confirmed with the client — so I can't confirm schedules, venues or fees here. If you send an enquiry through the Request a Quote form or chat with the team on WhatsApp, they will confirm what is available.",
      action: "quote-whatsapp",
    },
    {
      id: "logistics",
      label: "Logistics",
      keywords: [
        "logistics",
        "haulage",
        "delivery",
        "deliver",
        "distribution",
        "transport",
        "warehouse",
        "warehousing",
        "storage",
        "last-mile",
        "last mile",
        "cargo",
        "freight",
        "move goods",
        "shipping",
      ],
      answer:
        "Our Logistics service covers road haulage, distribution and bulk delivery, warehousing and storage, last-mile delivery, fulfilment and kitting, and delivery reporting with proof of delivery. The site describes regular movement along the Lagos–Ibadan–Abuja axis with nationwide delivery through partners. Share what is moving, where from and where to, and the team will confirm a plan and quotation — I can't confirm prices or dates here.",
      action: "quote-whatsapp",
    },
    {
      id: "procurement",
      label: "General Procurement",
      keywords: [
        "procurement",
        "general procurement",
        "supply",
        "supplies",
        "contract",
        "tender",
        "purchase",
        "source",
        "sourcing",
        "stationery",
        "ict equipment",
        "laptop",
        "computer",
        "furniture",
        "ppe",
        "vehicle parts",
      ],
      answer:
        "General Procurement covers contracts, supplies and trading for public and private organisations. The categories on the site include office supplies and stationery, ICT and computer equipment, educational materials and furniture, safety and protective equipment, household and general goods, and vehicle parts and consumables. Send your list or specification through Request a Quote and the team will confirm sourcing and pricing — I can't quote prices here.",
      action: "quote-whatsapp",
    },
    {
      id: "quote",
      label: "Request a Quote",
      keywords: ["quote", "quotation", "price", "pricing", "cost", "how much", "fee", "fees", "charge", "rate", "rates"],
      answer:
        "I can't give prices or confirm timelines here — every job is quoted against the actual details, and the team will confirm. If you send the Request a Quote form with what you need (quantities, location and any timing that matters), the team can prepare a quotation. You can also chat with the team on WhatsApp.",
      action: "quote-whatsapp",
    },
    {
      id: "contact",
      label: "Contact the team",
      keywords: [
        "contact",
        "phone",
        "call",
        "email",
        "address",
        "office",
        "location",
        "where are you",
        "opening hours",
        "hours",
        "human",
        "team",
        "speak to someone",
        "talk to someone",
      ],
      answer:
        "You can reach the Empire D team on +234 701 500 5111, by email at hello@empiredltd.com, or on WhatsApp using the button below. The office address shown on the site is 12 Placeholder Crescent, Bodija, Ibadan, Oyo State, Nigeria. For a quotation, the Request a Quote form is the quickest route.",
      action: "contact",
    },
    {
      id: "about",
      label: "About Empire D",
      keywords: ["about", "who are you", "empire d", "company", "services", "what do you do"],
      answer:
        "Empire D Ltd is a Nigerian multi-service company with education at its core, alongside logistics and general procurement for public and private organisations. You can read more on the About page, or ask me about Education, Logistics or General Procurement.",
      action: "quote-whatsapp",
    },
    {
      id: "greeting",
      label: "Hello",
      keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
      answer:
        "Hello! I can help with Education, Logistics, General Procurement, a Request a Quote, or putting you in touch with the team. What would you like to know?",
    },
  ],
};
