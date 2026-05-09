import React from "react";

export default function Hero({ videoUrl, posterUrl, children }) {
  return (
    <section className="relative h-[95vh] w-full overflow-hidden bg-black">
      {/* Background Media */}
      <div className="absolute inset-0">
        {videoUrl ? (
          <video
            className="h-full w-full object-cover scale-105"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={posterUrl}
          />
        ) : (
          <img
            src={posterUrl}
            alt="hero"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Premium Multi-Layer Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent" />

      {/* Content Container */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 pb-20 md:px-10">
        <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
          {children}
        </div>
      </div>

      {/* Decorative Accents */}
      <div className="absolute left-0 top-1/2 h-96 w-1 bg-amber-500 blur-2xl opacity-20" />
    </section>
  );
}
