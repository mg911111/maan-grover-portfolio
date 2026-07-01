import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const AUDIO = {
  voiceover: { src: "/audio/intro-voiceover.mp3", volume: 0.92 },
  ambient: { src: "/audio/ambient.mp3", volume: 0.22 },
  click: { src: "/audio/click.mp3", volume: 0.76 },
  hover: { src: "/audio/hover.mp3", volume: 0.46 },
  panel: { src: "/audio/panel.mp3", volume: 0.8 },
};

const CLICK_SELECTOR = [
  "button",
  "a[href]",
  "[role='button']",
  "summary",
  ".choice-card",
  ".website-project-card",
  ".stream-project-card",
  ".stream-feature-card",
  ".stream-collection-card",
  ".stream-episode-card",
  ".stream-contact-card",
  ".panel-item",
  ".is-clickable",
].join(",");

const HOVER_SELECTOR = [
  "button",
  "a[href]",
  "[role='button']",
  ".choice-card",
  ".website-project-card",
  ".stream-project-card",
  ".stream-feature-card",
  ".stream-collection-card",
  ".stream-episode-card",
  ".stream-contact-card",
  ".panel-item",
  ".global-controls",
  ".is-clickable",
].join(",");

const ACTIVE_STAGES = new Set(["portfolio", "world"]);
const HOVER_THROTTLE_MS = 220;

function createAudio(config, { loop = false, preload = "none" } = {}) {
  const audio = new Audio(config.src);
  audio.preload = preload;
  audio.loop = loop;
  audio.volume = config.volume;
  return audio;
}

