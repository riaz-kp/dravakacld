/* ==========================================================================
   DRAVAKA — site scripts
   Vanilla JS, no dependencies. Progressive enhancement only: every page
   remains readable and navigable with JavaScript disabled.
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var page = doc.body.getAttribute("data-page") || "";

  /* ---------- current-page highlighting ---------- */
  function markCurrent() {
    doc.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === page) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- mobile navigation ---------- */
  function initNav() {
    var toggle = doc.querySelector(".nav-toggle");
    var drawer = doc.querySelector(".mobile-nav");
    var backdrop = doc.querySelector(".nav-backdrop");
    if (!toggle || !drawer) return;

    function open() {
      drawer.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      if (backdrop) backdrop.hidden = false;
      doc.body.style.overflow = "hidden";
      var first = drawer.querySelector("a, button");
      if (first) first.focus();
    }
    function close() {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      if (backdrop) backdrop.hidden = true;
      doc.body.style.overflow = "";
    }
    toggle.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? close() : open();
    });
    if (backdrop) backdrop.addEventListener("click", close);
    var closeBtn = drawer.querySelector("[data-nav-close]");
    if (closeBtn) closeBtn.addEventListener("click", close);
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) { close(); toggle.focus(); }
    });
  }

  /* ---------- search ---------- */
  var SEARCH_INDEX = [
    { t: "Scuba diving",            u: "adventures.html#scuba",     k: "scuba dive diving try dive dsd fun dive open water course padi" },
    { t: "Try Dive / DSD",          u: "adventures.html#trydive",   k: "try dive discover scuba dsd beginner first time no experience" },
    { t: "Zero to Hero courses",    u: "adventures.html#courses",   k: "course open water advanced rescue divemaster idc efr zero to hero certification" },
    { t: "Snorkelling",             u: "adventures.html#snorkel",   k: "snorkel snorkelling surface reef swim" },
    { t: "Free diving",             u: "adventures.html#freedive",  k: "free diving apnea breath hold" },
    { t: "Dive locations",          u: "adventures.html#locations", k: "murudeshwar kaup udupi pondicherry kovalam lakshadweep andaman netrani location site" },
    { t: "Book your adventure",     u: "booking.html",              k: "book booking reserve pay payment liability form insurance" },
    { t: "Trekking & camping",      u: "adventures.html#land",      k: "trek trekking camping hike kayaking surfing rafting paragliding bungee" },
    { t: "Join the Tribe",          u: "join.html",                 k: "join tribe membership member programme program volunteer sign up" },
    { t: "Our missions",            u: "missions.html",             k: "mission plastic free ocean beach clean up mangrove coral waste management awareness" },
    { t: "Beach clean-ups",         u: "missions.html#beach",       k: "beach clean up cleanup litter plastic shoreline" },
    { t: "Coral regeneration",      u: "missions.html#coral",       k: "coral regeneration reef nursery restoration" },
    { t: "Mangrove cultivation",    u: "missions.html#mangrove",    k: "mangrove cultivation planting saplings estuary" },
    { t: "Our impact",              u: "impact.html",               k: "impact stories numbers results contribution report" },
    { t: "News & updates",          u: "news.html",                 k: "news update best time to dive equipment trekking camping season" },
    { t: "Gallery",                 u: "gallery.html",              k: "gallery photos videos pictures album reef underwater" },
    { t: "Shop",                    u: "shop.html",                 k: "shop store buy merch bottle tee t-shirt dry bag mask gear" },
    { t: "Donate",                  u: "donate.html",               k: "donate donation foundation give support fund contribute monthly" },
    { t: "About Dravaka",           u: "about.html",                k: "about who we are story team values responsibility" },
    { t: "Contact us",              u: "contact.html",              k: "contact phone whatsapp email address reach visit" },
    { t: "Help centre & FAQ",       u: "help.html",                 k: "help faq questions answers support environment save earth" },
    { t: "Terms & conditions",      u: "terms.html",                k: "terms conditions booking policy liability rules" },
    { t: "Privacy policy",          u: "privacy.html",              k: "privacy data personal information cookies" },
    { t: "Refund policy",           u: "refund.html",               k: "refund cancel cancellation money back reschedule return" }
  ];

  function initSearch() {
    var panel = doc.querySelector(".search-panel");
    var toggles = doc.querySelectorAll("[data-search-toggle]");
    if (!panel || !toggles.length) return;

    var input = panel.querySelector("input[type='search']");
    var results = panel.querySelector("[data-search-results]");

    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var willOpen = panel.hidden;
        panel.hidden = !willOpen;
        btn.setAttribute("aria-expanded", String(willOpen));
        if (willOpen && input) input.focus();
      });
    });

    if (!input || !results) return;

    function render(q) {
      var query = q.trim().toLowerCase();
      if (query.length < 2) { results.innerHTML = ""; return; }
      var hits = SEARCH_INDEX.filter(function (item) {
        return (item.t + " " + item.k).toLowerCase().indexOf(query) > -1;
      }).slice(0, 6);

      results.innerHTML = hits.length
        ? '<p class="small muted mb-1">' + hits.length + ' result' + (hits.length > 1 ? 's' : '') + '</p><ul class="search-cats">' +
          hits.map(function (h) { return '<li><a href="' + h.u + '">' + h.t + '</a></li>'; }).join("") + "</ul>"
        : '<p class="small muted">Nothing matched “' + query.replace(/[<>&]/g, "") + '”. Try “dive”, “beach clean-up” or “membership”.</p>';
    }

    input.addEventListener("input", function () { render(input.value); });
    panel.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      render(input.value);
    });
  }

  /* ---------- hero bubbles ---------- */
  function initBubbles() {
    var host = doc.querySelector(".hero-bubbles");
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    for (var i = 0; i < 16; i++) {
      var b = doc.createElement("span");
      var size = 5 + Math.random() * 22;
      b.style.width = size + "px";
      b.style.height = size + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.animationDuration = (11 + Math.random() * 16) + "s";
      b.style.animationDelay = (Math.random() * -22) + "s";
      host.appendChild(b);
    }
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var items = doc.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- countdown to next tribe gathering ---------- */
  function initCountdown() {
    var host = doc.querySelector("[data-countdown]");
    if (!host) return;
    var target = new Date(host.getAttribute("data-countdown")).getTime();
    if (isNaN(target)) return;
    // Evergreen: if the seed date has passed, roll it forward month by month
    // so the counter keeps pointing at the next gathering.
    if (host.getAttribute("data-countdown-repeat") === "monthly") {
      var d = new Date(target);
      while (d.getTime() < Date.now()) { d.setMonth(d.getMonth() + 1); }
      target = d.getTime();
      var label = doc.querySelector("[data-countdown-date]");
      if (label) {
        label.textContent = d.toLocaleDateString("en-IN",
          { weekday: "long", day: "numeric", month: "long" });
      }
    }
    var cells = {
      days:    host.querySelector("[data-cd='days'] strong"),
      hours:   host.querySelector("[data-cd='hours'] strong"),
      minutes: host.querySelector("[data-cd='minutes'] strong"),
      seconds: host.querySelector("[data-cd='seconds'] strong")
    };
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        host.innerHTML = '<p class="mb-0"><strong>Happening now.</strong> Come and find us on the sand.</p>';
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      if (cells.days)    cells.days.textContent    = pad(Math.floor(s / 86400));
      if (cells.hours)   cells.hours.textContent   = pad(Math.floor(s % 86400 / 3600));
      if (cells.minutes) cells.minutes.textContent = pad(Math.floor(s % 3600 / 60));
      if (cells.seconds) cells.seconds.textContent = pad(s % 60);
    }
    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------- gallery / card filters ---------- */
  function initFilters() {
    doc.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var targetSel = group.getAttribute("data-filter-target");
      var targets = doc.querySelectorAll(targetSel + " [data-cat]");
      group.querySelectorAll("button").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var cat = btn.getAttribute("data-filter");
          group.querySelectorAll("button").forEach(function (b) {
            b.setAttribute("aria-pressed", String(b === btn));
          });
          targets.forEach(function (el) {
            var match = cat === "all" || el.getAttribute("data-cat").split(" ").indexOf(cat) > -1;
            el.style.display = match ? "" : "none";
          });
        });
      });
    });
  }

  /* ---------- forms ----------
     No backend is wired up. Forms validate in the browser and show a
     confirmation panel so the flow can be reviewed end to end. Connect
     the `action` attribute to a real endpoint before going live.       */
  function initForms() {
    doc.querySelectorAll("form[data-demo-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;

        var box = form.querySelector("[data-form-msg]") ||
                  doc.querySelector(form.getAttribute("data-form-msg-target") || "");
        var name = (form.querySelector("[name='name']") || {}).value || "";
        if (box) {
          var tpl = box.getAttribute("data-msg-template");
          if (tpl) box.querySelector("[data-msg-body]").innerHTML = tpl.replace("{name}", name.split(" ")[0] || "friend");
          box.hidden = false;
          box.scrollIntoView({ behavior: "smooth", block: "center" });
          box.setAttribute("tabindex", "-1");
          box.focus({ preventScroll: true });
        }
        form.reset();
      });
    });
  }

  /* ---------- donation amount → summary ---------- */
  function initDonate() {
    var form = doc.querySelector("[data-donate-form]");
    if (!form) return;
    var out = form.querySelector("[data-donate-total]");
    var custom = form.querySelector("[name='custom-amount']");
    var freq = form.querySelectorAll("[name='frequency']");

    function amount() {
      var checked = form.querySelector("[name='amount']:checked");
      var val = checked ? checked.value : "";
      if (val === "custom") return parseInt(custom && custom.value, 10) || 0;
      return parseInt(val, 10) || 0;
    }
    function update() {
      if (!out) return;
      var f = form.querySelector("[name='frequency']:checked");
      var suffix = f && f.value === "monthly" ? " / month" : " once";
      out.textContent = "₹" + amount().toLocaleString("en-IN") + suffix;
      if (custom) custom.disabled = !(form.querySelector("[name='amount']:checked") || {}).value ||
                                    (form.querySelector("[name='amount']:checked") || {}).value !== "custom";
    }
    form.addEventListener("change", update);
    form.addEventListener("input", update);
    freq.forEach(function (r) { r.addEventListener("change", update); });
    update();
  }

  /* ---------- footer year ---------- */
  function initYear() {
    doc.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- boot ---------- */
  function boot() {
    markCurrent();
    initNav();
    initSearch();
    initBubbles();
    initReveal();
    initCountdown();
    initFilters();
    initForms();
    initDonate();
    initYear();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
