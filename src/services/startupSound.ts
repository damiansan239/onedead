/**
 * StartupSoundService
 *
 * Loads and plays the startup sound on first user interaction (or immediately
 * if the browser allows auto-play). The audio element is kept alive so the
 * browser can cache the decoded audio data across the session.
 *
 * Caching strategy:
 *  - The file is served from /startup.mp3 (public/ folder).
 *  - The PWA workbox precache list includes *.mp3 so the service worker caches
 *    the file for offline use after the first load.
 *  - The browser's own HTTP cache also keeps the file around between visits
 *    thanks to standard cache headers served by Firebase Hosting.
 */
/** biome-ignore-all lint/style/noNonNullAssertion: No need */

const SOUND_PREF_KEY = "soundOn";

class StartupSoundService {
  private audio: HTMLAudioElement | null = null;
  /** Whether the sound has been started (may still be paused by the user). */
  private started = false;
  /** Pending interaction listeners registered when autoplay was blocked. */
  private pendingListeners: (() => void) | null = null;

  constructor() {
    this.preload();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Returns true when the user has sound enabled (persisted preference). */
  get isSoundEnabled(): boolean {
    return localStorage.getItem(SOUND_PREF_KEY) !== "false";
  }

  /** Returns true when audio is currently playing. */
  get isPlaying(): boolean {
    return !!this.audio && !this.audio.paused;
  }

  /**
   * Start the startup sound (respects the stored preference).
   * Safe to call multiple times — only the first call actually starts playback.
   */
  play(): void {
    if (this.started || !this.audio) return;
    if (!this.isSoundEnabled) return; // user previously disabled sound

    this.started = true;
    this._attemptPlay();
  }

  /** Pause playback and persist the user's preference. */
  pause(): void {
    localStorage.setItem(SOUND_PREF_KEY, "false");
    this._cancelPending();
    this.audio?.pause();
  }

  /** Resume playback and persist the user's preference. */
  resume(): void {
    localStorage.setItem(SOUND_PREF_KEY, "true");

    if (!this.audio) return;

    if (!this.started) {
      // play() was skipped because sound was off at load time — start now.
      this.started = true;
    }

    this.audio.play().catch(() => {});
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /** Eagerly create the Audio element so the browser starts fetching/caching. */
  private preload(): void {
    try {
      this.audio = new Audio("/startup.mp3");
      this.audio.preload = "auto";
      this.audio.loop = true;
      this.audio.load();
    } catch {
      // Silently ignore environments without audio support.
    }
  }

  private _attemptPlay(): void {
    if (!this.audio) return;

    this.audio.currentTime = 0;
    this.audio.play().catch(() => {
      // Autoplay was blocked — wait for the first user interaction.
      this.started = false; // allow re-trigger after interaction

      const resume = () => {
        this._cancelPending();
        if (!this.started && this.isSoundEnabled) {
          this.started = true;
          this.audio!.currentTime = 0;
          this.audio!.play().catch(() => {});
        }
      };

      document.addEventListener("pointerdown", resume, { once: true });
      document.addEventListener("keydown", resume, { once: true });

      this.pendingListeners = () => {
        document.removeEventListener("pointerdown", resume);
        document.removeEventListener("keydown", resume);
      };
    });
  }

  private _cancelPending(): void {
    this.pendingListeners?.();
    this.pendingListeners = null;
  }
}

/** Singleton instance shared across the app. */
const startupSoundService = new StartupSoundService();

export default startupSoundService;