export const AudioSystem = forwardRef(function AudioSystem(
  { stage, musicMuted, panelOpen },
  ref
) {
  const audioRef = useRef(new Map());
  const unavailableRef = useRef(new Set());
  const warnedRef = useRef(new Set());
  const activatedRef = useRef(false);
  const musicMutedRef = useRef(musicMuted);
  const stageRef = useRef(stage);
  const panelOpenRef = useRef(panelOpen);
  const voiceoverVisitIdRef = useRef(0);
  const lastHoverAtRef = useRef(0);
  const syncStageRef = useRef(null);
  const playEffectRef = useRef(null);
  const choiceVoiceoverControlRef = useRef({ stop() {}, restart() {} });

  musicMutedRef.current = musicMuted;
  stageRef.current = stage;

  const markUnavailable = (name, error) => {
    const config = AUDIO[name];
    if (!config) return;
    unavailableRef.current.add(config.src);
    if (warnedRef.current.has(config.src)) return;
    warnedRef.current.add(config.src);
    console.warn(`Audio unavailable: ${config.src}`, error || "media load failed");
  };

  const getAudio = (name) => {
    const config = AUDIO[name];
    if (!config || unavailableRef.current.has(config.src)) return null;
    if (!audioRef.current.has(name)) {
      const audio = createAudio(config, {
        loop: name === "ambient",
        preload: name === "voiceover" ? "auto" : "none",
      });
      audio.addEventListener("error", () => markUnavailable(name), { once: true });
      audioRef.current.set(name, audio);
    }
    return audioRef.current.get(name);
  };

  const safelyPlay = (name, audio, { allowAutoplayRetry = false } = {}) => {
    if (!audio) return Promise.resolve(false);
    return audio.play().then(() => true).catch((error) => {
      if (allowAutoplayRetry && error?.name === "NotAllowedError") return false;
      markUnavailable(name, error);
      return false;
    });
  };

  const pause = (name) => {
    const audio = audioRef.current.get(name);
    if (audio && !audio.paused) audio.pause();
  };

  const syncStage = (nextStage = stageRef.current) => {
    const ambient = getAudio("ambient");
    const inExperience = ACTIVE_STAGES.has(nextStage);

    if (musicMutedRef.current || !inExperience) {
      pause("ambient");
    } else if (activatedRef.current) {
      safelyPlay("ambient", ambient);
    }

    if (nextStage !== "choice") pause("voiceover");
  };

  const playEffect = (name) => {
    if (!AUDIO[name]) return;
    const effect = getAudio(name);
    if (!effect) return;
    effect.currentTime = 0;
    safelyPlay(name, effect, { allowAutoplayRetry: true });
  };

  syncStageRef.current = syncStage;
  playEffectRef.current = playEffect;

  useImperativeHandle(ref, () => ({
    activate(nextStage = stageRef.current) {
      activatedRef.current = true;
      syncStage(nextStage);
    },
    setMusicMuted(nextMuted, nextStage = stageRef.current) {
      activatedRef.current = true;
      musicMutedRef.current = nextMuted;
      if (nextStage === "choice") {
        pause("ambient");
        if (nextMuted) choiceVoiceoverControlRef.current.stop();
        else choiceVoiceoverControlRef.current.restart();
        return;
      }
      if (nextMuted) {
        pause("ambient");
        return;
      }
      syncStage(nextStage);
    },
    playEffect,
  }));

  useEffect(() => {
    syncStageRef.current?.(stage);
  }, [stage]);

  useEffect(() => {
    if (stage !== "choice") return undefined;

    const voiceover = getAudio("voiceover");
    if (!voiceover) return undefined;
    const visitId = ++voiceoverVisitIdRef.current;
    let played = false;
    let attempting = false;

    voiceover.pause();
    voiceover.currentTime = 0;

    const removeGestureListeners = () => {
      document.removeEventListener("click", attemptPlayback);
      document.removeEventListener("pointerdown", attemptPlayback);
      document.removeEventListener("keydown", attemptPlayback);
      document.removeEventListener("touchstart", attemptPlayback);
    };

    const attemptPlayback = () => {
      if (played || attempting || musicMutedRef.current || stageRef.current !== "choice" || visitId !== voiceoverVisitIdRef.current) return;
      attempting = true;
      safelyPlay("voiceover", voiceover, { allowAutoplayRetry: true }).then((playing) => {
        attempting = false;
        if (visitId !== voiceoverVisitIdRef.current || stageRef.current !== "choice") {
          voiceover.pause();
          voiceover.currentTime = 0;
          return;
        }
        if (playing) {
          played = true;
          removeGestureListeners();
        }
      });
    };

    choiceVoiceoverControlRef.current = {
      stop() {
        voiceover.pause();
        voiceover.currentTime = 0;
      },
      restart() {
        if (stageRef.current !== "choice" || visitId !== voiceoverVisitIdRef.current) return;
        voiceover.pause();
        voiceover.currentTime = 0;
        played = false;
        attempting = false;
        attemptPlayback();
      },
    };

    document.addEventListener("click", attemptPlayback);
    document.addEventListener("pointerdown", attemptPlayback, { passive: true });
    document.addEventListener("keydown", attemptPlayback);
    document.addEventListener("touchstart", attemptPlayback, { passive: true });
    attemptPlayback();

    return () => {
      voiceoverVisitIdRef.current += 1;
      choiceVoiceoverControlRef.current = { stop() {}, restart() {} };
      removeGestureListeners();
      voiceover.pause();
      voiceover.currentTime = 0;
    };
  }, [stage]);

  useEffect(() => {
    const previousPanel = panelOpenRef.current;
    panelOpenRef.current = panelOpen;
    if (panelOpen && panelOpen !== previousPanel) playEffectRef.current?.("panel");
  }, [panelOpen]);

  useEffect(() => {
    const onClick = (event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest(CLICK_SELECTOR);
      if (!target) return;
      activatedRef.current = true;
      playEffectRef.current?.("click");
    };

    const onKeyInteraction = () => {
      activatedRef.current = true;
    };

    const onPointerOver = (event) => {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest(HOVER_SELECTOR);
      if (!target || target.contains(event.relatedTarget)) return;
      const now = window.performance.now();
      if (now - lastHoverAtRef.current < HOVER_THROTTLE_MS) return;
      lastHoverAtRef.current = now;
      playEffectRef.current?.("hover");
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyInteraction);
    document.addEventListener("pointerover", onPointerOver, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyInteraction);
      document.removeEventListener("pointerover", onPointerOver);
    };
  }, []);

  useEffect(() => () => {
    audioRef.current.forEach((audio) => audio.pause());
  }, []);

  return null;
});
