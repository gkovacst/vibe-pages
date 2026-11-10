(function () {
  "use strict";

  const API_URL = (window.SURVEY_CONFIG && window.SURVEY_CONFIG.appsScriptUrl) || "";
  // Questions come from the "Questions" sheet, sent by the backend after verification.
  let questions = [];

  const $ = (id) => document.getElementById(id);
  const steps = { verify: $("step-verify"), survey: $("step-survey"), done: $("step-done") };
  let user = null; // { name, email }
  let current = 0; // index of the question being shown
  // "Changing your mind" tracking for the indecision nudge, per question id.
  const NUDGE_AFTER = 3;
  let mindChanges = {};
  let lastRadio = {};

  if (!API_URL) $("config-banner").hidden = false;

  function show(step) {
    Object.entries(steps).forEach(([key, el]) => (el.hidden = key !== step));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showError(el, message) {
    el.textContent = message;
    el.hidden = !message;
  }

  function setBusy(form, busy, label) {
    const btn = form.querySelector('button[type="submit"]');
    if (busy) btn.dataset.label = btn.textContent;
    btn.disabled = busy;
    btn.textContent = busy ? label : btn.dataset.label;
  }

  async function api(payload) {
    // text/plain avoids a CORS preflight, which Apps Script doesn't support.
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  // ---------- Rendering ----------

  // "⛵ Vasa Múzeum | https://www.vasamuseet.se"
  //   → { emoji: "⛵", value: "Vasa Múzeum", url: "https://www.vasamuseet.se", exclusive: false }
  // Emoji and link are both optional. Only http(s) links are accepted.
  // A leading "!" marks an exclusive option ("none of these"): ticking it clears the
  // other answers in that question, and ticking anything else clears it.
  const EMOJI_PREFIX = /^((?:\p{Extended_Pictographic}|\p{Regional_Indicator})[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}\u200d\ufe0f]*)\s+(.+)$/u;
  const LINK_SUFFIX = /^(.*?)\s*\|\s*(https?:\/\/\S+)\s*$/i;
  function parseOption(line) {
    let rest = String(line).trim();
    const exclusive = rest.startsWith("!");
    if (exclusive) rest = rest.slice(1).trim();
    let url = "";
    const link = rest.match(LINK_SUFFIX);
    if (link) [, rest, url] = link;
    const m = rest.match(EMOJI_PREFIX);
    return m ? { emoji: m[1], value: m[2], url, exclusive } : { emoji: "", value: rest, url, exclusive };
  }

  function renderQuestions() {
    const container = $("questions");
    container.innerHTML = "";
    questions.forEach((q, i) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "question";
      fieldset.dataset.id = q.id;

      const legend = document.createElement("legend");
      legend.innerHTML = `<span class="q-num">${i + 1}</span>`;
      legend.append(document.createTextNode(q.title));
      if (q.required) {
        const star = document.createElement("span");
        star.className = "required";
        star.textContent = " *";
        legend.append(star);
      }
      fieldset.append(legend);

      if (q.hint) {
        const hint = document.createElement("p");
        hint.className = "hint";
        hint.textContent = q.hint;
        fieldset.append(hint);
      }

      if (q.type === "text") {
        const ta = document.createElement("textarea");
        ta.name = q.id;
        ta.rows = 4;
        ta.maxLength = 2000;
        ta.placeholder = q.placeholder || "";
        fieldset.append(ta);
      } else {
        const grid = document.createElement("div");
        grid.className = "options";
        q.options.map(parseOption).forEach((opt) => {
          const label = document.createElement("label");
          label.className = "option";
          const input = document.createElement("input");
          input.type = q.type === "radio" ? "radio" : "checkbox";
          input.name = q.id;
          input.value = opt.value;
          if (opt.exclusive && q.type === "checkbox") {
            input.dataset.exclusive = "true";
            label.classList.add("exclusive");
          }
          const emoji = document.createElement("span");
          emoji.className = "emoji";
          emoji.textContent = opt.emoji;
          const text = document.createElement("span");
          text.className = "option-text";
          text.textContent = opt.value;
          label.append(input, emoji, text);
          if (opt.url) {
            const a = document.createElement("a");
            a.className = "option-link";
            a.href = opt.url;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            a.textContent = "Infó ↗";
            a.title = "Részletek új lapon";
            label.append(a);
          }
          grid.append(label);
        });
        fieldset.append(grid);
        const nudge = document.createElement("p");
        nudge.className = "nudge";
        nudge.setAttribute("role", "status");
        nudge.textContent = "Na most már igazán eldönthetnéd! 🙄";
        nudge.hidden = true;
        fieldset.append(nudge);
      }
      container.append(fieldset);
    });
  }

  function fillAnswers(answers) {
    const form = $("survey-form");
    questions.forEach((q) => {
      const raw = answers[q.id];
      if (raw == null || raw === "") return;
      if (q.type === "text") {
        form.elements[q.id].value = raw;
      } else {
        const values = q.type === "checkbox" ? String(raw).split("\n") : [String(raw)];
        form.querySelectorAll(`input[name="${q.id}"]`).forEach((input) => {
          input.checked = values.includes(input.value);
        });
      }
    });
  }

  function readAnswer(q) {
    const form = $("survey-form");
    let value;
    if (q.type === "text") {
      value = form.elements[q.id].value.trim();
    } else if (q.type === "checkbox") {
      value = [...form.querySelectorAll(`input[name="${q.id}"]:checked`)].map((i) => i.value);
    } else {
      const checked = form.querySelector(`input[name="${q.id}"]:checked`);
      value = checked ? checked.value : "";
    }
    const empty = Array.isArray(value) ? value.length === 0 : !value;
    return { value, missing: q.required && empty };
  }

  // ---------- One question at a time ----------

  function goTo(index) {
    current = Math.max(0, Math.min(index, questions.length - 1));
    [...$("questions").children].forEach((fs, i) => (fs.hidden = i !== current));
    const last = current === questions.length - 1;
    $("next-btn").textContent = last ? "Válaszok elküldése" : "Tovább →";
    $("progress-text").textContent = `${current + 1} / ${questions.length}`;
    $("progress-fill").style.width = `${((current + 1) / questions.length) * 100}%`;
    showError($("survey-error"), "");
    // Bring the question back into view if the user had scrolled down.
    const top = steps.survey.getBoundingClientRect().top;
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 24, behavior: "smooth" });
  }

  // Returns true if the question is answered (or optional); otherwise shows why not.
  function validate(index) {
    const q = questions[index];
    const { missing } = readAnswer(q);
    $("questions").children[index].classList.toggle("invalid", missing);
    if (missing) {
      const messages = { checkbox: "Kérlek, válassz legalább egyet.", radio: "Kérlek, válassz egyet.", text: "Kérlek, válaszolj a kérdésre." };
      showError($("survey-error"), messages[q.type]);
    }
    return !missing;
  }

  // ---------- Events ----------

  // ---------- Prank: freemail.hu addresses ----------
  // A freemail address first gets a fake "not supported" error with the button disabled.
  // Two seconds later the joke is revealed and the button works again. It only plays once.
  const FREEMAIL = /@freemail\.hu$/i;
  let prankTimer = null;
  let prankShown = false;
  let prankDone = false;

  $("verify-form").elements.email.addEventListener("input", (e) => {
    const btn = $("verify-form").querySelector('button[type="submit"]');
    const errorEl = $("verify-error");
    const isFreemail = FREEMAIL.test(e.target.value.trim());

    if (isFreemail && !prankTimer && !prankDone) {
      btn.disabled = true;
      showError(errorEl, "Sajnos a freemail fiók nem támogatott, próbálja újra!");
      prankShown = true;
      prankTimer = setTimeout(() => {
        const reveal = document.createElement("span");
        reveal.className = "prank-reveal";
        reveal.textContent = " Csak vicceltem Bálint, kattints a továbbra! 😄";
        errorEl.append(reveal);
        btn.disabled = false;
        prankTimer = null;
        prankDone = true;
      }, 2000);
    } else if (!isFreemail && prankShown) {
      // They edited the address away from freemail: drop the joke (and restart it next time
      // if it hadn't been revealed yet).
      clearTimeout(prankTimer);
      prankTimer = null;
      prankShown = false;
      btn.disabled = false;
      showError(errorEl, "");
    }
  });

  $("verify-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const errorEl = $("verify-error");

    if (!name) return showError(errorEl, "Kérlek, add meg a neved.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError(errorEl, "Kérlek, adj meg egy érvényes email címet.");
    showError(errorEl, "");

    setBusy(form, true, "Ellenőrzés…");
    try {
      const res = await api({ action: "verify", name, email });
      if (!res.ok) {
        showError(
          errorEl,
          res.error === "not_whitelisted"
            ? "Trükkös vagy, de ez bizony nem helyes email cím. 😏"
            : res.error || "Valami hiba történt. Kérlek, próbáld újra."
        );
        return;
      }
      if (!Array.isArray(res.questions)) {
        console.error("Backend response has no questions; the Apps Script deployment is outdated.", res);
        showError(errorEl, "A kérdőív még nincs teljesen beállítva (régi Apps Script verzió fut). Kérlek, szólj nekünk!");
        return;
      }
      if (res.questions.length === 0) {
        console.error("The Questions sheet returned no usable rows.", res);
        showError(errorEl, "Még nincsenek kérdések a kérdőívben. Kérlek, szólj nekünk!");
        return;
      }
      user = { name, email };
      questions = res.questions;
      $("greet-name").textContent = name.split(" ")[0];
      renderQuestions();
      $("returning-note").hidden = !res.previous;
      if (res.previous) fillAnswers(res.previous.answers || {});
      mindChanges = {};
      lastRadio = {};
      questions.filter((q) => q.type === "radio").forEach((q) => (lastRadio[q.id] = readAnswer(q).value));
      show("survey");
      goTo(0);
    } catch (err) {
      console.error(err);
      showError(errorEl, "Nem sikerült elérni a szervert. Ellenőrizd az internetkapcsolatot, és próbáld újra.");
    } finally {
      setBusy(form, false);
    }
  });

  $("survey-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorEl = $("survey-error");

    if (!validate(current)) return;
    if (current < questions.length - 1) return goTo(current + 1);

    // Last question: every answer is checked once more before sending.
    const answers = {};
    let firstMissing = -1;
    questions.forEach((q, i) => {
      const { value, missing } = readAnswer(q);
      answers[q.id] = value;
      if (missing && firstMissing === -1) firstMissing = i;
    });
    if (firstMissing !== -1) {
      goTo(firstMissing);
      validate(firstMissing);
      return;
    }

    setBusy(form, true, "Küldés…");
    try {
      const res = await api({ action: "submit", ...user, answers });
      if (!res.ok) {
        showError(errorEl, res.error === "not_whitelisted" ? "Az email címed nincs a vendéglistán." : res.error || "Valami hiba történt.");
        return;
      }
      show("done");
    } catch (err) {
      console.error(err);
      showError(errorEl, "Nem sikerült elmenteni a válaszaidat. Kérlek, próbáld újra.");
    } finally {
      setBusy(form, false);
    }
  });

  $("questions").addEventListener("change", (e) => {
    const input = e.target;
    const fieldset = input.closest("fieldset");
    if (!fieldset) return;
    // Clear the red highlight as soon as a question gets answered.
    fieldset.classList.remove("invalid");
    showError($("survey-error"), "");
    // An exclusive option can't be combined with the others in the same question.
    let clearedOthers = false;
    if (input.type === "checkbox" && input.checked) {
      fieldset.querySelectorAll('input[type="checkbox"]').forEach((other) => {
        if (other !== input && other.checked && (input.dataset.exclusive || other.dataset.exclusive)) {
          other.checked = false;
          clearedOthers = true;
        }
      });
    }

    // Indecision nudge: changing your mind (unticking, switching a single choice,
    // or an exclusive option clearing others) 3 times shows a message; the next
    // change of any kind hides it and starts the count again.
    const id = fieldset.dataset.id;
    let changedMind = false;
    if (input.type === "checkbox") {
      changedMind = !input.checked || clearedOthers;
    } else if (input.type === "radio") {
      changedMind = Boolean(lastRadio[id]) && lastRadio[id] !== input.value;
      lastRadio[id] = input.value;
    }
    const nudge = fieldset.querySelector(".nudge");
    let nudging = false;
    if (nudge && !nudge.hidden) {
      nudge.hidden = true;
      mindChanges[id] = 0;
    } else if (nudge && changedMind) {
      mindChanges[id] = (mindChanges[id] || 0) + 1;
      nudging = mindChanges[id] >= NUDGE_AFTER;
      nudge.hidden = !nudging;
    }

    // Single-choice questions move on by themselves after a short pause
    // (unless we're busy teasing the user about their indecision).
    if (input.type === "radio" && !nudging && current < questions.length - 1) {
      const from = current;
      setTimeout(() => { if (current === from) goTo(current + 1); }, 350);
    }
  });

  $("back-btn").addEventListener("click", () => (current > 0 ? goTo(current - 1) : show("verify")));
  $("edit-btn").addEventListener("click", () => {
    show("survey");
    goTo(0);
  });
})();
