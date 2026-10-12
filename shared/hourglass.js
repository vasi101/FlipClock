"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const stage = $("hourglass-stage");
  const ringProgress = $("ring-progress");
  const ringTip = $("ring-tip");
  const display = $("hourglass-display");
  const labels = $("hourglass-labels");
  const startBtn = $("hourglass-start");

  const R = 158;
  const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 992.743

  let state = {
    duration: 300000,
    remaining: 300000,
    deadline: null,
    running: false,
    finished: false,
    display: "00:05:00"
  };

  let animId = null;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatTime(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor(totalSec / 60) % 60;
    const s = totalSec % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  function applyProgress(p, finished, warning) {
    if (finished || p >= 1) {
      if (ringProgress) {
        ringProgress.style.opacity = "1";
        ringProgress.style.strokeDashoffset = "0";
      }
      if (ringTip) {
        ringTip.style.opacity = "1";
        ringTip.setAttribute("transform", "rotate(360 200 200)");
      }
      stage.classList.add("ring-finished");
      stage.classList.remove("is-warning");
      return;
    }

    stage.classList.remove("ring-finished");
    stage.classList.toggle("is-warning", Boolean(warning));
    const active = p > 0.001;
    if (ringProgress) {
      ringProgress.style.opacity = active ? "1" : "0";
      // Offset = C * (1 - p): stroke begins at 12:00 and extends clockwise to p * 360 deg
      ringProgress.style.strokeDashoffset = CIRCUMFERENCE * (1 - p);
    }
    if (ringTip) {
      ringTip.style.opacity = active ? "1" : "0";
      ringTip.setAttribute("transform", `rotate(${p * 360} 200 200)`);
    }
  }

  function updateDisplay(ms) {
    const text = formatTime(ms);
    if (display && display.textContent !== text) {
      display.textContent = text;
      const parts = text.split(":");
      const hasHours = parts.length === 3;
      if (labels) {
        labels.innerHTML = hasHours
          ? "<span>HR</span><span>MIN</span><span>SEC</span>"
          : "<span>MIN</span><span>SEC</span>";
        labels.style.width = hasHours ? "190px" : "130px";
      }
    }
  }

  function renderFrame() {
    if (state.running && state.deadline && !stage.hidden) {
      const now = Date.now();
      const currentRemaining = Math.max(0, state.deadline - now);
      const p = Math.max(0, Math.min(1, 1 - currentRemaining / Math.max(1, state.duration)));
      const isWarning = currentRemaining > 0 && currentRemaining <= 5000;
      applyProgress(p, state.finished, isWarning);
      updateDisplay(currentRemaining);
      animId = requestAnimationFrame(renderFrame);
    } else {
      animId = null;
    }
  }

  function startAnimation() {
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    if (state.running && !stage.hidden) {
      animId = requestAnimationFrame(renderFrame);
    }
  }

  function stopAnimation() {
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function sync(next) {
    state = next;
    const isWarning = state.running && state.remaining > 0 && state.remaining <= 5000;
    const p = Math.max(0, Math.min(1, 1 - state.remaining / Math.max(1, state.duration)));
    applyProgress(p, state.finished, isWarning);
    updateDisplay(state.remaining);
    const endPrompt = $("hourglass-end-prompt");
    if (endPrompt) endPrompt.hidden = !state.finished;

    if (startBtn) {
      startBtn.classList.toggle("is-running", state.running);
      startBtn.setAttribute("aria-label", state.finished ? "Stop alarm and reset timer" : state.running ? "Pause timer" : "Start timer");
    }

    if (state.running) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }

  globalThis.onFlipTimerUpdate = sync;

  $("hourglass-enable").onclick = () => {
    document.body.classList.add("hourglass-mode");
    stage.hidden = false;
    $("timer-panel").hidden = true;
    $("timer-toggle").setAttribute("aria-expanded", "false");
    if (globalThis.flipTimerState) sync(globalThis.flipTimerState());
    if (state.running) startAnimation();
  };

  $("hourglass-exit").onclick = () => {
    stage.hidden = true;
    document.body.classList.remove("hourglass-mode");
    stopAnimation();
  };

  $("hourglass-start").onclick = () => $("timer-start").click();
  $("hourglass-reset").onclick = () => $("timer-reset").click();
  const themeBtn = $("hourglass-theme");
  if (themeBtn) {
    themeBtn.onclick = () => $("theme").click();
  }

  function selectDuration(seconds) {
    const fields = ["timer-hours", "timer-minutes", "timer-seconds"].map($);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds / 60) % 60;
    const s = seconds % 60;
    $("timer-reset").click();
    fields[0].value = h;
    fields[1].value = m;
    fields[2].value = s;
    fields[2].dispatchEvent(new Event("input"));
    updatePresets(seconds);
  }

  function updatePresets(seconds) {
    document.querySelectorAll(".hourglass-modes button[data-sec]").forEach(btn => {
      btn.classList.toggle("selected", Number(btn.dataset.sec) === seconds);
    });
  }

  document.querySelectorAll(".hourglass-modes button[data-sec]").forEach(button => {
    button.onclick = () => {
      selectDuration(Number(button.dataset.sec));
    };
  });

  const configModal = $("hourglass-config");
  const openCustomTimeConfig = () => {
    if (!configModal) return;
    const curSec = Math.floor(state.duration / 1000);
    $("ring-hours").value = Math.floor(curSec / 3600);
    $("ring-minutes").value = Math.floor(curSec / 60) % 60;
    $("ring-seconds").value = curSec % 60;
    $("ring-alarm").checked = $("timer-alarm").checked;
    configModal.hidden = false;
    setTimeout(() => $("ring-minutes")?.focus(), 50);
  };

  $("hourglass-display").onclick = openCustomTimeConfig;

  $("hourglass-config-close").onclick = () => {
    if (configModal) configModal.hidden = true;
  };

  configModal.onclick = event => {
    if (event.target === configModal) configModal.hidden = true;
  };

  $("ring-apply").onclick = () => {
    const h = Math.max(0, parseInt($("ring-hours").value, 10) || 0);
    const m = Math.max(0, parseInt($("ring-minutes").value, 10) || 0);
    const s = Math.max(0, parseInt($("ring-seconds").value, 10) || 0);
    const totalSec = h * 3600 + m * 60 + s;
    if (totalSec >= 1 && totalSec <= 359999) {
      if ($("timer-alarm").checked !== $("ring-alarm").checked) {
        $("timer-alarm").checked = $("ring-alarm").checked;
        $("timer-alarm").dispatchEvent(new Event("change"));
      }
      selectDuration(totalSec);
      if (configModal) configModal.hidden = true;
    }
  };

  document.addEventListener("keydown", event => {
    if (stage.hidden) return;
    if (event.key === "Escape") {
      if (configModal && !configModal.hidden) {
        configModal.hidden = true;
      } else {
        $("hourglass-exit").click();
      }
    } else if (event.key === " " && !event.target.matches("button, input")) {
      event.preventDefault();
      $("hourglass-start").click();
    } else if (event.key.toLowerCase() === "t" && !event.target.matches("input")) {
      $("theme").click();
    } else if (event.key.toLowerCase() === "s" && !event.target.matches("input")) {
      $("settings-toggle").click();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else if (state.running && !stage.hidden) {
      startAnimation();
    }
  });

  if (globalThis.flipTimerState) sync(globalThis.flipTimerState());
})();
