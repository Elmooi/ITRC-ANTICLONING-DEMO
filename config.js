// ============================================================
// Demo Configuration — 한/영 이중 언어
// ============================================================

const CONFIG_EN = {
  lang: "en",
  projectName: "Anti-Cloning",
  subtitle: "Proactive protection System",
  tagline: "Technology to protect voices from audio deepfakes",
  institution: "ITRC Exhibition",
  speakers: [
    { id: "dicaprio",    name: "Leonardo DiCaprio", folder: "디카프리오", gender: "M" },
    { id: "charlieputh", name: "Charlie Puth",       folder: "찰리푸스",  gender: "M" },
    { id: "ariana",      name: "Ariana Grande",      folder: "아리아나",  gender: "F" },
  ],
  getAudioPaths(speaker) {
    const base = "audio";
    const folder = encodeURIComponent(speaker.folder);
    return {
      source:       `${base}/${folder}/orig.wav`,
      protected:    `${base}/${folder}/protected.wav`,
      ttsOrig:      `${base}/${folder}/orig_tts.wav`,
      ttsProtected: `${base}/${folder}/protected_tts.wav`,
    };
  },
};

const CONFIG_KO = {
  lang: "ko",
  projectName: "Anti-Cloning",
  subtitle: "능동형 보호 시스템",
  tagline: "음성 딥페이크로부터 목소리를 지키는 기술",
  institution: "ITRC 전시회",
  speakers: [
    { id: "yujaeseok",    name: "유재석", folder: "유재석", gender: "M" },
    { id: "iu",           name: "아이유", folder: "아이유", gender: "F" },
    { id: "jangwonyoung", name: "장원영", folder: "장원영", gender: "F" },
    { id: "sonheungmin",  name: "손흥민", folder: "손흥민", gender: "M" },
  ],
  getAudioPaths(speaker) {
    const base = "audio";
    const folder = encodeURIComponent(speaker.folder);
    return {
      source:       `${base}/${folder}/orig.wav`,
      protected:    `${base}/${folder}/protected.wav`,
      ttsOrig:      `${base}/${folder}/orig_tts.wav`,
      ttsProtected: `${base}/${folder}/protected_tts.wav`,
    };
  },
};

let CONFIG = CONFIG_EN;
