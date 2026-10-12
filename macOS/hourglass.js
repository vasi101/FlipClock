"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const stage = $("hourglass-stage"), canvas = $("hourglass-canvas"), ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let state = { duration: 300000, remaining: 300000, running: false, finished: false, display: "00:05:00" };
  let frame = 0, last = 0, elapsed = 0, width = 0, height = 0, dpr = 1;
  const grains = Array.from({ length: 260 }, (_, i) => ({ x: ((i * 73.37) % 1000) / 1000, y: ((i * 197.17) % 1000) / 1000, size: .7 + (i % 7) * .19, speed: 28 + (i % 19) * 2.5, phase: i * 2.399 }));
  function resize() {
    const rect = canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    dpr = Math.min(devicePixelRatio || 1, 2); width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(canvas.width / 400, 0, 0, canvas.height / 700, 0, 0); paint();
  }
  function chamberTop() {
    ctx.beginPath(); ctx.moveTo(86, 105); ctx.bezierCurveTo(78, 190, 113, 255, 190, 330); ctx.quadraticCurveTo(200, 341, 210, 330); ctx.bezierCurveTo(287, 255, 322, 190, 314, 105); ctx.closePath();
  }
  function chamberBottom() {
    ctx.beginPath(); ctx.moveTo(190, 370); ctx.quadraticCurveTo(200, 359, 210, 370); ctx.bezierCurveTo(287, 445, 322, 510, 314, 595); ctx.quadraticCurveTo(200, 635, 86, 595); ctx.bezierCurveTo(78, 510, 113, 445, 190, 370); ctx.closePath();
  }
  function paint() {
    if (!width) return;
    const p = Math.max(0, Math.min(1, 1 - state.remaining / Math.max(1, state.duration)));
    ctx.setTransform(canvas.width / 400, 0, 0, canvas.height / 700, 0, 0); ctx.clearRect(0, 0, 400, 700);
    // Fine circular progress arc, echoing the reference composition.
    ctx.beginPath(); ctx.arc(200, 355, 181, -.5 * Math.PI, -.5 * Math.PI + p * Math.PI * 2); ctx.strokeStyle = "#d8a15b55"; ctx.lineWidth = 1.2; ctx.stroke();
    const angle = -.5 * Math.PI + p * Math.PI * 2; ctx.beginPath(); ctx.arc(200 + 181 * Math.cos(angle), 355 + 181 * Math.sin(angle), 3.2, 0, Math.PI * 2); ctx.fillStyle = "#ffe0ad"; ctx.fill();
    ctx.save(); ctx.translate(200, 0); ctx.scale(1.32, 1); ctx.translate(-200, 0);
    // Warm shadow and wood caps.
    const glow = ctx.createRadialGradient(200, 595, 10, 200, 595, 190); glow.addColorStop(0, "#d2833627"); glow.addColorStop(1, "#d2833600"); ctx.fillStyle = glow; ctx.fillRect(0, 410, 400, 230);
    const cap = (y, flip = false) => { ctx.save(); if (flip) { ctx.translate(0, 700); ctx.scale(1, -1); } ctx.beginPath(); ctx.roundRect(77, 76, 246, 32, 15); ctx.fillStyle = "#352419"; ctx.fill(); ctx.strokeStyle = "#b38a654a"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.beginPath(); ctx.roundRect(81, 78, 238, 4, 2); ctx.fillStyle = "#e6bd8a33"; ctx.fill(); ctx.restore(); };
    cap(0); cap(0, true);
    // Chamber fill is clipped to the interior silhouette: levels are exact functions of timer progress.
    ctx.save(); chamberTop(); ctx.clip();
    const upperY = 159 + 185 * p;
    const upperGrad = ctx.createLinearGradient(0, upperY, 0, 350); upperGrad.addColorStop(0, "#ffd18a"); upperGrad.addColorStop(.25, "#d5893d"); upperGrad.addColorStop(1, "#8e4b20");
    ctx.beginPath(); ctx.moveTo(20, upperY - 9); ctx.quadraticCurveTo(105, upperY - 2, 200, upperY + 8); ctx.quadraticCurveTo(295, upperY - 1, 380, upperY - 8); ctx.lineTo(220, 351); ctx.lineTo(180, 351); ctx.closePath(); ctx.fillStyle = upperGrad; ctx.fill();
    ctx.restore();
    ctx.save(); chamberBottom(); ctx.clip();
    const baseY = 617, peakY = 590 - 208 * p, spread = 30 + 154 * p;
    const lowerGrad = ctx.createLinearGradient(0, peakY, 0, baseY); lowerGrad.addColorStop(0, "#f6bb70"); lowerGrad.addColorStop(.42, "#c27632"); lowerGrad.addColorStop(1, "#70401f");
    ctx.beginPath(); ctx.moveTo(200 - spread, baseY); ctx.quadraticCurveTo(200, 2 * peakY - baseY, 200 + spread, baseY); ctx.closePath(); ctx.fillStyle = lowerGrad; ctx.fill(); ctx.restore();
    // Gravity-driven grains stay within the neck and are clipped by the lower chamber.
    if (state.running && !reduce.matches) {
      ctx.save(); chamberBottom(); ctx.clip();
      for (const g of grains) {
        const t = ((elapsed * g.speed / 380 + g.phase) % 1), y = 357 + t * Math.max(0, peakY - 365), spreadX = 1.5 + (y - 357) * .025;
        const x = 200 + Math.sin(g.phase + elapsed * .7) * spreadX;
        ctx.globalAlpha = .35 + .65 * Math.sin(Math.PI * t); ctx.fillStyle = g.phase % 4 < 1 ? "#ffe0a1" : "#e5a454"; ctx.beginPath(); ctx.arc(x, y, g.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    // Reflective glass outline and long soft highlights.
    ctx.save(); ctx.strokeStyle = "#d9e2e340"; ctx.lineWidth = 2.5; chamberTop(); ctx.stroke(); chamberBottom(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(91, 126); ctx.bezierCurveTo(75, 180, 97, 230, 124, 258); ctx.strokeStyle = "#fff4dc75"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(309, 128); ctx.bezierCurveTo(325, 184, 299, 233, 274, 259); ctx.strokeStyle = "#d9e9f344"; ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(96, 585); ctx.bezierCurveTo(104, 514, 146, 455, 190, 374); ctx.strokeStyle = "#dce4e344"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(305, 585); ctx.bezierCurveTo(296, 514, 254, 455, 210, 374); ctx.strokeStyle = "#fff7e655"; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    // A narrow illuminated throat sells the uninterrupted stream.
    if (state.running && !state.finished) { const beam = ctx.createLinearGradient(0, 342, 0, 369); beam.addColorStop(0, "#eeb46400"); beam.addColorStop(.5, "#ffce7caa"); beam.addColorStop(1, "#eeb46400"); ctx.fillStyle = beam; ctx.fillRect(196, 340, 8, 34); }
    if (state.finished) { const finish = ctx.createRadialGradient(200, 355, 8, 200, 355, 185); finish.addColorStop(0, "#f4c17b20"); finish.addColorStop(1, "#f4c17b00"); ctx.fillStyle = finish; ctx.fillRect(0, 170, 400, 370); }
    ctx.restore();
  }
  function loop(now) { frame = 0; if (!state.running || document.hidden || reduce.matches) return; elapsed += last ? Math.min(50, now - last) / 1000 : 0; last = now; paint(); frame = requestAnimationFrame(loop); }
  function sync(next) { state = next; const [hh, mm, ss] = state.display.split(":"); $("hourglass-display").textContent = hh !== "00" ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`; $("hourglass-start").classList.toggle("is-running", state.running); stage.classList.toggle("is-finished", state.finished); $("hourglass-start").setAttribute("aria-label", state.finished ? "Stop alarm and reset timer" : state.running ? "Pause timer" : "Start timer"); const endPrompt = $("hourglass-end-prompt"); if (endPrompt) endPrompt.hidden = !state.finished; if (state.running && !document.hidden && !reduce.matches && !frame) { last = 0; frame = requestAnimationFrame(loop); } if (!state.running && frame) { cancelAnimationFrame(frame); frame = 0; } paint(); }
  globalThis.onFlipTimerUpdate = sync;
  $("hourglass-enable").onclick = () => { document.body.classList.add("hourglass-mode"); stage.hidden = false; $("timer-panel").hidden = true; $("timer-toggle").setAttribute("aria-expanded", "false"); resize(); };
  $("hourglass-exit").onclick = () => { stage.hidden = true; document.body.classList.remove("hourglass-mode"); };
  $("hourglass-start").onclick = () => $("timer-start").click();
  $("hourglass-reset").onclick = () => $("timer-reset").click();
  $("hourglass-settings").onclick = () => { stage.hidden = true; document.body.classList.remove("hourglass-mode"); $("timer-toggle").click(); };
  document.querySelectorAll("[data-mode]").forEach(button => button.onclick = () => {
    document.querySelectorAll("[data-mode]").forEach(item => item.classList.toggle("selected", item === button));
    if (button.dataset.mode !== "focus") { const preset = document.querySelector('[data-duration="1500"]'); if (preset) preset.click(); }
  });
  const observer = new ResizeObserver(resize); observer.observe(stage);
  document.addEventListener("visibilitychange", () => { if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; } else if (state.running && !reduce.matches && !frame) { last = 0; frame = requestAnimationFrame(loop); } });
  if (globalThis.flipTimerState) sync(globalThis.flipTimerState());
})();
