/* ══════════════════════════════════════════════════════════════════════════
   DEE — Empire D assistant (scripted today, AI-ready)
   ──────────────────────────────────────────────────────────────────────────
   Knowledge comes from src/data/assistant-knowledge.ts, converted at build
   time to assets/js/assistant-knowledge.js (window.DEE_KNOWLEDGE).

   Dee answers known topics instantly from that knowledge file — no network
   call, no prices/dates/promises invented. For anything she cannot match,
   she tries the Netlify Function at /.netlify/functions/chat (stub today)
   and, if that is unavailable, offers the quote form / WhatsApp instead.

   No API key exists in this file or anywhere in front-end code. A future
   AI provider key belongs only in the Netlify environment variable used
   by netlify/functions/chat.js.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var ENDPOINT = "/.netlify/functions/chat";
  var rootEl = document.querySelector("[data-dee]");
  if (!rootEl) return;

  var knowledge = window.DEE_KNOWLEDGE || null;
  var openBtn = rootEl.querySelector("[data-dee-open]");
  var panel = rootEl.querySelector("[data-dee-panel]");
  var closeBtn = rootEl.querySelector("[data-dee-close]");
  var messagesEl = rootEl.querySelector("[data-dee-messages]");
  var form = rootEl.querySelector("[data-dee-form]");
  var input = rootEl.querySelector("[data-dee-input]");
  var chips = Array.prototype.slice.call(rootEl.querySelectorAll("[data-dee-chip]"));
  if (!openBtn || !panel || !messagesEl || !form || !input) return;

  var quoteHref = rootEl.getAttribute("data-quote-href") || "/contact/";
  var whatsappHref = rootEl.getAttribute("data-whatsapp-href") || "/contact/";
  var history = [];
  var isOpen = false;

  function normalise(text) {
    return " " + String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
  }

  function matchTopic(text) {
    if (!knowledge || !knowledge.topics) return null;
    var haystack = normalise(text);
    var best = null;
    var bestScore = 0;
    knowledge.topics.forEach(function (topic) {
      if (normalise(topic.label) === haystack) {
        best = topic;
        bestScore = 999;
        return;
      }
      var score = 0;
      (topic.keywords || []).forEach(function (keyword) {
        if (haystack.indexOf(normalise(keyword).trim()) !== -1) score += keyword.length > 5 ? 2 : 1;
      });
      // Quote intent always wins over a service mention ("price for logistics").
      if (topic.id === "quote" && /\b(price|pricing|cost|quote|quotation|how much|fee|fees|rate)\b/.test(haystack)) score += 3;
      if (score > bestScore) {
        best = topic;
        bestScore = score;
      }
    });
    return bestScore > 0 ? best : null;
  }

  function addMessage(text, who) {
    var wrap = document.createElement("div");
    wrap.className = "dee-msg dee-msg--" + who;
    var p = document.createElement("p");
    p.textContent = text;
    wrap.appendChild(p);
    messagesEl.appendChild(wrap);
    history.push({ role: who === "user" ? "user" : "assistant", text: text });
    if (history.length > 12) history = history.slice(-12);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrap;
  }

  function addActions(action) {
    if (!action) return;
    var row = document.createElement("div");
    row.className = "dee-msg__actions";
    function makeLink(href, label, external) {
      var a = document.createElement("a");
      a.className = "dee-action dee-action--inline";
      a.href = href;
      a.textContent = label;
      if (external) {
        a.target = "_blank";
        a.rel = "noopener";
      }
      return a;
    }
    if (action === "quote" || action === "quote-whatsapp" || action === "contact") {
      row.appendChild(makeLink(quoteHref, "Request a Quote", false));
    }
    if (action === "whatsapp" || action === "quote-whatsapp" || action === "contact") {
      row.appendChild(makeLink(whatsappHref, "Chat on WhatsApp", true));
    }
    if (row.childNodes.length) messagesEl.appendChild(row);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "dee-msg dee-msg--bot dee-msg--typing";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function tryRemote(text) {
    if (!window.fetch) return Promise.resolve(null);
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, 6000) : null;
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: history.slice(-6) }),
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        if (timer) window.clearTimeout(timer);
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        return data && typeof data.reply === "string" && data.reply.trim() ? data.reply.trim() : null;
      })
      .catch(function () {
        if (timer) window.clearTimeout(timer);
        return null;
      });
  }

  function answer(text) {
    var topic = matchTopic(text);
    if (topic) {
      var typing1 = showTyping();
      window.setTimeout(function () {
        typing1.remove();
        addMessage(topic.answer, "bot");
        addActions(topic.action);
        input.focus({ preventScroll: true });
      }, 320);
      return;
    }
    var typing2 = showTyping();
    tryRemote(text).then(function (reply) {
      typing2.remove();
      if (reply) {
        addMessage(reply, "bot");
      } else if (knowledge) {
        addMessage(knowledge.fallback, "bot");
        addActions("quote-whatsapp");
      } else {
        addMessage(
          "I can't answer that here. The Empire D team will confirm — please use the Request a Quote form or chat with the team on WhatsApp.",
          "bot"
        );
        addActions("quote-whatsapp");
      }
      input.focus({ preventScroll: true });
    });
  }

  function ask(text) {
    var clean = String(text || "").trim();
    if (!clean) return;
    addMessage(clean, "user");
    answer(clean);
  }

  function setOpen(open) {
    isOpen = open;
    panel.hidden = !open;
    panel.classList.toggle("is-open", open);
    openBtn.setAttribute("aria-expanded", String(open));
    openBtn.setAttribute("aria-label", open ? "Close chat with Dee, Empire D assistant" : "Chat with Dee, Empire D assistant");
    if (open) {
      input.focus({ preventScroll: true });
    } else {
      openBtn.focus({ preventScroll: true });
    }
  }

  openBtn.addEventListener("click", function () {
    setOpen(!isOpen);
  });
  if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen) setOpen(false);
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      ask(chip.getAttribute("data-dee-chip") || chip.textContent);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = input.value;
    input.value = "";
    ask(value);
  });
})();
