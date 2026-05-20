import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const customStyles = `
  .video-js {
    font-family: 'Inter', sans-serif;
    color: #fff;
    background-color: #000;
  }
  .vjs-control-bar {
    background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%) !important;
    height: 5em !important;
    padding-bottom: 0.5em;
    align-items: center;
    backdrop-filter: blur(5px);
    display: flex !important; /* Force display */
    opacity: 1 !important;
    visibility: visible !important;
  }
  .vjs-play-progress {
    background-color: #f59e0b !important;
  }
  .vjs-big-play-button {
    background-color: rgba(245, 158, 11, 0.9) !important;
    border-radius: 50% !important;
    width: 2.5em !important;
    height: 2.5em !important;
    line-height: 2.5em !important;
    margin-top: -1.25em !important;
    margin-left: -1.25em !important;
    border: none !important;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 40px rgba(245, 158, 11, 0.3);
  }
  .vjs-menu-button-popup .vjs-menu {
    left: -5em;
    bottom: 4em;
  }
  .vjs-menu-content {
    background-color: rgba(24, 24, 27, 0.95) !important;
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 10px 0;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  }
  .vjs-menu-item {
    text-transform: capitalize;
    padding: 10px 24px !important;
    font-weight: 600;
    font-size: 0.9em;
  }
  .vjs-menu-item:hover {
    background-color: #f59e0b !important;
    color: #000 !important;
  }
  .vjs-selected {
    background-color: rgba(245, 158, 11, 0.2) !important;
    color: #f59e0b !important;
  }
  .vjs-quality-selector:before {
    content: "\\f110"; /* Gear icon */
    font-family: VideoJS;
  }

  /* Landscape hint animation */
  @keyframes hint-slide-in {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .landscape-hint {
    animation: hint-slide-in 0.4s ease forwards;
  }
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true only on touch-capable small screens (phones/tablets) */
const isMobileDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
  window.screen.width < 1200;

/** Lock screen to landscape using the modern Orientation API */
const lockLandscape = async () => {
  try {
    if (window.screen.orientation && window.screen.orientation.lock) {
      await window.screen.orientation.lock('landscape');
    }
  } catch (_) {
    // Silently ignore — some browsers block this unless triggered by a user gesture
  }
};

/** Unlock screen orientation back to natural */
const unlockOrientation = () => {
  try {
    if (window.screen.orientation && window.screen.orientation.unlock) {
      window.screen.orientation.unlock();
    }
  } catch (_) {}
};

/** Show a brief "Rotate for best experience" toast below the player */
const showRotateHint = (containerEl) => {
  if (!containerEl || !isMobileDevice()) return;

  // Only show in portrait
  const orientationType = window.screen.orientation?.type || '';
  if (orientationType.includes('landscape')) return;

  const existing = containerEl.querySelector('.landscape-hint');
  if (existing) return;

  const hint = document.createElement('div');
  hint.className = 'landscape-hint';
  hint.style.cssText = `
    position: absolute;
    bottom: 72px;
    left: 50%;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,0,0,0.85);
    border: 1px solid rgba(245,158,11,0.4);
    color: #f59e0b;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 8px 16px;
    border-radius: 999px;
    backdrop-filter: blur(8px);
    white-space: nowrap;
    pointer-events: none;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  `;
  hint.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 2l4 4-4 4"/>
      <path d="M20 6H8a4 4 0 00-4 4"/>
    </svg>
    Rotate for best experience
  `;

  containerEl.style.position = 'relative';
  containerEl.appendChild(hint);

  // Auto remove after 4 seconds
  setTimeout(() => {
    if (hint.parentNode) hint.remove();
  }, 4000);
};

// ─── Component ───────────────────────────────────────────────────────────────

