/* ============================================================
   AntiFake Demo — Main Application Logic
   ============================================================ */

// ── Page Definitions ──────────────────────────────────────────────
const PAGES = [
  { id: "page-1", label: "Intro" },
  { id: "page-2", label: "Overview" },
  { id: "page-3", label: "Audio Demo" },
  { id: "page-4", label: "TTS Demo" },
  { id: "page-5", label: "Comparison" },
];

// ── State ─────────────────────────────────────────────────────
let currentPage = 0;
let activeSpeakerIndex = 0;
let allPlayers = [];
const initializedPages = new Set();
const speakerUpdateFns = {};
let animateInTarget = null;

// ── Speaker Selection (global) ────────────────────────────────
function onSpeakerSelect(speaker) {
  activeSpeakerIndex = CONFIG.speakers.indexOf(speaker);

  Object.values(speakerUpdateFns).forEach(fn => fn(speaker));

  document.querySelectorAll(".speaker-tabs").forEach(tabs => {
    tabs.querySelectorAll(".speaker-tab").forEach((btn, i) => {
      btn.classList.toggle("active", i === activeSpeakerIndex);
    });
  });
}

// ── Speaker Tab Builder ─────────────────────────────────────────
function buildSpeakerTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  CONFIG.speakers.forEach((speaker, idx) => {
    const btn = document.createElement("button");
    btn.className = `speaker-tab${idx === activeSpeakerIndex ? " active" : ""}`;
    btn.textContent = speaker.name;
    btn.addEventListener("click", () => onSpeakerSelect(speaker));
    container.appendChild(btn);
  });
}

// ── AudioPlayer Class ─────────────────────────────────────────
class AudioPlayer {
  constructor({ container, src, type }) {
    this.audio = new Audio(src);
    this.container = container;
    this.type = type;
    this.state = "idle";

    this._rafId = null;

    this.audio.addEventListener("loadedmetadata", () => {
      this.$duration.textContent = this._fmt(this.audio.duration);
    });
    this.audio.addEventListener("ended",  () => {
      this._stopRaf();
      this.$fill.style.width = "100%";
      this._setState("ended");
    });
    this.audio.addEventListener("error",  () => { this._stopRaf(); this._setState("error"); });

    this._render();
    allPlayers.push(this);
  }

  _render() {
    const meta = {
      source:     { badge: "badge-source",    btn: "btn-source",    fill: "fill-source",    badgeText: "Original",          title: "Original Voice",   sub: "Actual voice before protection"   },
      protected:  { badge: "badge-protected", btn: "btn-protected", fill: "fill-protected", badgeText: "Protected",         title: "Protected Voice",  sub: "Voice with protection signal embedded"   },
      "tts-orig": { badge: "badge-tts-orig",  btn: "btn-tts-orig",  fill: "fill-tts-orig",  badgeText: "Original TTS",      title: "Original TTS",     sub: "Cloned voice without protection"     },
      "tts-prot": { badge: "badge-tts-prot",  btn: "btn-tts-prot",  fill: "fill-tts-prot",  badgeText: "Protected TTS",     title: "Protected TTS",    sub: "Cloning attack neutralized" },
    }[this.type];

    this.container.innerHTML = `
      <div class="audio-player">
        <div class="player-header">
          <div class="player-meta">
            <div class="player-title">${meta.title}</div>
            <div class="player-subtitle">${meta.sub}</div>
          </div>
          <span class="player-status status-idle" data-status>Idle</span>
        </div>
        <div class="player-controls">
          <button class="play-btn ${meta.btn}" data-playbtn aria-label="Play/Pause">
            ${this._playIcon()}
          </button>
          <div class="progress-wrap">
            <div class="progress-bar" data-bar>
              <div class="progress-fill ${meta.fill}" data-fill></div>
            </div>
            <div class="time-display">
              <span data-current>0:00</span>
              <span data-duration>0:00</span>
            </div>
          </div>
        </div>
      </div>`;

    this.$status   = this.container.querySelector("[data-status]");
    this.$playBtn  = this.container.querySelector("[data-playbtn]");
    this.$bar      = this.container.querySelector("[data-bar]");
    this.$fill     = this.container.querySelector("[data-fill]");
    this.$current  = this.container.querySelector("[data-current]");
    this.$duration = this.container.querySelector("[data-duration]");

    this.$playBtn.addEventListener("click", () => this.toggle());
    this.$bar.addEventListener("click", (e) => {
      if (!this.audio.duration) return;
      const rect = this.$bar.getBoundingClientRect();
      this.audio.currentTime = ((e.clientX - rect.left) / rect.width) * this.audio.duration;
    });
  }

