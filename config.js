// ============================================================
// 전시 데모 설정 파일
// 화자, 오디오 경로, 프로젝트 정보를 여기서 수정하세요.
// ============================================================

const CONFIG = {
  // 프로젝트 정보
  projectName: "Anti-Cloning",
  subtitle: "딥페이크 생성 억제 시스템",
  tagline: "음성 복제 공격으로부터 목소리를 보호하는 기술",
  institution: "ITRC 인재양성대전 2026",

  // 화자 목록
  // folder: VIPvoice 내 폴더명 (공백은 %20으로 표기)
  // sample.orig / sample.protected: orig, protected 폴더 내 파일명
  // sample.origTts / sample.protectedTts: orig_tts, protected_tts 폴더 내 파일명
  speakers: [
    { id: "iu",     name: "아이유",       folder: "아이유",       gender: "F" },
    { id: "jwy",    name: "장원영",       folder: "장원영",       gender: "F" },
    { id: "yoo",    name: "유재석",       folder: "유재석",       gender: "M" },
    { id: "son",    name: "손흥민",       folder: "손흥민",       gender: "M" },
    { id: "ryujm",  name: "류제명 2차관", folder: "류제명 2차관", gender: "M" },
    { id: "park",   name: "박태완 국장",  folder: "박태완 국장",  gender: "M" },
    { id: "lee",    name: "이도규 실장",  folder: "이도규 실장",  gender: "M" },
  ],

  // 오디오 경로 반환 함수 (demo/ 폴더 기준 상대경로)
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