export const VideoPlayer = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const { options, onReady, onProgress } = props;

  // Use refs so the timeupdate closure always reads the latest values
  // (avoids stale-closure bugs since useEffect runs only once)
  const introStartRef = useRef(Number(options.introStart) || 0);
  const introEndRef   = useRef(Number(options.introEnd)   || 0);
  const hasIntroRef   = useRef(introEndRef.current > introStartRef.current && introEndRef.current > 0);

  // Keep refs in sync if options change after mount
  useEffect(() => {
    introStartRef.current = Number(options.introStart) || 0;
    introEndRef.current   = Number(options.introEnd)   || 0;
    hasIntroRef.current   = introEndRef.current > introStartRef.current && introEndRef.current > 0;
    // If we're past the intro window already, hide the button
    if (!hasIntroRef.current) setShowSkipIntro(false);
  }, [options.introStart, options.introEnd]);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add('vjs-big-play-centered');
      videoElement.classList.add('vjs-fluid');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        ...options,
        html5: {
          vhs: { overrideNative: true },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        },
        controlBar: {
          children: [
            'playToggle',
            'volumePanel',
            'currentTimeDisplay',
            'progressControl',
            'durationDisplay',
            'subsCapsButton',
            'audioTrackButton',
            'playbackRateMenuButton',
            'fullscreenToggle',
          ],
        },
      }, () => {
        // Seek to startTime if provided
        if (options.startTime) {
          player.currentTime(options.startTime);
        }
        onReady && onReady(player);
      });

      // ── Auto Landscape on Mobile ──────────────────────────────────────────
      // On the very first Play tap on a mobile/tablet:
      //   1. Request fullscreen (this is a user-gesture so the browser allows it)
      //   2. Lock orientation to landscape inside the fullscreen handler
      // This gives a true "auto-rotate" experience like native video apps.

      let hasAutoFullscreened = false;

      player.on('play', () => {
        if (!isMobileDevice()) return;
        if (hasAutoFullscreened) return;  // Only trigger once per session
        hasAutoFullscreened = true;

        // Request fullscreen — must be called inside a user-gesture handler
        const el = player.el();
        const requestFs =
          el.requestFullscreen ||
          el.webkitRequestFullscreen ||
          el.mozRequestFullScreen ||
          el.msRequestFullscreen;

        if (requestFs) {
          requestFs.call(el)
            .then(() => {
              // Now we are in fullscreen → lock landscape
              lockLandscape();
            })
            .catch(() => {
              // Fullscreen was denied (e.g. iOS) → just lock orientation directly
              lockLandscape();
            });
        } else {
          // Fallback: just try locking orientation without fullscreen
          lockLandscape();
        }
      });

      // Also lock landscape whenever fullscreen is entered (e.g. user taps ⛶ button manually)
      player.on('fullscreenchange', () => {
        if (player.isFullscreen()) {
          lockLandscape();
        } else {
          // Exited fullscreen → release lock so OS can rotate back
          unlockOrientation();
          hasAutoFullscreened = false; // Allow re-trigger if they re-open
        }
      });

      // Browser-native fullscreenchange (iOS Safari / Firefox)
      const handleBrowserFullscreen = () => {
        const fsEl =
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullscreenElement;

        if (fsEl) {
          lockLandscape();
        } else {
          unlockOrientation();
          hasAutoFullscreened = false;
        }
      };

      document.addEventListener('fullscreenchange', handleBrowserFullscreen);
      document.addEventListener('webkitfullscreenchange', handleBrowserFullscreen);
      document.addEventListener('mozfullscreenchange', handleBrowserFullscreen);

      // Store cleanup ref so we can remove listeners on unmount
      player._cleanupOrientationHandlers = () => {
        document.removeEventListener('fullscreenchange', handleBrowserFullscreen);
        document.removeEventListener('webkitfullscreenchange', handleBrowserFullscreen);
        document.removeEventListener('mozfullscreenchange', handleBrowserFullscreen);
      };

      // ─────────────────────────────────────────────────────────────────────

      // Progress Tracking (Heartbeat) + Skip Intro Detection
      player.on('timeupdate', () => {
        const currentTime = player.currentTime();
        if (onProgress) onProgress(currentTime);

        // Show/hide Skip Intro button — reads from refs (never stale)
        if (hasIntroRef.current) {
          setShowSkipIntro(
            currentTime >= introStartRef.current && currentTime < introEndRef.current
          );
        } else {
          setShowSkipIntro(false);
        }
      });

      // Quality Selector
      player.ready(() => {
        const Component = videojs.getComponent('MenuButton');
        const MenuItem = videojs.getComponent('MenuItem');

        class QualityButton extends Component {
          constructor(player, options) {
            super(player, options);
            this.controlText('Quality');
          }
          createMenu() {
            const menu = super.createMenu();
            const qualities = ['Auto', '1080p (HD)', '720p', '480p'];
            qualities.forEach(q => {
              const item = new MenuItem(this.player(), {
                label: q,
                selectable: true,
                selected: q === '1080p (HD)'
              });
              menu.addItem(item);
            });
            return menu;
          }
          buildCSSClass() { return `vjs-quality-selector ${super.buildCSSClass()}`; }
        }

        videojs.registerComponent('QualityButton', QualityButton);
        player.getChild('controlBar').addChild('QualityButton', {}, 8);
      });

    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay);
      player.src(options.sources);
      if (options.startTime) player.currentTime(options.startTime);
    }
  }, [options, videoRef]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        // Clean up orientation event listeners
        if (player._cleanupOrientationHandlers) {
          player._cleanupOrientationHandlers();
        }
        // Always unlock orientation when navigating away
        unlockOrientation();
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="w-full h-full group relative overflow-hidden rounded-xl">
      <style>{customStyles}</style>
      <div ref={videoRef} />

      {/* Movie title overlay */}
      <div className="absolute top-6 left-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <h2 className="text-xl font-black text-white drop-shadow-lg uppercase tracking-wider">
          {options.title || "Now Playing"}
        </h2>
      </div>

      {/* ⏩ Skip Intro Button */}
      <button
        onClick={() => {
          if (playerRef.current) {
            playerRef.current.currentTime(introEndRef.current);
            setShowSkipIntro(false);
          }
        }}
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          zIndex: 50,
          opacity: showSkipIntro ? 1 : 0,
          pointerEvents: showSkipIntro ? 'auto' : 'none',
          transform: showSkipIntro ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0,0,0,0.85)',
          border: '2px solid #f59e0b',
          color: '#f59e0b',
          fontWeight: '900',
          fontSize: '13px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '10px 22px',
          borderRadius: '6px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"/>
        </svg>
        Skip Intro
      </button>
    </div>
  );
}

export default VideoPlayer;
