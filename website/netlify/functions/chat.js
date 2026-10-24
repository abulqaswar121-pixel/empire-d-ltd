/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  Dee — chat endpoint stub  ·  served at /.netlify/functions/chat
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  TODAY: this is a safe stub. The website already answers from scripted
 *  knowledge (src/data/assistant-knowledge.ts) in the browser, so Dee works
 *  without this function. Unknown questions call this endpoint, get a
 *  graceful "not configured" response, and fall back to offering the
 *  Request a Quote form / Chat on WhatsApp button.
 *
 *  TO CONNECT A REAL AI SERVICE LATER (server-side only):
 *    1. In Netlify: Site settings → Environment variables, add
 *         DEE_AI_API_KEY = <your provider key>
 *       (optionally DEE_AI_MODEL). Never put the key in front-end code,
 *       site.config.js, or this repository.
 *    2. Below, where marked TODO, call your provider with:
 *         - the system rules (mirror DEE_RULES from
 *           src/data/assistant-knowledge.ts: never invent prices, dates or
 *           promises; quotes are confirmed by the team), and
 *         - the visitor message + recent history from the JSON body.
 *    3. Return { reply: "..." } as JSON. Keep answers grounded in the
 *       knowledge file's topics; do not let the model invent facts.
 *
 *  The key is read ONLY from process.env here on the server. It is never
 *  logged, never echoed, and never sent to the browser.
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use strict";

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

function respond(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "method_not_allowed", reply: null, fallback: true });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return respond(400, { error: "invalid_json", reply: null, fallback: true });
  }

  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, 1000) : "";
  if (!message) {
    return respond(400, { error: "message_required", reply: null, fallback: true });
  }

  // Server-only secret. Set DEE_AI_API_KEY in Netlify environment variables.
  const apiKey = process.env.DEE_AI_API_KEY;
  if (!apiKey) {
    return respond(501, {
      error: "assistant_not_configured",
      reply: null,
      fallback: true,
      message: "Dee's AI service is not connected yet. Please use the quote form or WhatsApp and the team will confirm.",
    });
  }

  // TODO: call the AI provider here using apiKey (server-side only), with
  // DEE_RULES + the assistant knowledge as grounding. Return its reply as
  // { reply }. Until that is wired up, stay a safe stub — never guess.
  return respond(501, {
    error: "assistant_not_configured",
    reply: null,
    fallback: true,
    message: "Dee's AI service is not connected yet. Please use the quote form or WhatsApp and the team will confirm.",
  });
};
