// ── APP.JS ── WallMotion hoofdlogica

const gallery = document.getElementById("gallery");
const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext("2d");
const dlBtn = document.getElementById("dlBtn");
const dlInfo = document.getElementById("dlInfo");
const placeholder = document.getElementById("placeholder");

let selectedId = null;
let mainAnimFrame = null;
let mainT = 0;

// Resize canvas to actual display size
function resizeMainCanvas() {
  const rect = mainCanvas.parentElement.getBoundingClientRect();
  mainCanvas.width = Math.floor(rect.width);
  mainCanvas.height = Math.floor(rect.height);
}
resizeMainCanvas();
window.addEventListener("resize", () => { resizeMainCanvas(); });

// ── BUILD GALLERY CARDS ──
const miniAnims = {}; // { id: { canvas, ctx, t, raf } }

WALLPAPERS.forEach(wp => {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.id = wp.id;

  const wrap = document.createElement("div");
  wrap.className = "card-canvas-wrap";

  const c = document.createElement("canvas");
  c.width = 320;
  c.height = 180;
  wrap.appendChild(c);

  const footer = document.createElement("div");
  footer.className = "card-footer";
  footer.innerHTML = `<span class="card-name">${wp.name}</span><span class="card-tag">${wp.tag}</span>`;

  card.appendChild(wrap);
  card.appendChild(footer);
  gallery.appendChild(card);

  card.addEventListener("click", () => selectWallpaper(wp.id, card));

  // Start mini animation
  const mctx = c.getContext("2d");
  let t = 0;
  function animateMini() {
    wp.draw(mctx, c.width, c.height, t);
    t += 0.025;
    miniAnims[wp.id].raf = requestAnimationFrame(animateMini);
  }
  miniAnims[wp.id] = { canvas: c, ctx: mctx, t: 0, raf: null };
  animateMini();
});

// ── SELECT WALLPAPER ──
function selectWallpaper(id, card) {
  document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
  card.classList.add("active");

  selectedId = id;
  placeholder.classList.add("hidden");
  dlBtn.disabled = false;

  const wp = WALLPAPERS.find(w => w.id === id);
  dlInfo.textContent = `${wp.name} · WebM video · ~3 seconden`;

  if (mainAnimFrame) cancelAnimationFrame(mainAnimFrame);
  mainT = 0;

  function loop() {
    resizeIfNeeded();
    wp.draw(mainCtx, mainCanvas.width, mainCanvas.height, mainT);
    mainT += 0.016;
    mainAnimFrame = requestAnimationFrame(loop);
  }
  loop();
}

let lastW = 0, lastH = 0;
function resizeIfNeeded() {
  const rect = mainCanvas.parentElement.getBoundingClientRect();
  const w = Math.floor(rect.width);
  const h = Math.floor(rect.height);
  if (w !== lastW || h !== lastH) {
    mainCanvas.width = w;
    mainCanvas.height = h;
    lastW = w; lastH = h;
  }
}

// ── DOWNLOAD ──
const progressBar = document.createElement("div");
progressBar.className = "progress-bar";
document.body.appendChild(progressBar);

const RECORD_DURATION = 5000; // ms

dlBtn.addEventListener("click", () => {
  if (!selectedId) return;

  const wp = WALLPAPERS.find(w => w.id === selectedId);
  dlBtn.disabled = true;
  dlInfo.textContent = "Opnemen...";
  progressBar.style.width = "0%";

  // Record op hogere resolutie
  const recCanvas = document.createElement("canvas");
  recCanvas.width = 1920;
  recCanvas.height = 1080;
  const recCtx = recCanvas.getContext("2d");

  let recT = 0;
  let recRaf = null;
  function drawRec() {
    wp.draw(recCtx, 1920, 1080, recT);
    recT += 0.016;
    recRaf = requestAnimationFrame(drawRec);
  }
  drawRec();

  const stream = recCanvas.captureStream(30);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  const chunks = [];

  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = () => {
    cancelAnimationFrame(recRaf);
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedId}_wallpaper.webm`;
    a.click();
    URL.revokeObjectURL(url);

    dlBtn.disabled = false;
    dlInfo.textContent = "Download klaar ✓";
    progressBar.style.width = "100%";
    setTimeout(() => { progressBar.style.width = "0%"; dlInfo.textContent = `${wp.name} · WebM video · ~3 seconden`; }, 2500);
  };

  const start = performance.now();
  function updateProgress() {
    const elapsed = performance.now() - start;
    const pct = Math.min(100, (elapsed / RECORD_DURATION) * 100);
    progressBar.style.width = pct + "%";
    if (elapsed < RECORD_DURATION) requestAnimationFrame(updateProgress);
  }

  recorder.start();
  updateProgress();
  setTimeout(() => recorder.stop(), RECORD_DURATION);
});
