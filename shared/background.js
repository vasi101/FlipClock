"use strict";
(() => {
  let imageUrl = null, imageData = null, generation = 0;
  let options = { enabled: true, opacity: 30, blur: 16 };
  try {
    const saved = JSON.parse(localStorage.getItem("flip-clock-glass") || "{}");
    if (typeof saved.enabled === "boolean") options.enabled = saved.enabled;
    for (const key of ["opacity", "blur"]) if (Number.isFinite(saved[key])) options[key] = Math.max(key === "opacity" ? 10 : 0, Math.min(key === "opacity" ? 85 : 40, saved[key]));
  } catch {}
  const status = message => $("background-status").textContent = message;
  function database() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("flip-clock-background", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("images");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function storage(action, value) {
    const db = await database();
    try {
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction("images", action === "get" ? "readonly" : "readwrite");
        const store = transaction.objectStore("images");
        const request = action === "get" ? store.get("custom") : action === "put" ? store.put(value, "custom") : store.delete("custom");
        transaction.oncomplete = () => resolve(request.result);
        transaction.onerror = transaction.onabort = () => reject(transaction.error);
      });
    } finally { db.close(); }
  }
  function display(blob) {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = URL.createObjectURL(blob);
    document.documentElement.style.setProperty("--custom-image", `url("${imageUrl}")`);
    $("use-custom").hidden = $("remove-custom").hidden = false;
    const image = new Image();
    image.onload = () => {
      if (image.src !== imageUrl) return;
      const canvas = document.createElement("canvas"); canvas.width = canvas.height = 32;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, 32, 32);
      imageData = context.getImageData(0, 0, 32, 32).data;
      updateGlass();
    };
    image.src = imageUrl;
    updateGlass();
  }
  function updateGlass() {
    const active = prefs.wallpaper === "custom" && !!imageUrl && options.enabled;
    document.body.classList.toggle("glass", active);
    document.documentElement.style.setProperty("--glass-opacity", options.opacity / 100);
    document.documentElement.style.setProperty("--glass-blur", `${options.blur}px`);
    if (imageData) {
      let r = 0, g = 0, b = 0, count = 0;
      // Sample the central image region behind the clock rather than its edges.
      for (let y = 8; y < 24; y++) for (let x = 5; x < 27; x++) { const i = (y * 32 + x) * 4; r += imageData[i]; g += imageData[i + 1]; b += imageData[i + 2]; count++; }
      r /= count; g /= count; b /= count;
      const bright = .2126 * r + .7152 * g + .0722 * b > 150;
      const tint = [r, g, b].map(channel => Math.round(bright ? 205 + channel * .18 : channel * .22));
      document.documentElement.style.setProperty("--glass-tint", tint.join(","));
      document.documentElement.style.setProperty("--glass-ink", bright ? "#102022" : "#f5faf9");
      document.documentElement.style.setProperty("--glass-text-shadow", bright ? "0 1px 3px #ffffff80" : "0 2px 5px #0009");
    }
  }
  globalThis.updateGlass = updateGlass;
  $("glass-enabled").checked = options.enabled;
  $("glass-opacity").value = options.opacity;
  $("glass-blur").value = options.blur;
  for (const [id, key] of [["glass-enabled", "enabled"], ["glass-opacity", "opacity"], ["glass-blur", "blur"]]) $(id).oninput = event => {
    options[key] = key === "enabled" ? event.target.checked : Number(event.target.value);
    try { localStorage.setItem("flip-clock-glass", JSON.stringify(options)); } catch {}
    updateGlass();
  };
  $("background-file").onchange = async event => {
    const file = event.target.files[0]; event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 25 * 1024 * 1024) { status("Choose a JPG, PNG, WebP, or AVIF image under 25 MB."); return; }
    const current = ++generation;
    $("background-file").disabled = $("remove-custom").disabled = true;
    status("Preparing your background…");
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 2560 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d"); context.fillStyle = "#202222"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", .9));
      if (!blob) throw new Error("Image conversion failed");
      if (current !== generation) return;
      display(blob); prefs.wallpaper = "custom"; apply();
      try { await storage("put", blob); if (current === generation) status("Image saved on this device. Glass adapts to its colors."); }
      catch { status("Image applied for this session. Browser storage is unavailable."); }
    } catch { if (current === generation) status("This image could not be opened. Try a JPG or PNG."); }
    finally { $("background-file").disabled = $("remove-custom").disabled = false; }
  };
  $("use-custom").onclick = () => { if (imageUrl) { prefs.wallpaper = "custom"; apply(); } };
  $("remove-custom").onclick = async () => {
    ++generation;
    try { await storage("delete"); } catch { status("Could not remove the saved image. Please try again."); return; }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = imageData = null;
    document.documentElement.style.removeProperty("--custom-image");
    $("use-custom").hidden = $("remove-custom").hidden = true;
    if (prefs.wallpaper === "custom") prefs.wallpaper = "none";
    apply(); status("Image removed.");
  };
  const initialGeneration = generation;
  storage("get").then(blob => {
    if (initialGeneration !== generation) return;
    if (blob instanceof Blob) { display(blob); status("Your saved image is ready."); }
    else if (prefs.wallpaper === "custom") { prefs.wallpaper = "none"; apply(); }
  }).catch(() => status("Image storage is unavailable; you can still use an image this session."));
  updateGlass();
})();
