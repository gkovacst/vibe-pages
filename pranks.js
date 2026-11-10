// Pranks:
// - a queue of timed surprises (floating objects, Viking ship, northern lights, moose,
//   snow, "Bálint is typing", winter darkness, then photos), one at a time: the first after
//   10 seconds, each next one 5–15 seconds after the previous has finished
//   (add ?prank to the URL for much shorter waits, for testing);
// - the send button runs away from the mouse twice on the last question;
// - reactions to specific options (Surströmming, "Hagyjál már ezzel", wine/pálinka,
//   räksmörgås, "Délben se", "Pörgősen"), and a tipsy wobble on pálinka;
// - silly loading messages while the answers are sent;
// - the tab title calls you back when you switch away;
// - Swedish Chef mode: click the "Stockholm" title 5 times;
// - ABBA disco: type "abba" anywhere.
window.Pranks = (function () {
  "use strict";

  const fast = new URLSearchParams(location.search).has("prank");
  const FIRST_AFTER_MS = fast ? 1000 : 10 * 1000;
  const GAP_MIN_MS = fast ? 1000 : 5 * 1000;
  const GAP_MAX_MS = fast ? 2000 : 15 * 1000;

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

  // Viking longship, prow on the right (it sails left to right). The oars row.
  const VIKING_SHIP = `<svg viewBox="0 0 170 110" width="150" height="97" aria-hidden="true">
    <g class="oars" stroke="#8d6e63" stroke-width="2.5" stroke-linecap="round">
      <line x1="45" y1="66" x2="33" y2="94"/><line x1="70" y1="70" x2="58" y2="98"/>
      <line x1="95" y1="70" x2="83" y2="98"/><line x1="120" y1="66" x2="108" y2="94"/>
    </g>
    <line x1="85" y1="6" x2="85" y2="60" stroke="#5d4037" stroke-width="3"/>
    <path d="M52 12H118Q122 34 118 52H52Q48 34 52 12Z" fill="#fafafa" stroke="#bdbdbd" stroke-width="1.5"/>
    <path d="M65 12H78V52H65ZM92 12H105V52H92Z" fill="#c62828"/>
    <path d="M14 54H156Q150 76 120 78H50Q20 76 14 54Z" fill="#8d5a3b"/>
    <path d="M150 56Q168 40 160 22Q153 28 156 37Q157 48 145 56Z" fill="#6d4c41"/>
    <path d="M22 56Q6 44 13 28Q17 38 24 45Z" fill="#6d4c41"/>
    <g stroke="#5d4037" stroke-width="1.5">
      <circle cx="42" cy="60" r="6" fill="#fbc02d"/><circle cx="60" cy="61" r="6" fill="#c62828"/>
      <circle cx="78" cy="61" r="6" fill="#fbc02d"/><circle cx="96" cy="61" r="6" fill="#c62828"/>
      <circle cx="114" cy="61" r="6" fill="#fbc02d"/><circle cx="132" cy="60" r="6" fill="#c62828"/>
    </g>
    <path d="M0 88Q14 82 28 88T56 88T84 88T112 88T140 88T170 88V96H0Z" fill="#4fc3f7" opacity=".6"/>
  </svg>`;

  // Swedish moose warning sign.
  const MOOSE_SIGN = `<svg viewBox="0 0 100 120" width="74" height="89" aria-hidden="true">
    <rect x="46" y="80" width="8" height="40" fill="#9e9e9e"/>
    <path d="M50 8L94 86H6Z" fill="#fdd835" stroke="#c62828" stroke-width="8" stroke-linejoin="round"/>
    <text x="50" y="74" text-anchor="middle" font-size="38">🫎</text>
  </svg>`;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

  function mooseCrossing() {
    const el = document.createElement("div");
    el.className = "moose-crossing";
    el.append(svg(MOOSE_SIGN), emoji("🫎"));
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

  // Adds `el` to the page and resolves when its own animation ends (with a time-based
  // safety net; a background tab may hold the event back, so wait until it's visible).
  function playOnce(el, maxSeconds) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        el.remove();
        resolve();
      };
      el.addEventListener("animationend", (e) => {
        if (e.target === el) finish();
      });
      const fallback = () => (document.hidden ? setTimeout(fallback, 1000) : finish());
      setTimeout(fallback, (maxSeconds + 2) * 1000);
      document.body.append(el);
    });
  }

  // Sends `content` across the screen. `ltr` forces the direction; `bottom` keeps it on the
  // bottom edge (for the ship) instead of a random height. Resolves once it has left the screen.
  function floatAcross(content, { ltr, bottom = false } = {}) {
    const wrap = document.createElement("div");
    wrap.className = "floater";
    if (ltr === false || (ltr === undefined && Math.random() < 0.5)) wrap.classList.add("rtl");
    if (bottom) {
      wrap.classList.add("floater-bottom");
    } else {
      wrap.style.top = `${8 + Math.random() * 62}vh`;
    }
    const seconds = 14 + Math.random() * 6;
    wrap.style.animationDuration = `${seconds}s`;
    const bob = document.createElement("div");
    bob.className = "floater-bob";
    bob.style.animationDelay = `${-Math.random() * 3}s`;
    bob.append(content);
    wrap.append(bob);
    return playOnce(wrap, seconds);
  }

  // Green and purple waves over the header photo.
  function northernLights() {
    const hero = document.querySelector(".hero");
    if (!hero) return Promise.resolve();
    const aurora = document.createElement("div");
    aurora.className = "aurora";
    aurora.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 3; i++) aurora.append(document.createElement("span"));
    return new Promise((resolve) => {
      aurora.addEventListener("animationend", (e) => {
        if (e.target !== aurora) return;
        aurora.remove();
        resolve();
      });
      hero.append(aurora);
    });
  }

  // Snow falls for a while and piles up along the bottom, then melts.
  async function snowfall() {
    const SNOW_MS = 12000;
    const pile = document.createElement("div");
    pile.className = "snow-pile";
    document.body.append(pile);
    requestAnimationFrame(() => pile.classList.add("growing"));

    const started = Date.now();
    while (Date.now() - started < SNOW_MS) {
      const flake = document.createElement("span");
      flake.className = "snowflake";
      flake.textContent = "❄";
      flake.style.left = `${Math.random() * 100}vw`;
      flake.style.fontSize = `${12 + Math.random() * 16}px`;
      flake.style.animationDuration = `${5 + Math.random() * 4}s, ${2 + Math.random() * 2}s`;
      flake.addEventListener("animationend", (e) => {
        if (e.animationName === "snow-fall") flake.remove();
      });
      document.body.append(flake);
      await sleep(120);
    }
    await sleep(6000); // let the last flakes land
    pile.classList.remove("growing");
    pile.classList.add("melting");
    await sleep(4000);
    pile.remove();
  }

  // A chat bubble that starts typing… and never sends anything.
  async function balintTyping() {
    const bubble = document.createElement("div");
    bubble.className = "typing-bubble";
    bubble.setAttribute("role", "status");
    bubble.innerHTML = 'Bálint éppen gépel<span class="typing-dots"><i></i><i></i><i></i></span>';
    document.body.append(bubble);
    await sleep(4500);
    bubble.classList.add("leaving");
    await sleep(400);
    bubble.remove();
  }

  // The page goes dark at "15:00" until someone asks for the lamp (or 12 seconds pass).
  function winterDarkness() {
    return new Promise((resolve) => {
      const night = document.createElement("div");
      night.className = "winter-night";
      const box = document.createElement("div");
      box.className = "winter-night-box";
      const text = document.createElement("p");
      text.textContent = "Stockholmban novemberben 15:00-kor sötét van. 🌑";
      const lamp = document.createElement("button");
      lamp.type = "button";
      lamp.className = "btn";
      lamp.textContent = "💡 Lámpát?";
      box.append(text, lamp);
      night.append(box);

      let done = false;
      const lightsOn = () => {
        if (done) return;
        done = true;
        night.classList.add("lights-on");
        setTimeout(() => {
          night.remove();
          resolve();
        }, 600);
      };
      lamp.addEventListener("click", lightsOn);
      setTimeout(lightsOn, 12000);
      document.body.append(night);
    });
  }

  // Photos need a verified visitor, so app.js hands over a loader once the email is accepted.
  let providePhotoLoader;
  const photoLoader = new Promise((r) => (providePhotoLoader = r));

  // The timed pranks, one at a time with a random pause between them.
  async function runQueue() {
    const gap = () => sleep(GAP_MIN_MS + Math.random() * (GAP_MAX_MS - GAP_MIN_MS));
    const items = [
      () => floatAcross(camel(), { ltr: true }), // the camel faces its direction of travel
      () => floatAcross(svg(VIKING_SHIP), { ltr: true, bottom: true }),
      () => floatAcross(emoji("🍄")),
      northernLights,
      () => floatAcross(svg(CANDLE)),
      balintTyping,
      () => floatAcross(mooseCrossing()),
      () => floatAcross(svg(BUCKET)),
      snowfall,
      winterDarkness,
      () => floatAcross(svg(BELFRY)),
    ];

    await sleep(FIRST_AFTER_MS);
    for (const item of items) {
      try {
        await item();
      } catch (err) {
        console.warn("A prank failed; moving on.", err);
      }
      await gap();
    }

    const loadPhotos = await photoLoader; // waits here until the visitor is verified
    let photos = [];
    try {
      photos = await loadPhotos();
    } catch (err) {
      console.warn("Prank photos could not be loaded.", err);
    }
    for (const src of photos) {
      await floatAcross(polaroid(src));
      await gap();
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
  // Matched against the option text (without emoji/link), so keep these in sync with the sheet.
  const REACTIONS = [
    { match: /surstr[öo]mming/i, text: "Bátor vagy. Vagy csak nem tudod, mi ez. 🤢", effect: (input) => puff(input) },
    { match: /hagyjál már ezzel/i, text: "Rendben, akkor csak 3 múzeum lesz. 🙂" },
    { match: /^(bor|naná, hogy pálinka)$/i, once: true, effect: (input) => ageCheck(input) },
    { match: /räksmörgås/i, effect: () => shrimpShower() },
    { match: /^délben se$/i, effect: () => sleepyDim() },
    { match: /^pörgősen/i, effect: () => progressSprint() },
  ];
  const firedOnce = new Set();

  function onOptionChecked(input) {
    const reaction = REACTIONS.find((r) => r.match.test(input.value));
    if (!reaction) return;
    if (reaction.once) {
      if (firedOnce.has(reaction)) return;
      firedOnce.add(reaction);
    }
    if (reaction.text) showReaction(input.closest("fieldset"), reaction.text);
    if (reaction.effect) reaction.effect(input);
  }

  function showReaction(fieldset, text) {
    let el = fieldset.querySelector(".reaction:not(.age-check)");
    if (!el) {
      el = document.createElement("p");
      el.className = "reaction";
      el.setAttribute("role", "status");
      fieldset.append(el);
    }
    el.textContent = text;
    el.hidden = false;
    clearTimeout(el.hideTimer);
    el.hideTimer = setTimeout(() => (el.hidden = true), 5000);
  }

  // Pálinka options wobble on hover (see .tipsy in styles.css).
  function decorateOption(label, value) {
    if (/pálinka/i.test(value)) label.classList.add("tipsy");
  }

  // A little 💨 cloud rising from the option.
  function puff(input) {
    const rect = (input.closest("label") || input).getBoundingClientRect();
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

  // Systembolaget only sells to people over 20.
  function ageCheck(input) {
    const fieldset = input.closest("fieldset");
    const box = document.createElement("div");
    box.className = "reaction age-check";
    box.setAttribute("role", "status");
    const text = document.createElement("p");
    text.textContent = "Elmúltál 20? 🍷 Svédországban csak 20 felett vehetsz bort a Systembolagetben.";
    const buttons = document.createElement("div");
    buttons.className = "age-check-buttons";
    ["Igen", "Sajnos igen"].forEach((label) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-small";
      b.textContent = label;
      b.addEventListener("click", () => {
        text.textContent = "Skål! 🥂";
        buttons.remove();
        setTimeout(() => box.remove(), 2000);
      });
      buttons.append(b);
    });
    box.append(text, buttons);
    fieldset.append(box);
  }

  function shrimpShower() {
    for (let i = 0; i < 16; i++) {
      const s = document.createElement("span");
      s.className = "shrimp";
      s.textContent = "🦐";
      s.style.left = `${Math.random() * 95}vw`;
      s.style.animationDelay = `${Math.random() * 0.8}s`;
      s.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
      s.addEventListener("animationend", () => s.remove());
      document.body.append(s);
    }
  }

  function sleepyDim() {
    const dim = document.createElement("div");
    dim.className = "sleepy";
    dim.textContent = "Psszt, alszik 😴";
    dim.addEventListener("animationend", () => dim.remove());
    document.body.append(dim);
  }

  // The progress bar dashes to 100%, then creeps back to where it really is.
  function progressSprint() {
    const bar = document.querySelector(".progress");
    if (!bar || bar.classList.contains("sprint")) return;
    bar.classList.add("sprint");
    setTimeout(() => {
      bar.classList.remove("sprint");
      bar.classList.add("creep");
      setTimeout(() => bar.classList.remove("creep"), 2000);
    }, 1200);
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

  // ---------- Tab title calls you back ----------
  const originalTitle = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "Hé, gyere vissza! 🇸🇪" : originalTitle;
  });

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

  // ---------- ABBA disco: type "abba" anywhere ----------
  const DISCO_MS = 5000;
  let typed = "";
  let discoing = false;

  function disco() {
    discoing = true;
    document.documentElement.classList.add("disco");
    const ball = document.createElement("div");
    ball.className = "disco-ball";
    ball.textContent = "🪩";
    const lights = document.createElement("div");
    lights.className = "disco-lights";
    document.body.append(lights, ball);
    setTimeout(() => {
      document.documentElement.classList.remove("disco");
      ball.remove();
      lights.remove();
      discoing = false;
    }, DISCO_MS);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-4);
    if (typed === "abba" && !discoing) {
      typed = "";
      disco();
    }
  });

  runQueue();

  return {
    setPhotoLoader(fn) {
      providePhotoLoader(fn); // only the first call counts
    },
    setRunaway,
    onOptionChecked,
    decorateOption,
    withLoadingMessages,
  };
})();
