(() => {
  "use strict";
  const C = window.CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  const state = { audioOK: true, started: false, userPaused: false, track: "pink", submitting: false, submitted: false, noCount: 0, noFinal: false, switching: 0 };

  /* ---------- screens ---------- */
  let currentId = "s-terms";
  function show(id, delay = 450) {
    const cur = $("#" + currentId), next = $("#" + id);
    if (!next || cur === next) return;
    $("#noBtn").hidden = id !== "s-invite";
    cur.classList.add("out");
    setTimeout(() => {
      cur.classList.remove("active", "out");
      next.classList.add("active");
      next.scrollTop = 0;
      currentId = id;
      document.body.dataset.screen = id;
    }, delay);
  }

  /* ---------- toast ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 5000);
  }

  /* ---------- audio ---------- */
  const audio = new Audio();
  audio.loop = true; audio.preload = "auto"; audio.volume = 0;
  let fadeTimer;
  function fade(to, ms) {
    return new Promise((res) => {
      clearInterval(fadeTimer);
      const from = audio.volume, t0 = performance.now();
      fadeTimer = setInterval(() => {
        const p = Math.min(1, (performance.now() - t0) / ms);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * p));
        if (p >= 1) { clearInterval(fadeTimer); res(); }
      }, 30);
    });
  }
  const player = $("#player"), disc = $("#disc");
  function updatePlayer() {
    const playing = state.audioOK && !state.userPaused && !audio.paused;
    player.classList.toggle("playing", playing);
    player.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    $("#trackName").textContent = C.tracks[state.track].label;
  }
  function audioFail() {
    if (!state.audioOK) return;
    state.audioOK = false; player.hidden = true;
    toast("The music isn't available right now, but everything else still works :)");
  }
  audio.addEventListener("error", () => { if (state.started) audioFail(); });
  async function startTrack(key) {
    state.track = key; audio.src = C.tracks[key].src; audio.volume = 0;
    try { await audio.play(); player.hidden = false; updatePlayer(); await fade(C.volume, C.fadeIn); }
    catch (e) { audioFail(); }
  }
  async function switchTrack(key) {
    if (!state.audioOK || state.track === key) return;
    const ticket = ++state.switching;
    if (!audio.paused) await fade(0, C.fadeOut);
    if (ticket !== state.switching) return;
    audio.pause();
    state.track = key; audio.src = C.tracks[key].src; audio.volume = 0; updatePlayer();
    if (state.userPaused) return;
    try { await audio.play(); updatePlayer(); await fade(C.volume, C.fadeIn); }
    catch (e) { audioFail(); }
  }
  player.addEventListener("click", async () => {
    if (!state.audioOK) return;
    if (audio.paused) {
      state.userPaused = false;
      try { await audio.play(); updatePlayer(); await fade(C.volume, 900); } catch (e) { audioFail(); }
    } else {
      state.userPaused = true; await fade(0, 600); audio.pause(); updatePlayer();
    }
  });
  audio.addEventListener("pause", updatePlayer);
  audio.addEventListener("play", updatePlayer);

  /* ---------- terms ---------- */
  const agree = $("#agree"), cont = $("#termsContinue");
  agree.addEventListener("change", () => (cont.disabled = !agree.checked));
  cont.addEventListener("click", () => agree.checked && show("s-disc"));

  /* ---------- disc intro ---------- */
  disc.addEventListener("click", () => {
    if (state.started) return;
    state.started = true;
    disc.classList.add("playing");
    startTrack("pink");
    setTimeout(() => show("s-invite"), 700);
  });

  /* ---------- invitation ---------- */
  const yes = $("#yesBtn"), no = $("#noBtn"), msg = $("#inviteMsg"), row = $(".row");
  function dodge() {
    // The card uses backdrop-filter, which traps fixed children, so the button moves to <body> while dodging.
    if (no.parentElement !== document.body) {
      const r = no.getBoundingClientRect();
      document.body.appendChild(no);
      no.classList.add("fly");
      no.style.left = r.left + "px"; no.style.top = r.top + "px";
      void no.offsetWidth;
    }
    const vw = document.documentElement.clientWidth, vh = innerHeight, m = 16;
    const w = no.offsetWidth, h = no.offsetHeight;
    const y = yes.getBoundingClientRect(), card = $(".invite-card").getBoundingClientRect();
    const maxX = Math.max(m, vw - w - m), maxY = Math.max(m, vh - h - m);
    let x0 = m, y0 = m;
    for (let i = 0; i < 30; i++) {
      const x = m + Math.random() * (maxX - m), t = m + Math.random() * (maxY - m);
      const hitsYes = x < y.right + 20 && x + w > y.left - 20 && t < y.bottom + 20 && t + h > y.top - 20;
      const hitsCard = i < 20 && x < card.right && x + w > card.left && t < card.bottom && t + h > card.top;
      x0 = x; y0 = t;
      if (!hitsYes && !hitsCard) break;
    }
    no.style.left = Math.min(maxX, Math.max(m, x0)) + "px";
    no.style.top = Math.min(maxY, Math.max(m, y0)) + "px";
  }
  no.addEventListener("click", () => {
    if (state.noFinal) { show("s-decline"); return; }
    state.noCount++;
    yes.style.setProperty("--yf", Math.min(2.8, 1.5 + state.noCount * 0.26) + "rem");
    if (state.noCount >= C.noLimit) {
      state.noFinal = true;
      row.appendChild(no); no.classList.remove("fly"); no.style.left = no.style.top = "";
      no.textContent = C.noFinalLabel; msg.textContent = C.noFinalMessage;
    } else {
      msg.textContent = C.noMessages[(state.noCount - 1) % C.noMessages.length];
      dodge();
    }
  });
  yes.addEventListener("click", () => {
    show("s-yay");
    setTimeout(() => show("s-plan", 450), 2600);
  });

  /* ---------- planner ---------- */
  const form = $("#planForm"), steps = $$(".step", form), bars = $$("#progress i");
  let step = 1;
  $("#proposedTime").textContent = C.proposedTime;
  $("#mapLink").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.cafe.name + " " + C.cafe.address);
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(), todayStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  form.date.min = todayStr;
  $("#cafeImg").addEventListener("error", (e) => (e.target.hidden = true));

  function goStep(n) {
    step = n;
    steps.forEach((s) => s.classList.toggle("active", +s.dataset.step === n));
    bars.forEach((b, i) => { b.classList.toggle("on", i < n); b.classList.toggle("cur", i === n - 1); });
    const f = $(".step.active input:not([type=radio]):not([hidden]), .step.active textarea", form);
    if (f && fine) f.focus({ preventScroll: true });
  }
  goStep(1);
  $$("[name=timeChoice]", form).forEach((r) => r.addEventListener("change", () => ($("#altTimeBox").hidden = form.timeChoice.value !== "other")));
  $$("[name=cafeChoice]", form).forEach((r) => r.addEventListener("change", () => ($("#altCafeBox").hidden = form.cafeChoice.value !== "other")));

  function validate(n) {
    let m = "";
    if (n === 1) { const v = form.date.value; if (!v) m = "Please pick a date first."; else if (v < todayStr) m = "Please choose today or a later date."; }
    if (n === 2) { const c = form.timeChoice.value; if (!c) m = "Please choose one option."; else if (c === "other" && !form.altTime.value) m = "Please enter the time that works for you."; }
    if (n === 3) { const c = form.cafeChoice.value; if (!c) m = "Please choose one option."; else if (c === "other" && !form.altCafe.value.trim()) m = "Please tell me where you'd like to go."; }
    if (n === 4) { if (!form.after.value) m = "Please choose one option."; }
    const e = $(".err", steps[n - 1]); if (e) e.textContent = m;
    return !m;
  }
  $$(".next", form).forEach((b) => b.addEventListener("click", () => validate(step) && goStep(step + 1)));
  $$(".back", form).forEach((b) => b.addEventListener("click", () => goStep(step - 1)));
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && step < 5) { e.preventDefault(); validate(step) && goStep(step + 1); }
  });

  const prettyDate = (v) => new Date(v + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const prettyTime = (v) => { const [h, m] = v.split(":").map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h >= 12 ? "PM" : "AM"}`; };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (state.submitting || state.submitted) return;
    for (let i = 1; i <= 4; i++) if (!validate(i)) { goStep(i); return; }
    const btn = $("#submitBtn"), err = $("#formError");
    const timeOther = form.timeChoice.value === "other", cafeOther = form.cafeChoice.value === "other";
    const payload = {
      _subject: "Als answered your date invitation :)",
      invitation: "Accepted (YES)",
      selected_date: prettyDate(form.date.value),
      selected_date_raw: form.date.value,
      preferred_time: timeOther ? prettyTime(form.altTime.value) : C.proposedTime,
      time_response: timeOther ? "Suggested another time" : "Confirmed " + C.proposedTime,
      cafe_preference: cafeOther ? "Suggested another place" : "Confirmed " + C.cafe.name,
      alternative_cafe: cafeOther ? form.altCafe.value.trim() : "",
      after_lunch_preference: form.after.value,
      suggested_activities_or_places: form.afterNote.value.trim(),
      additional_notes: form.notes.value.trim()
    };
    state.submitting = true; btn.disabled = true; btn.textContent = "Sending..."; err.textContent = "";
    try {
      const res = await fetch(C.formspree, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("Request failed: " + res.status);
      state.submitted = true; btn.textContent = "Sent \u2661";
      document.body.classList.add("final");
      show("s-final", 600);
      switchTrack("love");
    } catch (x) {
      err.textContent = "Your answers didn't send. Nothing was lost, so please check your connection and try again.";
      btn.disabled = false; btn.textContent = "Try again";
    } finally { state.submitting = false; }
  });

  /* ---------- card decorations ---------- */
  $$(".card").forEach((c) => ["tl", "br"].forEach((pos) => {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "lily corner " + pos); s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<use href="#lily"/>'; c.appendChild(s);
  }));

  /* ---------- ambient effects ---------- */
  const rand = (a, b) => a + Math.random() * (b - a);
  function sparkle(x, y, n = 1) {
    for (let i = 0; i < n; i++) {
      if ($$(".sparkle").length > 40) return;
      const s = document.createElement("span");
      s.className = "sparkle"; s.textContent = Math.random() > 0.5 ? "\u2726" : "\u2727";
      s.style.left = x + rand(-8, 8) + "px"; s.style.top = y + rand(-8, 8) + "px";
      s.style.setProperty("--dx", rand(-26, 26) + "px"); s.style.setProperty("--dy", rand(10, 36) + "px");
      s.style.fontSize = rand(8, 16) + "px";
      document.body.appendChild(s); setTimeout(() => s.remove(), 950);
    }
  }
  const mouse = { x: -999, y: -999 };
  if (!reduce) {
    let last = 0;
    addEventListener("pointermove", (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      if (e.pointerType === "mouse") {
        root.style.setProperty("--mx", (e.clientX / innerWidth - 0.5) * 2);
        root.style.setProperty("--my", (e.clientY / innerHeight - 0.5) * 2);
        const now = performance.now();
        if (now - last > 55 && document.body.dataset.screen !== "s-terms") { last = now; sparkle(e.clientX, e.clientY); }
      }
    }, { passive: true });
    addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" && document.body.dataset.screen !== "s-terms") sparkle(e.clientX, e.clientY, 6);
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    addEventListener("pointerup", () => { mouse.x = mouse.y = -999; }, { passive: true });
  }

  // custom cursor ring (desktop only)
  if (fine) {
    const c = $("#cursor"); let cx = 0, cy = 0;
    addEventListener("pointermove", (e) => {
      c.classList.add("on");
      c.classList.toggle("hot", !!e.target.closest("button,a,.opt,input,textarea,label"));
      c._x = e.clientX; c._y = e.clientY;
    }, { passive: true });
    document.addEventListener("mouseleave", () => c.classList.remove("on"));
    (function tick() {
      if (c._x !== undefined) { cx += (c._x - cx) * 0.22; cy += (c._y - cy) * 0.22; c.style.transform = `translate(${cx}px,${cy}px)`; }
      requestAnimationFrame(tick);
    })();
  }

  // petals (canvas)
  const cv = $("#petals"), ctx = cv.getContext("2d");
  let W = 0, H = 0, petals = [];
  const colors = ["255,205,218", "250,180,198", "255,226,232", "240,160,184", "255,240,236"];
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makePetal(top) {
    return { x: rand(0, W), y: top ? rand(-H, 0) : rand(0, H), s: rand(6, 14), vy: rand(0.25, 0.7), vx: rand(-0.2, 0.2), r: rand(0, 6.28), vr: rand(-0.02, 0.02), ph: rand(0, 6.28), px: 0, py: 0, c: colors[(Math.random() * colors.length) | 0], a: rand(0.5, 0.85) };
  }
  if (!reduce) {
    resize(); addEventListener("resize", resize);
    const N = fine ? 26 : 16;
    for (let i = 0; i < N; i++) petals.push(makePetal(false));
    (function frame() {
      ctx.clearRect(0, 0, W, H);
      if (document.body.dataset.screen !== "s-terms" && !document.hidden) {
        for (const p of petals) {
          p.ph += 0.012;
          const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
          if (dist < 130) { const f = (1 - dist / 130) * 1.1; p.px += (dx / dist) * f; p.py += (dy / dist) * f; }
          p.px *= 0.94; p.py *= 0.94;
          p.x += p.vx + Math.sin(p.ph) * 0.45 + p.px; p.y += p.vy + p.py; p.r += p.vr;
          if (p.y > H + 20 || p.x < -30 || p.x > W + 30) Object.assign(p, makePetal(true), { x: rand(0, W), y: -20 });
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, 0.6 + 0.4 * Math.sin(p.ph * 1.5));
          ctx.fillStyle = `rgba(${p.c},${p.a})`; ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.28); ctx.fill(); ctx.restore();
        }
      }
      requestAnimationFrame(frame);
    })();
    // floating hearts
    setInterval(() => {
      if (document.hidden || ["s-terms", "s-disc"].includes(document.body.dataset.screen) || $$(".heart").length > 8) return;
      const h = document.createElement("span");
      h.className = "heart"; h.textContent = "\u2661"; h.style.left = rand(5, 95) + "vw"; h.style.fontSize = rand(14, 30) + "px";
      h.style.setProperty("--sx", rand(-60, 60) + "px"); document.body.appendChild(h); setTimeout(() => h.remove(), 9100);
    }, 1800);
  } else { cv.hidden = true; }
})();