  toggle() { this.state === "playing" ? this.pause() : this.play(); }

  play() {
    allPlayers.forEach(p => { if (p !== this) p.pause(); });
    this._setState("playing");
    this.audio.play().catch(() => this._setState("error"));
    this._startRaf();
  }

  pause() {
    this.audio.pause();
    this._stopRaf();
    this._setState("paused");
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this._stopRaf();
    this.$fill.style.width    = "0%";
    this.$current.textContent = "0:00";
    this._setState("idle");
  }

  setSrc(src) {
    this.stop();
    this.audio.src = src;
    this.$duration.textContent = "0:00";
  }

  destroy() {
    this.audio.pause();
    this._stopRaf();
    allPlayers = allPlayers.filter(p => p !== this);
  }

  _startRaf() {
    this._stopRaf();
    const tick = () => {
      if (this.audio.duration) {
        const pct = (this.audio.currentTime / this.audio.duration) * 100;
        this.$fill.style.width    = pct + "%";
        this.$current.textContent = this._fmt(this.audio.currentTime);
      }
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _stopRaf() {
    if (this._rafId) { cancelAnimationFrame(this._rafId); this._rafId = null; }
  }

  _setState(s) {
    this.state = s;
    const map = {
      idle:    ["Idle",    "status-idle"],
      playing: ["Playing", "status-playing"],
      paused:  ["Paused",  "status-paused"],
      ended:   ["Done",    "status-ended"],
      error:   ["Error",   "status-error"],
    };
    const [label, cls] = map[s] || map.idle;
    this.$status.textContent = label;
    this.$status.className   = `player-status ${cls}`;
    this.$playBtn.innerHTML  = s === "playing" ? this._pauseIcon() : this._playIcon();
  }

  _playIcon() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.3 3.3a.75.75 0 0 1 .75 0l10.5 6.07a.75.75 0 0 1 0 1.3L7.05 16.7A.75.75 0 0 1 6 16.07V3.93a.75.75 0 0 1 .3-.63z"/>
    </svg>`;
  }
  _pauseIcon() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5.75 3A.75.75 0 0 0 5 3.75v12.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 8.25 3h-2.5zM11.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 14.25 3h-2.5z"/>
    </svg>`;
  }
  _fmt(s) {
    if (!s || isNaN(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  }
}

// ── Page Initialization ────────────────────────────────────────

function initPage3() {
  const wrap = document.getElementById("page3-content");
  let players = [];

  function updateSpeaker(speaker) {
    players.forEach(p => p.destroy());
    players = [];
    const paths = CONFIG.getAudioPaths(speaker);
    const containers = wrap.querySelectorAll("[data-player]");
    const defs = [
      { src: paths.source,    type: "source"    },
      { src: paths.protected, type: "protected" },
    ];
    containers.forEach((el, i) => {
      players.push(new AudioPlayer({ container: el, src: defs[i].src, type: defs[i].type }));
    });
  }

  speakerUpdateFns[3] = updateSpeaker;
  buildSpeakerTabs("page3-tabs");
  updateSpeaker(CONFIG.speakers[activeSpeakerIndex]);
}

function initPage4() {
  const wrap = document.getElementById("page4-content");
  let players = [];

  function updateSpeaker(speaker) {
    players.forEach(p => p.destroy());
    players = [];
    const paths = CONFIG.getAudioPaths(speaker);
    const containers = wrap.querySelectorAll("[data-player]");
    const defs = [
      { src: paths.ttsOrig,      type: "tts-orig" },
      { src: paths.ttsProtected, type: "tts-prot" },
    ];
    containers.forEach((el, i) => {
      players.push(new AudioPlayer({ container: el, src: defs[i].src, type: defs[i].type }));
    });
  }

  speakerUpdateFns[4] = updateSpeaker;
  buildSpeakerTabs("page4-tabs");
  updateSpeaker(CONFIG.speakers[activeSpeakerIndex]);
}

function initPage5() {
  let players = [];

  function updateSpeaker(speaker) {
    players.forEach(p => p.destroy());
    players = [];
    const paths = CONFIG.getAudioPaths(speaker);
    const defs = [
      { id: "p5-source",    src: paths.source,       type: "source"    },
      { id: "p5-protected", src: paths.protected,    type: "protected" },
      { id: "p5-tts-orig",  src: paths.ttsOrig,      type: "tts-orig"  },
      { id: "p5-tts-prot",  src: paths.ttsProtected, type: "tts-prot"  },
    ];
    defs.forEach(({ id, src, type }) => {
      const el = document.getElementById(id);
      if (el) players.push(new AudioPlayer({ container: el, src, type }));
    });
  }

  speakerUpdateFns[5] = updateSpeaker;
  buildSpeakerTabs("page5-tabs");
  updateSpeaker(CONFIG.speakers[activeSpeakerIndex]);
}

const pageInits = { 2: initPage3, 3: initPage4, 4: initPage5 };

// ── Page Navigation ────────────────────────────────────────────
function goToPage(index) {
  if (index < 0 || index >= PAGES.length) return;

  allPlayers.forEach(p => p.pause());

  const pages = document.querySelectorAll(".page");

  pages[currentPage].classList.remove("active");
  pages[currentPage].classList.add("exit");
  setTimeout(() => pages[currentPage]?.classList.remove("exit"), 300);

  currentPage = index;

  if (pageInits[index] && !initializedPages.has(index)) {
    initializedPages.add(index);
    pageInits[index]();
  }

  pages[currentPage].classList.add("active");

  const cur = pages[currentPage];
  cur.classList.remove("animate-in");
  animateInTarget = cur;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (animateInTarget === cur) cur.classList.add("animate-in");
  }));

