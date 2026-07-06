/* ============================================================
   AntiFake Demo — Main Application Logic
   ============================================================ */

// ── i18n ──────────────────────────────────────────────────────
const I18N = {
  en: {
    pages: ["Intro", "Overview", "Audio Demo", "TTS Demo", "Comparison"],
    speakerLabel: "Select Speaker",
    heroCta: "Start Demo",
    playerMeta: {
      source:     { title: "Original Voice",   sub: "Actual voice before protection" },
      protected:  { title: "Protected Voice",  sub: "Voice with protection signal embedded" },
      "tts-orig": { title: "Original TTS",     sub: "Cloned voice without protection" },
      "tts-prot": { title: "Protected TTS",    sub: "Cloning attack neutralized" },
    },
    playerStatus: { idle: "Idle", playing: "Playing", paused: "Paused", ended: "Done", error: "Error" },
    page2: {
      eyebrow: "Technology Overview",
      title: "Why is Anti-Cloning Technology Needed?",
      desc: "With advances in deep learning, it has become possible to precisely replicate<br>anyone's voice from just a short audio sample.",
      card1Title: "Voice Cloning Threat",
      card1Body: "Modern AI voice synthesis can realistically reproduce a person's voice from just a short audio sample.<br>Such technology is increasingly being exploited for voice phishing and unauthorized content creation.",
      card2Title: "Cloning Attack Method",
      card2Body: "Attackers input publicly available voice data into TTS models to easily generate fake voices that sound like the original speaker. This poses a very high risk as anyone can attempt it without special equipment.",
      card3Title: "Our Technology's Solution",
      card3Body: "We embed imperceptible protection signals into audio. When TTS is trained on protected audio, the synthesizer fails to reproduce the speaker's voice.",
      flowTitle: "Generation Suppression Pipeline",
      flow1Label: "Original Voice",    flow1Sub: "Speaker's actual voice",
      flow2Label: "Protection Applied", flow2Sub: "Inaudible signal embedded",
      flow3Label: "Protected Voice",   flow3Sub: "Same listening quality",
      flow4Label: "Clone Attempt",     flow4Sub: "TTS model training",
      flow5Label: "Clone Failed",      flow5Sub: "Speaker voice unrecoverable",
    },
    page3: { eyebrow: "Audio Demo",   title: "Original Voice vs Protected Voice", desc: "Even with protection signals embedded, there is little perceptible difference to human ears. Listen for yourself." },
    page4: { eyebrow: "TTS Demo",     title: "Original TTS vs Protected TTS",     desc: "TTS trained on protected audio has its cloning neutralized, significantly reducing voice similarity." },
    page5: { eyebrow: "Comparison",   title: "Compare All 4 Voices at a Glance", desc: "From original to failed clone — experience the effect of protection technology firsthand." },
  },
  ko: {
    pages: ["인트로", "개요", "오디오 데모", "TTS 데모", "비교"],
    speakerLabel: "화자 선택",
    heroCta: "데모 시작",
    playerMeta: {
      source:     { title: "원본 음성",    sub: "보호 전 실제 목소리" },
      protected:  { title: "보호된 음성",  sub: "보호 신호가 삽입된 음성" },
      "tts-orig": { title: "원본 TTS",     sub: "보호 없이 클로닝된 음성" },
      "tts-prot": { title: "보호된 TTS",   sub: "클로닝 공격 무력화됨" },
    },
    playerStatus: { idle: "대기중", playing: "재생중", paused: "일시정지", ended: "완료", error: "오류" },
    page2: {
      eyebrow: "기술 개요",
      title: "Anti-Cloning 기술이 왜 필요할까요?",
      desc: "딥러닝 기술의 발전으로 짧은 음성 샘플만으로도<br>누구의 목소리든 정밀하게 복제할 수 있게 되었습니다.",
      card1Title: "음성 클로닝 위협",
      card1Body: "현대 AI 음성 합성은 짧은 음성 샘플만으로 실제와 구분하기 어려운 목소리를 재현할 수 있습니다.<br>이 기술은 보이스피싱 및 무단 콘텐츠 제작에 점점 더 악용되고 있습니다.",
      card2Title: "클로닝 공격 방식",
      card2Body: "공격자는 공개된 음성 데이터를 TTS 모델에 입력해 원본 화자처럼 들리는 가짜 목소리를 쉽게 생성할 수 있습니다. 특수 장비 없이도 누구나 시도할 수 있어 매우 높은 위험성을 가집니다.",
      card3Title: "우리 기술의 해결책",
      card3Body: "음성에 감지할 수 없는 보호 신호를 삽입합니다. TTS가 보호된 음성으로 학습될 경우, 합성기는 화자의 목소리를 재현하는 데 실패합니다.",
      flowTitle: "클로닝 차단 파이프라인",
      flow1Label: "원본 음성",   flow1Sub: "화자의 실제 목소리",
      flow2Label: "보호 적용",   flow2Sub: "비가청 신호 삽입",
      flow3Label: "보호된 음성", flow3Sub: "동일한 청취 품질",
      flow4Label: "클로닝 시도", flow4Sub: "TTS 모델 학습",
      flow5Label: "클로닝 실패", flow5Sub: "화자 목소리 복원 불가",
    },
    page3: { eyebrow: "오디오 데모", title: "원본 음성 vs 보호된 음성",    desc: "보호 신호가 삽입되어도 인간의 귀로는 차이를 거의 느낄 수 없습니다. 직접 들어보세요." },
    page4: { eyebrow: "TTS 데모",   title: "원본 TTS vs 보호된 TTS",      desc: "보호된 음성으로 학습된 TTS는 클로닝이 무력화되어 음성 유사도가 크게 낮아집니다." },
    page5: { eyebrow: "비교",       title: "4가지 음성을 한눈에 비교",     desc: "원본부터 실패한 클론까지 — 보호 기술의 효과를 직접 체험하세요." },
  },
};

