/* ══════════════════════════════════════════════════════════════════════════
   EMPIRE D LTD — site behaviour
   Progressive enhancement only: every page works without JavaScript.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;

  /* ── Sticky header: shadow once the page has scrolled ─────────────────── */
  var header = doc.querySelector("[data-header]");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── Mobile navigation ───────────────────────────────────────────────── */
  var toggle = doc.querySelector("[data-nav-toggle]");
  var drawer = doc.querySelector("[data-mobile-nav]");

  if (toggle && drawer) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.classList.toggle("is-open", open);
      doc.body.classList.toggle("nav-open", open);
    };

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      setNav(open);
      if (open) {
        var first = drawer.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      }
    });

    drawer.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNav(false);
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });

    var mq = window.matchMedia("(min-width: 980px)");
    var onMQ = function (event) {
      if (event.matches) setNav(false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onMQ);
    else if (mq.addListener) mq.addListener(onMQ);
  }

  /* ── Reveal on scroll ─────────────────────────────────────────────────── */
  var reveals = Array.prototype.slice.call(doc.querySelectorAll("[data-reveal]"));
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reveals.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) {
        el.classList.add("is-in");
      });
    } else {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      reveals.forEach(function (el) {
        observer.observe(el);
      });
    }
  }

  /* ── Contact form: preselect the service from ?service= ──────────────── */
  var serviceSelect = doc.querySelector("select[data-service]");
  if (serviceSelect) {
    var wanted = new URLSearchParams(window.location.search).get("service");
    if (wanted) {
      Array.prototype.forEach.call(serviceSelect.options, function (option) {
        if (option.value.toLowerCase() === wanted.toLowerCase()) serviceSelect.value = option.value;
      });
    }
  }

  /* ── Contact form: friendly validation feedback ──────────────────────── */
  var form = doc.querySelector("[data-quote-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");

    form.addEventListener("submit", function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }

      /* Netlify receives the POST. If the browser blocks it (offline, or
         previewing the files locally) tell the visitor what to do instead. */
      var action = form.getAttribute("action");
      var isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|.*\.e2b\.app)$/.test(window.location.hostname);
      if (isLocal && status) {
        event.preventDefault();
        status.hidden = false;
        status.classList.add("is-error");
        status.textContent =
          "This form only submits once the site is deployed to Netlify. Meanwhile, please call, email or WhatsApp us — details alongside.";
        status.scrollIntoView({ block: "center", behavior: "smooth" });
      } else if (action === null) {
        event.preventDefault();
      }
    });
  }
})();
