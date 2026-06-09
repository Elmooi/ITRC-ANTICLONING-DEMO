// ============================================================
// Demo Configuration
// Edit speakers, audio paths, and project info here.
// ============================================================

const CONFIG = {
  projectName: "Anti-Cloning",
  subtitle: "Deepfake Generation Suppression System",
  tagline: "Technology to protect voices from audio deepfakes",
  institution: "ViVaTech 2026",

  speakers: [
    { id: "dicaprio",    name: "DiCaprio",    folder: "디카프리오", gender: "M" },
    { id: "charlieputh", name: "Charlie Puth", folder: "찰리푸스",  gender: "M" },
    { id: "ariana",      name: "Ariana",       folder: "아리아나",  gender: "F" },
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