// ── Page IDs ──────────────────────────────────────────────────
const PAGE_IDS = ["page-1", "page-2", "page-3", "page-4", "page-5"];

// ── State ─────────────────────────────────────────────────────
let currentPage = 0;
let currentLang = "en";
let activeSpeakerIndex = 0;
let allPlayers = [];
const initializedPages = new Set();
const speakerUpdateFns = {};
let animateInTarget = null;

// ── Language Switch ────────────────────────────────────────────
function setLanguage(lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  CONFIG = lang === "ko" ? CONFIG_KO : CONFIG_EN;

  const t = I18N[lang];

  // Hero
  document.getElementById("hero-title").textContent       = CONFIG.projectName;
  document.getElementById("hero-subtitle").textContent    = CONFIG.subtitle;
  document.getElementById("hero-tagline").textContent     = CONFIG.tagline;
  document.getElementById("nav-project").textContent      = CONFIG.projectName;
  document.getElementById("hero-institution").textContent = CONFIG.institution;
  document.getElementById("hero-cta-text").textContent    = t.heroCta;

  // Page 2
  const p2 = t.page2;
  document.getElementById("p2-eyebrow").textContent    = p2.eyebrow;
  document.getElementById("p2-title").textContent      = p2.title;
  document.getElementById("p2-desc").innerHTML         = p2.desc;
  document.getElementById("p2-card1-title").textContent = p2.card1Title;
  document.getElementById("p2-card1-body").innerHTML   = p2.card1Body;
  document.getElementById("p2-card2-title").textContent = p2.card2Title;
  document.getElementById("p2-card2-body").innerHTML   = p2.card2Body;
  document.getElementById("p2-card3-title").textContent = p2.card3Title;
  document.getElementById("p2-card3-body").innerHTML   = p2.card3Body;
  document.getElementById("p2-flow-title").textContent = p2.flowTitle;
  document.getElementById("p2-flow1-label").textContent = p2.flow1Label;
  document.getElementById("p2-flow1-sub").textContent  = p2.flow1Sub;
  document.getElementById("p2-flow2-label").textContent = p2.flow2Label;
  document.getElementById("p2-flow2-sub").textContent  = p2.flow2Sub;
  document.getElementById("p2-flow3-label").textContent = p2.flow3Label;
  document.getElementById("p2-flow3-sub").textContent  = p2.flow3Sub;
  document.getElementById("p2-flow4-label").textContent = p2.flow4Label;
  document.getElementById("p2-flow4-sub").textContent  = p2.flow4Sub;
  document.getElementById("p2-flow5-label").textContent = p2.flow5Label;
  document.getElementById("p2-flow5-sub").textContent  = p2.flow5Sub;

  // Page 3/4/5 headers & speaker labels
  ["3", "4", "5"].forEach(n => {
    const pg = t[`page${n}`];
    document.getElementById(`p${n}-eyebrow`).textContent      = pg.eyebrow;
    document.getElementById(`p${n}-title`).textContent        = pg.title;
    document.getElementById(`p${n}-desc`).textContent         = pg.desc;
    document.getElementById(`p${n}-speaker-label`).textContent = t.speakerLabel;
  });

  // Lang button active state
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Rebuild page dots
  buildDots();

  // Reset speakers & reinitialize active audio pages
  activeSpeakerIndex = 0;
  allPlayers.slice().forEach(p => { p.audio.pause(); p._stopRaf(); });
  allPlayers = [];

  const prevInitialized = new Set(initializedPages);
  initializedPages.clear();

  prevInitialized.forEach(idx => {
    if (pageInits[idx]) {
      initializedPages.add(idx);
      pageInits[idx]();
    }
  });
}

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
    this.audio.addEventListener("ended", () => {
      this._stopRaf();
      this.$fill.style.width = "100%";
      this._setState("ended");
    });
    this.audio.addEventListener("error", () => { this._stopRaf(); this._setState("error"); });

    this._render();
    allPlayers.push(this);
  }

  _render() {
    const meta = I18N[currentLang].playerMeta[this.type];
    const btnCls = {
      source: "btn-source", protected: "btn-protected",
      "tts-orig": "btn-tts-orig", "tts-prot": "btn-tts-prot",
    }[this.type];
    const fillCls = {
      source: "fill-source", protected: "fill-protected",
      "tts-orig": "fill-tts-orig", "tts-prot": "fill-tts-prot",
    }[this.type];
    const statusLabel = I18N[currentLang].playerStatus.idle;

    this.container.innerHTML = `
      <div class="audio-player">
        <div class="player-header">
          <div class="player-meta">
            <div class="player-title">${meta.title}</div>
            <div class="player-subtitle">${meta.sub}</div>
          </div>
          <span class="player-status status-idle" data-status>${statusLabel}</span>
        </div>
        <div class="player-controls">
          <button class="play-btn ${btnCls}" data-playbtn aria-label="Play/Pause">
            ${this._playIcon()}
          </button>
          <div class="progress-wrap">
            <div class="progress-bar" data-bar>
              <div class="progress-fill ${fillCls}" data-fill></div>
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
    const statusMap = I18N[currentLang].playerStatus;
    const clsMap = {
      idle: "status-idle", playing: "status-playing",
      paused: "status-paused", ended: "status-ended", error: "status-error",
    };
    this.$status.textContent = statusMap[s] || statusMap.idle;
    this.$status.className   = `player-status ${clsMap[s] || clsMap.idle}`;
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

// ── Page Dots Builder ──────────────────────────────────────────
function buildDots() {
  const dotsWrap = document.getElementById("page-dots");
  const labels = I18N[currentLang].pages;
  dotsWrap.innerHTML = "";
  PAGE_IDS.forEach((_, i) => {
    const d = document.createElement("button");
    d.className = `page-dot${i === currentPage ? " active" : ""}`;
    d.textContent = labels[i];
    d.addEventListener("click", () => goToPage(i));
    dotsWrap.appendChild(d);
  });
}

// ── Page Navigation ────────────────────────────────────────────
function goToPage(index) {
  if (index < 0 || index >= PAGE_IDS.length) return;

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
  document.getElementById("btn-next").disabled = index === PAGE_IDS.length - 1;
}

// ── DOM Initialization ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hero-title").textContent        = CONFIG.projectName;
  document.getElementById("hero-subtitle").textContent     = CONFIG.subtitle;
  document.getElementById("hero-tagline").textContent      = CONFIG.tagline;
  document.getElementById("nav-project").textContent       = CONFIG.projectName;
  document.getElementById("hero-institution").textContent  = CONFIG.institution;

  buildDots();

  document.getElementById("btn-prev").addEventListener("click", () => goToPage(currentPage - 1));
  document.getElementById("btn-next").addEventListener("click", () => goToPage(currentPage + 1));
  document.getElementById("side-left").addEventListener("click",  () => goToPage(currentPage - 1));
  document.getElementById("side-right").addEventListener("click", () => goToPage(currentPage + 1));
  document.getElementById("hero-cta").addEventListener("click", () => goToPage(1));

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") goToPage(currentPage + 1);
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goToPage(currentPage - 1);
  });

  document.querySelector("#page-1").classList.add("active");
  document.getElementById("nav").className = "hero-mode";
  document.getElementById("btn-prev").disabled = true;
  document.getElementById("bottom-nav").style.display = "none";
});
