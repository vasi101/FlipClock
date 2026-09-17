"use strict";
(() => {
  const byId = id => document.getElementById(id);
  let sound = { ticking: false, volume: 35, alarm: true };
  let timer = { duration: 300000, remaining: 300000, deadline: null, finished: false };
  try {
    const saved = JSON.parse(localStorage.getItem("flip-clock-sound") || "{}");
    if (typeof saved.ticking === "boolean") sound.ticking = saved.ticking;
    if (typeof saved.alarm === "boolean") sound.alarm = saved.alarm;
    if (Number.isFinite(saved.volume)) sound.volume = Math.max(0, Math.min(100, saved.volume));
    const stored = JSON.parse(localStorage.getItem("flip-clock-timer") || "null");
    if (stored && Number.isFinite(stored.duration) && stored.duration >= 1000 && stored.duration <= 359999000 && Number.isFinite(stored.remaining) && stored.remaining >= 0 && stored.remaining <= stored.duration && (stored.deadline === null || Number.isFinite(stored.deadline)) && typeof stored.finished === "boolean") timer = stored;
  } catch {}
  const save = () => { try { localStorage.setItem("flip-clock-sound", JSON.stringify(sound)); localStorage.setItem("flip-clock-timer", JSON.stringify(timer)); } catch {} };
  let audio, alarmUntil = 0, lastAlarm = 0;
  async function unlock() {
    try {
      audio ??= new AudioContext();
      if (audio.state === "suspended") await audio.resume();
      byId("audio-status").textContent = "";
    } catch { byId("audio-status").textContent = "Sound is unavailable. The timer still works."; }
  }
  // Browsers require a user interaction before allowing audio after launch.
  for (const event of ["pointerdown", "keydown"]) document.addEventListener(event, () => { if (sound.ticking || sound.alarm) void unlock(); }, { passive: true });
  function tone(frequency, duration, strength, delay = 0) {
    if (!audio || audio.state !== "running" || sound.volume === 0) return;
    const oscillator = audio.createOscillator(), gain = audio.createGain();
    const start = audio.currentTime + delay;
    oscillator.type = "sine"; oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(strength * sound.volume / 100, start + .003);
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(start); oscillator.stop(start + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  globalThis.playClockTick = () => { if (sound.ticking) tone(Math.floor(Date.now() / 1000) % 2 ? 1050 : 750, .045, .22); };
  byId("tick-sound").checked = sound.ticking;
  byId("sound-volume").value = sound.volume;
  byId("timer-alarm").checked = sound.alarm;
  if (sound.ticking) byId("audio-status").textContent = "Click anywhere to enable sound.";
  byId("tick-sound").onchange = async event => { sound.ticking = event.target.checked; save(); if (sound.ticking) { await unlock(); globalThis.playClockTick(); } };
  byId("sound-volume").oninput = event => { sound.volume = Number(event.target.value); save(); };
  byId("timer-alarm").onchange = event => { sound.alarm = event.target.checked; if (!sound.alarm) alarmUntil = 0; save(); };
  function openPanel(open = true) {
    byId("timer-panel").hidden = !open;
    byId("timer-toggle").setAttribute("aria-expanded", String(open));
    if (open) { byId("settings").hidden = true; byId("settings-toggle").setAttribute("aria-expanded", "false"); byId("timer-close").focus(); }
    else byId("timer-toggle").focus();
  }
  byId("timer-toggle").onclick = () => openPanel(byId("timer-panel").hidden);
  byId("timer-close").onclick = () => openPanel(false);
  byId("timer-badge").onclick = () => openPanel();
  byId("settings-toggle").addEventListener("click", () => { byId("timer-panel").hidden = true; byId("timer-toggle").setAttribute("aria-expanded", "false"); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !byId("timer-panel").hidden) openPanel(false); });
  const fields = ["timer-hours", "timer-minutes", "timer-seconds"].map(byId);
  function fillFields() {
    const seconds = Math.floor(timer.duration / 1000);
    fields[0].value = Math.floor(seconds / 3600); fields[1].value = Math.floor(seconds / 60) % 60; fields[2].value = seconds % 60;
  }
  function readDuration() {
    const values = fields.map(field => Number(field.value));
    if (values.some((value, i) => !Number.isInteger(value) || value < 0 || value > (i === 0 ? 99 : 59))) return null;
    return (values[0] * 3600 + values[1] * 60 + values[2]) * 1000 || null;
  }
  const format = milliseconds => { const seconds = Math.ceil(milliseconds / 1000); return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, "0")).join(":"); };
  function refresh() {
    if (timer.deadline !== null) {
      timer.remaining = Math.max(0, timer.deadline - Date.now());
      if (timer.remaining === 0) {
        timer.deadline = null; timer.finished = true;
        alarmUntil = sound.alarm ? Date.now() + 30000 : 0;
        if (sound.alarm && (!audio || audio.state !== "running")) byId("audio-status").textContent = "Time is up! Click anywhere to enable the alarm sound.";
        lastAlarm = 0; save(); openPanel();
      }
    }
    const running = timer.deadline !== null;
    byId("timer-display").textContent = format(timer.remaining);
    byId("timer-start").textContent = running ? "Pause" : timer.finished ? "Start again" : timer.remaining < timer.duration ? "Resume" : "Start";
    byId("timer-status").textContent = timer.finished ? "Time is up!" : running ? "Counting down" : timer.remaining < timer.duration ? "Paused" : "Ready";
    byId("timer-dismiss").hidden = !timer.finished;
    byId("timer-badge").hidden = !running && !timer.finished && timer.remaining === timer.duration;
    byId("timer-badge").textContent = timer.finished ? "Time is up!" : `${running ? "Timer" : "Paused"} · ${format(timer.remaining)}`;
    for (const field of fields) field.disabled = running;
    document.querySelectorAll("[data-duration]").forEach(button => button.disabled = running);
    if (Date.now() < alarmUntil && Date.now() - lastAlarm >= 1200) { lastAlarm = Date.now(); tone(880, .25, .35); tone(1100, .35, .35, .3); }
  }
  byId("timer-start").onclick = () => {
    void unlock();
    if (timer.deadline !== null) { timer.remaining = Math.max(0, timer.deadline - Date.now()); timer.deadline = null; }
    else {
      if (timer.finished || timer.remaining === timer.duration) {
        const duration = readDuration();
        if (duration === null) { byId("timer-status").textContent = "Enter a time from 1 second to 99:59:59."; return; }
        timer.duration = timer.remaining = duration;
      }
      timer.finished = false; alarmUntil = 0; timer.deadline = Date.now() + timer.remaining;
    }
    save(); refresh();
  };
  function reset() { alarmUntil = 0; byId("audio-status").textContent = ""; timer.deadline = null; timer.finished = false; timer.remaining = timer.duration; save(); refresh(); }
  byId("timer-reset").onclick = reset;
  byId("timer-dismiss").onclick = reset;
  for (const field of fields) field.addEventListener("input", () => { if (timer.deadline !== null) return; const duration = readDuration(); if (duration !== null) { timer.duration = duration; reset(); } });
  document.querySelectorAll("[data-duration]").forEach(button => { button.onclick = () => { timer.duration = Number(button.dataset.duration) * 1000; fillFields(); reset(); }; });
  fillFields(); refresh();
  setInterval(refresh, 200);
  document.addEventListener("visibilitychange", refresh);
})();