  if (index === 0) {
    const heroEls = document.querySelectorAll(
      "#page-1 .hero-badge, #page-1 .hero-title, #page-1 .hero-subtitle, " +
      "#page-1 .hero-tagline, #page-1 .hero-cta, #page-1 .hero-scroll-hint"
    );
    heroEls.forEach(el => { el.style.animation = "none"; });
    void document.querySelector("#page-1").offsetWidth;
    heroEls.forEach(el => { el.style.animation = ""; });
  }

  document.getElementById("nav").className = index === 0 ? "hero-mode" : "page-mode";
  document.getElementById("bottom-nav").style.display = index === 0 ? "none" : "flex";
  document.querySelectorAll(".page-dot").forEach((d, i) => d.classList.toggle("active", i === index));

  document.getElementById("btn-prev").disabled = index === 0;
  document.getElementById("btn-next").disabled = index === PAGES.length - 1;
}

// ── DOM Initialization ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hero-title").textContent        = CONFIG.projectName;
  document.getElementById("hero-subtitle").textContent     = CONFIG.subtitle;
  document.getElementById("hero-tagline").textContent      = CONFIG.tagline;
  document.getElementById("nav-project").textContent       = CONFIG.projectName;
  document.getElementById("hero-institution").textContent  = CONFIG.institution;

  const dotsWrap = document.getElementById("page-dots");
  PAGES.forEach((p, i) => {
    const d = document.createElement("button");
    d.className = `page-dot${i === 0 ? " active" : ""}`;
    d.textContent = p.label;
    d.addEventListener("click", () => goToPage(i));
    dotsWrap.appendChild(d);
  });

  document.getElementById("btn-prev").addEventListener("click", () => goToPage(currentPage - 1));
  document.getElementById("btn-next").addEventListener("click", () => goToPage(currentPage + 1));
  document.getElementById("side-left").addEventListener("click",  () => goToPage(currentPage - 1));
  document.getElementById("side-right").addEventListener("click", () => goToPage(currentPage + 1));
  document.getElementById("hero-cta").addEventListener("click", () => goToPage(1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") goToPage(currentPage + 1);
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goToPage(currentPage - 1);
  });

  document.querySelector("#page-1").classList.add("active");
  document.getElementById("nav").className = "hero-mode";
  document.getElementById("btn-prev").disabled = true;
  document.getElementById("bottom-nav").style.display = "none";

});
