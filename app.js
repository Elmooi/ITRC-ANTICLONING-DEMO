/* ============================================================
   AntiFake Demo — 메인 애플리케이션 로직
   ============================================================ */

// ── 페이지 정의 ──────────────────────────────────────────────
const PAGES = [
  { id: "page-1", label: "소개" },
  { id: "page-2", label: "기술 개요" },
  { id: "page-3", label: "음성 데모" },
  { id: "page-4", label: "TTS 데모" },
  { id: "page-5", label: "비교 청취" },
];

// ── 상태 ─────────────────────────────────────────────────────
let currentPage = 0;
let activeSpeakerIndex = 0;
let allPlayers = [];          // 전체 정지용
const initializedPages = new Set();
const speakerUpdateFns = {};  // pageIndex → fn(speaker)
let animateInTarget = null;   // 마지막 애니메이션 대상 추적

// ── VIP 화자 표시 여부 ───────────────────────────────────────
let vipVisible = false;
const VIP_COUNT = 3; // speakers 배열 뒤에서 N명

function toggleVip() {
  vipVisible = !vipVisible;
  document.querySelectorAll(".speaker-tab-vip").forEach(el => {
    el.classList.toggle("hidden-vip", !vipVisible);
  });
}

// ── 화자 선택 (전역) ────────────────────────────────────────
function onSpeakerSelect(speaker) {
  activeSpeakerIndex = CONFIG.speakers.indexOf(speaker);

  // 초기화된 모든 페이지 플레이어 업데이트
  Object.values(speakerUpdateFns).forEach(fn => fn(speaker));

  // 모든 탭 UI 동기화
  document.querySelectorAll(".speaker-tabs").forEach(tabs => {
    tabs.querySelectorAll(".speaker-tab").forEach((btn, i) => {
      btn.classList.toggle("active", i === activeSpeakerIndex);
    });
  });
}

// ── 화자 탭 빌더 ─────────────────────────────────────────────
function buildSpeakerTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const vipStart = CONFIG.speakers.length - VIP_COUNT;
  CONFIG.speakers.forEach((speaker, idx) => {
    const isVip = idx >= vipStart;
    const btn = document.createElement("button");
    btn.className = `speaker-tab${idx === activeSpeakerIndex ? " active" : ""}${isVip ? " speaker-tab-vip" : ""}${isVip && !vipVisible ? " hidden-vip" : ""}`;
    btn.textContent = speaker.name;
    btn.addEventListener("click", () => onSpeakerSelect(speaker));
    container.appendChild(btn);
  });
}

