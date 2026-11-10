// Pranks:
// - a parade of floating objects after a few minutes, then floating photos
//   (add ?prank to the URL to see them within seconds, for testing);
// - the send button runs away from the mouse twice on the last question;
// - reactions to specific options (Surströmming, "Hagyjál már ezzel");
// - silly loading messages while the answers are sent;
// - Swedish Chef mode: click the "Stockholm" title 5 times.
window.Pranks = (function () {
  "use strict";

  const fast = new URLSearchParams(location.search).has("prank");
  const OBJECTS_AFTER_MS = fast ? 2000 : 2 * 60 * 1000;
  const PHOTOS_AFTER_MS = fast ? 12000 : 4 * 60 * 1000;

  // Mécses (All Saints' Day grave candle).
  const CANDLE = `<svg viewBox="0 0 60 96" width="54" height="86" aria-hidden="true">
    <g class="flame">
      <path d="M30 2C40 16 40 26 30 34C20 26 20 16 30 2Z" fill="#ffa000"/>
      <path d="M30 12C35 20 35 26 30 31C25 26 25 20 30 12Z" fill="#ffe082"/>
    </g>
    <rect x="12" y="32" width="36" height="9" rx="2" fill="#d4af37"/>
    <g fill="#8a6d1c"><circle cx="20" cy="36.5" r="1.5"/><circle cx="26" cy="36.5" r="1.5"/><circle cx="34" cy="36.5" r="1.5"/><circle cx="40" cy="36.5" r="1.5"/></g>
    <path d="M11 41H49L45 92Q30 96 15 92Z" fill="#c62828"/>
    <path d="M17 45H22L20 88H18Z" fill="#fff" opacity=".25"/>
  </svg>`;

  // Felmosó vödör, felmosóval.
  const BUCKET = `<svg viewBox="0 0 100 110" width="96" height="106" aria-hidden="true">
    <path d="M22 54Q50 16 78 54" stroke="#616161" stroke-width="3" fill="none"/>
    <path d="M16 52H84L76 106H24Z" fill="#1e88e5"/>
    <path d="M22 58H30L28 100H26Z" fill="#fff" opacity=".2"/>
    <rect x="13" y="46" width="74" height="9" rx="3" fill="#1565c0"/>
    <ellipse cx="44" cy="50" rx="26" ry="3.5" fill="#81d4fa"/>
    <rect x="62" y="36" width="24" height="14" rx="2" fill="#fdd835"/>
    <rect x="66" y="40" width="16" height="3" rx="1.5" fill="#f9a825"/>
    <g stroke="#eceff1" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M32 50q-5-7 1-13"/><path d="M38 50q-2-9 4-13"/><path d="M44 50q2-8-2-13"/><path d="M50 50q5-7 0-12"/>
    </g>
    <line x1="42" y1="40" x2="70" y2="4" stroke="#a1887f" stroke-width="5" stroke-linecap="round"/>
  </svg>`;

  // Belfort van Brugge.
  const BELFRY = `<svg viewBox="0 0 70 160" width="62" height="142" aria-hidden="true">
    <path d="M29 14L35 3L41 14Z" fill="#5d4037"/>
    <rect x="22" y="14" width="26" height="44" fill="#d7b98e"/>
    <rect x="22" y="14" width="26" height="4" fill="#8d6e4a"/>
    <rect x="27" y="21" width="4" height="10" rx="2" fill="#5d4037"/>
    <rect x="39" y="21" width="4" height="10" rx="2" fill="#5d4037"/>
    <circle cx="35" cy="43" r="7" fill="#fdf6e3" stroke="#5d4037" stroke-width="1.5"/>
    <path d="M35 43V38.5M35 43L38.5 45" stroke="#3e2723" stroke-width="1.4" stroke-linecap="round"/>
    <rect x="14" y="58" width="42" height="40" fill="#a0603c"/>
    <rect x="10" y="52" width="8" height="46" fill="#8d4f30"/>
    <path d="M10 52L14 42L18 52Z" fill="#5d4037"/>
    <rect x="52" y="52" width="8" height="46" fill="#8d4f30"/>
    <path d="M52 52L56 42L60 52Z" fill="#5d4037"/>
    <rect x="25" y="66" width="7" height="20" rx="3.5" fill="#4e342e"/>
    <rect x="38" y="66" width="7" height="20" rx="3.5" fill="#4e342e"/>
    <rect x="8" y="98" width="54" height="60" fill="#9c5a37"/>
    <rect x="8" y="98" width="54" height="5" fill="#7b4428"/>
    <rect x="16" y="110" width="6" height="16" rx="3" fill="#4e342e"/>
    <rect x="48" y="110" width="6" height="16" rx="3" fill="#4e342e"/>
    <path d="M29 158V141a6 6 0 0 1 12 0V158Z" fill="#4e342e"/>
  </svg>`;

  function emoji(char) {
    const el = document.createElement("div");
    el.className = "floater-emoji";
    el.textContent = char;
    return el;
  }

  function svg(markup) {
    const el = document.createElement("div");
    el.innerHTML = markup;
    return el;
  }

  // Camel Cup racer, towing a banner like a little plane.
  function camel() {
    const el = document.createElement("div");
    el.className = "camel";
    const banner = document.createElement("span");
    banner.className = "camel-banner";
    banner.textContent = "CAMEL CUP 🏆";
    const rider = emoji("🐪");
    rider.classList.add("camel-rider");
    el.append(banner, rider);
    return el;
  }

  function polaroid(src) {
    const el = document.createElement("div");
    el.className = "polaroid";
    el.style.setProperty("--tilt", `${Math.round(Math.random() * 16 - 8)}deg`);
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    el.append(img);
    return el;
  }

  // Sends `content` across the screen at a random height. `ltr` forces the direction.
  function floatAcross(content, delaySeconds, ltr) {
    const wrap = document.createElement("div");
    wrap.className = "floater";
    if (ltr === false || (ltr === undefined && Math.random() < 0.5)) wrap.classList.add("rtl");
    wrap.style.top = `${8 + Math.random() * 62}vh`;
    wrap.style.animationDuration = `${18 + Math.random() * 10}s`;
    wrap.style.animationDelay = `${delaySeconds}s`;
    const bob = document.createElement("div");
    bob.className = "floater-bob";
    bob.style.animationDelay = `${-Math.random() * 3}s`;
    bob.append(content);
    wrap.append(bob);
    wrap.addEventListener("animationend", (e) => {
      if (e.target === wrap) wrap.remove();
    });
    document.body.append(wrap);
  }

  function parade() {
    floatAcross(camel(), 0, true); // the camel faces its direction of travel
    floatAcross(emoji("🍄"), 4);
    floatAcross(svg(CANDLE), 8);
    floatAcross(svg(BUCKET), 12);
    floatAcross(svg(BELFRY), 16);
  }

  // Photos need a verified visitor, so app.js hands over a loader once the email is accepted.
  let photosDue = false;
  let loadPhotos = null;
  let photosShown = false;

  async function maybeShowPhotos() {
    if (!photosDue || !loadPhotos || photosShown) return;
    photosShown = true;
    try {
      const photos = await loadPhotos();
      photos.forEach((src, i) => floatAcross(polaroid(src), i * 3));
    } catch (err) {
      console.warn("Prank photos could not be loaded.", err);
    }
  }

  // ---------- Runaway send button ----------
  const canHover = window.matchMedia("(hover: hover)").matches; // no dodging on touch screens
  let runawayButton = null;
  let runawayActive = false;
  let dodgesLeft = 2;

  function dodge() {
    if (!runawayActive || dodgesLeft <= 0) return;
    dodgesLeft -= 1;
    // The button sits on the right edge of the card, so it only jumps left (and up or down).
    const x = -(100 + Math.random() * 140);
    const y = (Math.random() < 0.5 ? -1 : 1) * (15 + Math.random() * 30);
    runawayButton.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  function setRunaway(button, active) {
    if (!runawayButton) {
      runawayButton = button;
      runawayButton.classList.add("runaway");
      if (canHover) runawayButton.addEventListener("mouseenter", dodge);
    }
    runawayActive = active;
    if (!active) runawayButton.style.transform = "";
  }

  // ---------- Reactions to specific options ----------
  const REACTIONS = [
    { match: /surstr[öo]mming/i, text: "Bátor vagy. Vagy csak nem tudod, mi ez. 🤢", puff: true },
    { match: /hagyjál már ezzel/i, text: "Rendben, akkor csak 3 múzeum lesz. 🙂" },
  ];

  function onOptionChecked(input) {
    const reaction = REACTIONS.find((r) => r.match.test(input.value));
    if (!reaction) return;
    const fieldset = input.closest("fieldset");
    let el = fieldset.querySelector(".reaction");
    if (!el) {
      el = document.createElement("p");
      el.className = "reaction";
      el.setAttribute("role", "status");
      fieldset.append(el);
    }
    el.textContent = reaction.text;
    el.hidden = false;
    clearTimeout(el.hideTimer);
    el.hideTimer = setTimeout(() => (el.hidden = true), 5000);
    if (reaction.puff) puff(input.closest("label") || input);
  }

  // A little 💨 cloud rising from the option.
  function puff(anchor) {
    const rect = anchor.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const p = document.createElement("span");
      p.className = "puff";
      p.textContent = "💨";
      p.style.left = `${rect.left + rect.width * (0.15 + Math.random() * 0.6)}px`;
      p.style.top = `${rect.top + rect.height * 0.3}px`;
      p.style.animationDelay = `${i * 120}ms`;
      p.addEventListener("animationend", () => p.remove());
      document.body.append(p);
    }
  }

  // ---------- Loading messages while sending ----------
  const LOADING_MESSAGES = ["Pálinkaszint mérése…", "Surströmming kibontása…", "Bálint értesítése…"];
  const LOADING_STEP_MS = 900;

  // Shows the messages in `el` until `promise` settles, and for long enough to read them all.
  async function withLoadingMessages(el, promise) {
    let i = 0;
    el.textContent = LOADING_MESSAGES[0];
    el.hidden = false;
    const timer = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      el.textContent = LOADING_MESSAGES[i];
    }, LOADING_STEP_MS);
    const minimum = new Promise((r) => setTimeout(r, LOADING_MESSAGES.length * LOADING_STEP_MS));
    try {
      const [result] = await Promise.all([promise, minimum]);
      return result;
    } finally {
      clearInterval(timer);
      el.hidden = true;
    }
  }

  // ---------- Swedish Chef mode ----------
  const BORK_CLICKS = 5;
  const BORK_MS = 5000;
  let titleClicks = 0;
  let lastTitleClick = 0;
  let borking = false;

  function bork() {
    borking = true;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        n.parentElement.closest("script, style, textarea, .floater") || !/\p{L}/u.test(n.nodeValue)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    const saved = [];
    while (walker.nextNode()) saved.push([walker.currentNode, walker.currentNode.nodeValue]);
    saved.forEach(([node, text]) => {
      node.nodeValue = text.replace(/\p{L}+/gu, (w) => (w[0] !== w[0].toLowerCase() ? "Bork" : "bork"));
    });
    setTimeout(() => {
      saved.forEach(([node, text]) => (node.nodeValue = text));
      borking = false;
    }, BORK_MS);
  }

  const title = document.querySelector(".hero h1");
  if (title) {
    title.addEventListener("click", () => {
      const now = Date.now();
      titleClicks = now - lastTitleClick < 800 ? titleClicks + 1 : 1;
      lastTitleClick = now;
      if (titleClicks >= BORK_CLICKS && !borking) {
        titleClicks = 0;
        bork();
      }
    });
  }

  setTimeout(parade, OBJECTS_AFTER_MS);
  setTimeout(() => {
    photosDue = true;
    maybeShowPhotos();
  }, PHOTOS_AFTER_MS);

  return {
    setPhotoLoader(fn) {
      loadPhotos = fn;
      maybeShowPhotos();
    },
    setRunaway,
    onOptionChecked,
    withLoadingMessages,
  };
})();
