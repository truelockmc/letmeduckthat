/**
 * LETMEDUCKTHAT app.js
 * Handles routing, link generation and the typing demo animation.
 */

/* =========================================================
   ROUTING
   ========================================================= */
(function () {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");

  if (q) {
    // We're on the demo / animation page
    document.getElementById("home-page").style.display = "none";
    startDemo(decodeURIComponent(q));
  }
})();

/* =========================================================
   URL HELPER
   Fix for local file:// protocol where location.origin === "null"
   ========================================================= */
function getBaseUrl() {
  // location.href always contains the full path; strip any existing query string
  return window.location.href.split("?")[0];
}

/* =========================================================
   HOME PAGE: link generation
   ========================================================= */
document
  .getElementById("query-input")
  .addEventListener("keydown", function (e) {
    if (e.key === "Enter") generateLink();
  });

function generateLink() {
  const val = document.getElementById("query-input").value.trim();
  if (!val) {
    shakeInput();
    return;
  }

  const url = getBaseUrl() + "?q=" + encodeURIComponent(val);
  const urlEl = document.getElementById("result-url");
  const box = document.getElementById("result-box");

  urlEl.textContent = url;
  box._currentUrl = url;
  box.classList.add("visible");

  // Scroll result into view on mobile
  setTimeout(
    () => box.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    50,
  );
}

function copyLink() {
  const url = document.getElementById("result-box")._currentUrl;
  if (!url) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(url)
      .then(showToast)
      .catch(fallbackCopy.bind(null, url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand("copy");
    showToast();
  } catch (e) {
    /* silent */
  }
  document.body.removeChild(ta);
}

function previewLink() {
  const url = document.getElementById("result-box")._currentUrl;
  if (url) window.open(url, "_blank");
}

function showToast() {
  const t = document.getElementById("toast");
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}

function shakeInput() {
  const input = document.getElementById("query-input");
  input.style.transition = "transform 0.06s";
  const shakes = [6, -5, 4, -3, 2, 0];
  shakes.forEach((x, i) => {
    setTimeout(() => {
      input.style.transform = `translateX(${x}px)`;
      if (i === shakes.length - 1) input.style.transform = "";
    }, i * 60);
  });
}

/* =========================================================
   DEMO PAGE: typing animation and redirect
   ========================================================= */
function startDemo(query) {
  const demoPage = document.getElementById("demo-page");
  const bar = document.getElementById("ddg-bar");
  const typedEl = document.getElementById("typed-text");
  const caret = document.getElementById("caret");
  const urlBar = document.getElementById("browser-url");
  const icon = document.getElementById("search-icon");
  const progressWrap = document.getElementById("progress-wrap");
  const progressFill = document.getElementById("progress-fill");
  const note = document.getElementById("redirect-note");

  demoPage.classList.add("active");
  demoPage.removeAttribute("aria-hidden");
  bar.classList.add("typing");

  let i = 0;
  const baseDelay = 130;
  const jitter = () => baseDelay + Math.random() * 120;

  function typeNext() {
    if (i <= query.length) {
      typedEl.textContent = query.slice(0, i);
      i++;
      setTimeout(typeNext, jitter());
    } else {
      onTypingDone();
    }
  }

  function onTypingDone() {
    caret.style.display = "none";
    bar.classList.remove("typing");
    bar.style.borderColor = "var(--duck-orange)";
    icon.classList.add("active");

    setTimeout(startRedirect, 600);
  }

  function startRedirect() {
    progressWrap.classList.add("visible");
    note.textContent = "Redirecting to DuckDuckGo…";

    let pct = 0;
    const ddgUrl = "https://duckduckgo.com/?q=" + encodeURIComponent(query);
    const displayUrl = "duckduckgo.com/?q=" + encodeURIComponent(query);

    const prog = setInterval(() => {
      pct = Math.min(pct + 2.5, 100);
      progressFill.style.width = pct + "%";

      // Update fake URL bar progressively
      if (pct > 30) urlBar.textContent = displayUrl;

      if (pct >= 100) {
        clearInterval(prog);
        setTimeout(() => {
          window.location.href = ddgUrl;
        }, 300);
      }
    }, 22);
  }

  // Kick off typing after a short pause
  setTimeout(typeNext, 450);
}