// ── AudioPlayer 클래스 (CSS animation 기반) ─────────────────
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
      source:     { badge: "badge-source",    btn: "btn-source",    fill: "fill-source",    badgeText: "원본 음성",   title: "원본 음성",   sub: "보호 적용 전 실제 음성"   },
      protected:  { badge: "badge-protected", btn: "btn-protected", fill: "fill-protected", badgeText: "보호된 음성", title: "보호된 음성", sub: "보호 신호가 삽입된 음성"   },
      "tts-orig": { badge: "badge-tts-orig",  btn: "btn-tts-orig",  fill: "fill-tts-orig",  badgeText: "원본 TTS",    title: "원본 TTS",    sub: "보호 없이 복제된 음성"     },
      "tts-prot": { badge: "badge-tts-prot",  btn: "btn-tts-prot",  fill: "fill-tts-prot",  badgeText: "보호된 TTS",  title: "보호된 TTS",  sub: "복제 공격이 무력화된 음성" },
    }[this.type];

    this.container.innerHTML = `
      <div class="audio-player">
        <div class="player-header">
          <div class="player-meta">
            <div class="player-title">${meta.title}</div>
            <div class="player-subtitle">${meta.sub}</div>
          </div>
          <span class="player-status status-idle" data-status>대기</span>
        </div>
        <div class="player-controls">
          <button class="play-btn ${meta.btn}" data-playbtn aria-label="재생/일시정지">
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

  // CSS animation으로 진행 바를 구동 — currentTime polling 없이 완전 부드러움
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
      idle:    ["대기",     "status-idle"],
      playing: ["재생 중",  "status-playing"],
      paused:  ["일시정지", "status-paused"],
      ended:   ["완료",    "status-ended"],
      error:   ["오류",    "status-error"],
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

// ── 페이지 초기화 ────────────────────────────────────────────

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

// ── 페이지 네비게이션 ────────────────────────────────────────
function goToPage(index) {
  if (index < 0 || index >= PAGES.length) return;

  allPlayers.forEach(p => p.pause());

  const pages = document.querySelectorAll(".page");

  pages[currentPage].classList.remove("active");
  pages[currentPage].classList.add("exit");
  setTimeout(() => pages[currentPage]?.classList.remove("exit"), 300);

  currentPage = index;

  // 최초 방문 시 초기화
  if (pageInits[index] && !initializedPages.has(index)) {
    initializedPages.add(index);
    pageInits[index]();
  }

  pages[currentPage].classList.add("active");

  // 페이지 진입 애니메이션 재트리거 (이전 RAF 무효화)
  const cur = pages[currentPage];
  cur.classList.remove("animate-in");
  animateInTarget = cur;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (animateInTarget === cur) cur.classList.add("animate-in");
  }));

  // 히어로 페이지 진입 시 애니메이션 재트리거
  if (index === 0) {
    const heroEls = document.querySelectorAll(
      "#page-1 .hero-badge, #page-1 .hero-title, #page-1 .hero-subtitle, " +
      "#page-1 .hero-tagline, #page-1 .hero-cta, #page-1 .hero-scroll-hint"
    );
    heroEls.forEach(el => { el.style.animation = "none"; });
    void document.querySelector("#page-1").offsetWidth; // force reflow
    heroEls.forEach(el => { el.style.animation = ""; });
  }

  // nav 스타일
  document.getElementById("nav").className = index === 0 ? "hero-mode" : "page-mode";
  document.getElementById("bottom-nav").style.display = index === 0 ? "none" : "flex";
  // 레이블 & dots
  document.querySelectorAll(".page-dot").forEach((d, i) => d.classList.toggle("active", i === index));

  document.getElementById("btn-prev").disabled = index === 0;
  document.getElementById("btn-next").disabled = index === PAGES.length - 1;
}

// ── DOM 초기화 ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  // 히어로 텍스트
  document.getElementById("hero-title").textContent        = CONFIG.projectName;
  document.getElementById("hero-subtitle").textContent     = CONFIG.subtitle;
  document.getElementById("hero-tagline").textContent      = CONFIG.tagline;
  document.getElementById("nav-project").textContent       = CONFIG.projectName;
  document.getElementById("hero-institution").textContent  = CONFIG.institution;

  // 페이지 dots 생성
  const dotsWrap = document.getElementById("page-dots");
  PAGES.forEach((p, i) => {
    const d = document.createElement("button");
    d.className = `page-dot${i === 0 ? " active" : ""}`;
    d.textContent = p.label;
    d.addEventListener("click", () => goToPage(i));
    dotsWrap.appendChild(d);
  });

  // 버튼
  document.getElementById("btn-prev").addEventListener("click", () => goToPage(currentPage - 1));
  document.getElementById("btn-next").addEventListener("click", () => goToPage(currentPage + 1));
  document.getElementById("side-left").addEventListener("click",  () => goToPage(currentPage - 1));
  document.getElementById("side-right").addEventListener("click", () => goToPage(currentPage + 1));
  document.getElementById("hero-cta").addEventListener("click", () => goToPage(1));

  // 키보드
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") goToPage(currentPage + 1);
    if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goToPage(currentPage - 1);
    if (e.key === "p" || e.key === "P") toggleVip();
  });

  // 첫 페이지 표시
  document.querySelector("#page-1").classList.add("active");
  document.getElementById("nav").className = "hero-mode";
  document.getElementById("btn-prev").disabled = true;
  document.getElementById("bottom-nav").style.display = "none";

});
