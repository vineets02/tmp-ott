import React, { useEffect, useRef } from 'react';
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
`;

export const VideoPlayer = (props) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const { options, onReady, onProgress } = props;

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

      // Progress Tracking (Heartbeat)
      player.on('timeupdate', () => {
        const currentTime = player.currentTime();
        if (onProgress) onProgress(currentTime);
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
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player className="w-full h-full group relative overflow-hidden rounded-xl">
      <style>{customStyles}</style>
      <div ref={videoRef} />
      <div className="absolute top-6 left-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <h2 className="text-xl font-black text-white drop-shadow-lg uppercase tracking-wider">
          {options.title || "Now Playing"}
        </h2>
      </div>
    </div>
  );
}

export default VideoPlayer;
