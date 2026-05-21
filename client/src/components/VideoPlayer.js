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
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
  .vjs-play-progress { background-color: #f59e0b !important; }
  .vjs-big-play-button {
    background-color: rgba(245, 158, 11, 0.9) !important;
    border-radius: 50% !important;
    width: 2.5em !important; height: 2.5em !important;
    line-height: 2.5em !important;
    margin-top: -1.25em !important; margin-left: -1.25em !important;
    border: none !important;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 40px rgba(245, 158, 11, 0.3);
  }
  .vjs-menu-button-popup .vjs-menu { left: -5em; bottom: 4em; }
  .vjs-menu-content {
    background-color: rgba(24, 24, 27, 0.95) !important;
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 10px 0;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  }
  .vjs-menu-item { text-transform: capitalize; padding: 10px 24px !important; font-weight: 600; font-size: 0.9em; }
  .vjs-menu-item:hover { background-color: #f59e0b !important; color: #000 !important; }
  .vjs-selected { background-color: rgba(245, 158, 11, 0.2) !important; color: #f59e0b !important; }
  .vjs-quality-selector:before { content: "\\f110"; font-family: VideoJS; }

  /* Landscape hint animation */
  @keyframes hint-slide-in {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .landscape-hint { animation: hint-slide-in 0.4s ease forwards; }

  /* Cast button pulse animation when connected */
  @keyframes cast-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.5); }
    50%       { box-shadow: 0 0 0 8px rgba(245,158,11,0); }
  }
  .cast-connected { animation: cast-pulse 2s ease infinite; }

  /* Casting overlay */
  @keyframes cast-overlay-in {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
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

  // ── Cast State ──────────────────────────────────────────────────────────
  const [castAvailable, setCastAvailable]   = useState(false);  // SDK loaded & devices found
  const [castConnected, setCastConnected]   = useState(false);  // Active session
  const [castDeviceName, setCastDeviceName] = useState('');     // e.g. "Living Room TV"
  const castSessionRef = useRef(null);

  // Use refs so the timeupdate closure always reads the latest values
  const introStartRef = useRef(Number(options.introStart) || 0);
  const introEndRef   = useRef(Number(options.introEnd)   || 0);
  const hasIntroRef   = useRef(introEndRef.current > introStartRef.current && introEndRef.current > 0);

  // Keep intro refs in sync if options change after mount
  useEffect(() => {
    introStartRef.current = Number(options.introStart) || 0;
    introEndRef.current   = Number(options.introEnd)   || 0;
    hasIntroRef.current   = introEndRef.current > introStartRef.current && introEndRef.current > 0;
    if (!hasIntroRef.current) setShowSkipIntro(false);
  }, [options.introStart, options.introEnd]);

  // ── Google Cast SDK Initialization ──────────────────────────────────────
  useEffect(() => {
    const initCast = () => {
      if (!window.cast || !window.chrome || !window.chrome.cast) return;

      const APPLICATION_ID = window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;

      const sessionRequest = new window.chrome.cast.SessionRequest(APPLICATION_ID);
      const apiConfig = new window.chrome.cast.ApiConfig(
        sessionRequest,
        // Session listener — fires when a session is established/resumed
        (session) => {
          castSessionRef.current = session;
          setCastConnected(true);
          setCastDeviceName(session.receiver?.friendlyName || 'TV');

          // If the player is already playing, load it on the Cast receiver
          if (playerRef.current) {
            loadMediaOnCast(session, playerRef.current.currentSrc(), playerRef.current.currentTime());
          }
        },
        // Receiver listener — 'available' means at least one Cast device was found
        (availability) => {
          setCastAvailable(availability === window.chrome.cast.ReceiverAvailability.AVAILABLE);
        }
      );

      window.cast.initialize(apiConfig, () => {}, (err) => {
        console.warn('Cast init error:', err);
      });
    };

    // The SDK fires __onGCastApiAvailable when ready
    window['__onGCastApiAvailable'] = (isAvailable) => {
      if (isAvailable) initCast();
    };

    // If the SDK already loaded before React mounted
    if (window.cast && window.cast.isAvailable) initCast();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cast Helpers ────────────────────────────────────────────────────────
  const loadMediaOnCast = (session, src, startTime = 0) => {
    if (!session || !src) return;
    const mediaInfo = new window.chrome.cast.media.MediaInfo(src, 'video/mp4');
    mediaInfo.metadata = new window.chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.title = options.title || 'Now Playing';

    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    request.currentTime = startTime;
    request.autoplay    = true;

    session.loadMedia(
      request,
      () => { /* success */ },
      (err) => console.warn('Cast loadMedia error:', err)
    );
  };

  const handleCastClick = () => {
    if (!window.cast || !window.chrome?.cast) return;

    if (castConnected && castSessionRef.current) {
      // Disconnect
      castSessionRef.current.stop(
        () => { setCastConnected(false); setCastDeviceName(''); castSessionRef.current = null; },
        (err) => console.warn('Cast stop error:', err)
      );
    } else {
      // Request a new session — shows the native Cast device picker
      const APPLICATION_ID = window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
      window.cast.requestSession(
        (session) => {
          castSessionRef.current = session;
          setCastConnected(true);
          setCastDeviceName(session.receiver?.friendlyName || 'TV');
          // Pause local playback, send to TV
          if (playerRef.current) {
            const currentTime = playerRef.current.currentTime();
            const src = playerRef.current.currentSrc();
            playerRef.current.pause();
            loadMediaOnCast(session, src, currentTime);
          }
        },
        (err) => {
          if (err.code !== 'cancel') console.warn('Cast request error:', err);
        },
        new window.chrome.cast.SessionRequest(APPLICATION_ID)
      );
    }
  };

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
          {options.title || 'Now Playing'}
        </h2>
      </div>

      {/* ── Cast Button (top-right) ───────────────────────────────────────── */}
      {castAvailable && (
        <button
          onClick={handleCastClick}
          title={castConnected ? `Casting to ${castDeviceName} — click to stop` : 'Cast to TV'}
          className={`absolute top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wide uppercase cursor-pointer backdrop-blur-md transition-all duration-300 ${
            castConnected 
              ? 'cast-connected bg-amber-500/15 border-2 border-amber-500 text-amber-500 opacity-100' 
              : 'bg-black/70 border-2 border-white/20 text-white opacity-0 group-hover:opacity-100 hover:border-amber-500 hover:text-amber-500'
          }`}
          style={{}}
          ref={el => { if (el && castConnected) el.style.opacity = '1'; }}
        >
          {/* Cast SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            {castConnected ? (
              // Filled cast icon when connected
              <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zm-18 3v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H5c-1.1 0-2 .9-2 2v3.17C1.88 8.69 1 9.74 1 11v8c0 1.1.9 2 2 2h3c0-2.76-2.24-5-5-5V5h18v14H9.83c.11.66.17 1.32.17 2H21c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            ) : (
              // Outline cast icon when not connected  
              <path d="M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            )}
          </svg>
          {castConnected ? `📺 ${castDeviceName}` : 'Cast'}
        </button>
      )}

      {/* ── Casting Overlay (shown when video is casting to TV) ─────────── */}
      {castConnected && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.88)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 30,
          animation: 'cast-overlay-in 0.3s ease forwards',
          borderRadius: '12px',
        }}>
          {/* Animated Cast waves */}
          <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 20 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                position: 'absolute', inset: 0,
                border: `3px solid rgba(245,158,11,${0.6 - i * 0.15})`,
                borderRadius: '50%',
                animation: `cast-pulse ${1.5 + i * 0.4}s ease-out infinite`,
                animationDelay: `${i * 0.3}s`,
                transform: `scale(${0.5 + i * 0.3})`,
              }}/>
            ))}
            {/* TV icon */}
            <svg style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}
              width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b">
              <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
            </svg>
          </div>
          <p style={{ color:'#f59e0b', fontWeight:900, fontSize:16, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>
            Casting to {castDeviceName}
          </p>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, marginBottom:20 }}>
            {options.title || 'Now Playing'} is playing on your TV
          </p>
          <button
            onClick={handleCastClick}
            style={{
              background:'transparent', border:'2px solid rgba(255,255,255,0.2)',
              color:'#fff', padding:'8px 20px', borderRadius:6,
              cursor:'pointer', fontSize:12, fontWeight:700, letterSpacing:'0.08em',
              textTransform:'uppercase', transition:'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#f59e0b'; e.currentTarget.style.color='#f59e0b'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='#fff'; }}
          >
            Stop Casting
          </button>
        </div>
      )}

      {/* ⏩ Skip Intro Button */}
      <button
        onClick={() => {
          if (playerRef.current) {
            playerRef.current.currentTime(introEndRef.current);
            setShowSkipIntro(false);
          }
        }}
        style={{
          position: 'absolute', bottom: '80px', right: '20px', zIndex: 50,
          opacity: showSkipIntro ? 1 : 0,
          pointerEvents: showSkipIntro ? 'auto' : 'none',
          transform: showSkipIntro ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(0,0,0,0.85)', border: '2px solid #f59e0b',
          color: '#f59e0b', fontWeight: '900', fontSize: '13px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '10px 22px', borderRadius: '6px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(245,158,11,0.3)',
          cursor: 'pointer', whiteSpace: 'nowrap',
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
