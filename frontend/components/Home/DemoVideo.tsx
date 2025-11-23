"use client";

import { useState, useEffect, useRef } from "react";

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Chapter {
  time: number;
  label: string;
  angle: number;
}

const chapters: Chapter[] = [
  { time: 0, label: "Introduction", angle: 0 },
  { time: 21, label: "Platform Overview", angle: 90 },
  { time: 60, label: "Publishing Data", angle: 180 },
  { time: 120, label: "Marketplace", angle: 270 },
];

export default function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);
  const playerDivRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const videoId = "lNNduEGKTbg";

  // Load YouTube IFrame API
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      initializePlayer();
      return;
    }

    // Load API
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = initializePlayer;

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, []);

  const initializePlayer = () => {
    if (!playerDivRef.current) return;

    new window.YT.Player(playerDivRef.current, {
      videoId: videoId,
      playerVars: {
        start: 0,
        enablejsapi: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          setPlayer(event.target);
        },
        onStateChange: (event: any) => {
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          setIsPlaying(event.data === 1);
        },
      },
    });
  };

  // Track current time
  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
      if (player && player.getCurrentTime) {
        const time = Math.floor(player.getCurrentTime());
        setCurrentTime(time);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [player]);

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
      canvasWidth: number;
      canvasHeight: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = Math.random() * this.canvasWidth;
        this.y = Math.random() * this.canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 2;
        const colors = ["#FF9F1C", "#4ECDC4", "#95D600", "#C69C6D"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.3 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = this.canvasWidth;
        if (this.x > this.canvasWidth) this.x = 0;
        if (this.y < 0) this.y = this.canvasHeight;
        if (this.y > this.canvasHeight) this.y = 0;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const particleCount = isPlaying ? 40 : 20;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const executeCommand = (command: string, action: () => void) => {
    setActiveCommand(command);
    setTimeout(() => {
      action();
      setActiveCommand(null);
    }, 300);
  };

  const handlePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSeek = (time: number) => {
    if (!player) return;
    player.seekTo(time, true);
    setCurrentTime(time);
  };

  const handleFullscreen = () => {
    if (!player) return;

    // Get the iframe element from the YouTube player
    const iframe = player.getIframe();
    if (iframe) {
      // Try different fullscreen APIs for browser compatibility
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getActiveChapter = () => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].time) {
        return chapters[i];
      }
    }
    return chapters[0];
  };

  return (
    <section className="relative w-full border-t border-white/5 py-24 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yuzu/5 rounded-full blur-[96px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hydro/5 rounded-full blur-[96px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          {/* <div className="inline-block mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-hydro border border-hydro/30 bg-hydro/10 px-4 py-2 rounded-full">
              ⚡ LIVE DEMO TRANSMISSION
            </span>
          </div> */}
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            See <span className="text-yuzu">CapyData</span> in Action
          </h2>
          <p className="text-gray-400 font-mono max-w-2xl mx-auto text-sm md:text-base">
            Watch the full platform demonstration. Terminal controls enabled.
          </p>
        </div>

        {/* Main Holodeck Container */}
        <div
          className="relative reveal delay-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Orbital Rings */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: "translateZ(0)" }}
          >
            {/* Outer ring */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              strokeDasharray="8 12"
              className={`transition-all duration-1000 ${
                isHovered ? "opacity-60" : "opacity-20"
              }`}
              style={{
                animation: "orbit-spin-slow 30s linear infinite",
              }}
            />
            {/* Middle ring */}
            <circle
              cx="50%"
              cy="50%"
              r="38%"
              fill="none"
              stroke="url(#gradient2)"
              strokeWidth="2"
              strokeDasharray="6 10"
              className={`transition-all duration-1000 ${
                isHovered ? "opacity-50" : "opacity-15"
              }`}
              style={{
                animation: "orbit-spin-medium 20s linear infinite reverse",
              }}
            />
            {/* Inner ring */}
            <circle
              cx="50%"
              cy="50%"
              r="32%"
              fill="none"
              stroke="url(#gradient3)"
              strokeWidth="3"
              strokeDasharray="4 8"
              className={`transition-all duration-1000 ${
                isHovered ? "opacity-70" : "opacity-25"
              }`}
              style={{
                animation: "orbit-spin-fast 15s linear infinite",
              }}
            />

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9F1C" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#4ECDC4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#95D600" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="gradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#C69C6D" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#95D600" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Chapter markers on orbital ring */}
            {chapters.map((chapter, idx) => {
              const isActive = getActiveChapter() === chapter;
              const radius = 38;
              const angleRad = (chapter.angle * Math.PI) / 180;
              const x = 50 + radius * Math.cos(angleRad);
              const y = 50 + radius * Math.sin(angleRad);

              return (
                <g key={idx}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="8"
                    fill={isActive ? "#FF9F1C" : "#4ECDC4"}
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive ? "opacity-100 animate-pulse" : "opacity-50 hover:opacity-80"
                    }`}
                    onClick={() => handleSeek(chapter.time)}
                    style={{ filter: `drop-shadow(0 0 8px ${isActive ? "#FF9F1C" : "#4ECDC4"})` }}
                  />
                  <text
                    x={`${x}%`}
                    y={`${y - 2}%`}
                    textAnchor="middle"
                    className="font-mono text-xs fill-white pointer-events-none"
                    style={{ fontSize: "10px" }}
                  >
                    {formatTime(chapter.time)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Particle Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ mixBlendMode: "screen" }}
          />

          {/* Corner Brackets */}
          <div
            className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yuzu/60 pointer-events-none transition-all duration-500"
            style={{ transform: isHovered ? "translate(-4px, -4px)" : "translate(0, 0)" }}
          />
          <div
            className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-hydro/60 pointer-events-none transition-all duration-500"
            style={{ transform: isHovered ? "translate(4px, -4px)" : "translate(0, 0)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-grass/60 pointer-events-none transition-all duration-500"
            style={{ transform: isHovered ? "translate(-4px, 4px)" : "translate(0, 0)" }}
          />
          <div
            className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yuzu/60 pointer-events-none transition-all duration-500"
            style={{ transform: isHovered ? "translate(4px, 4px)" : "translate(0, 0)" }}
          />

          {/* Main Video Container */}
          <div
            className={`relative bg-panel/80 backdrop-blur-xl border-4 rounded-2xl overflow-hidden transition-all duration-800 ${
              isHovered
                ? "border-yuzu shadow-[0_0_60px_rgba(255,159,28,0.4),0_0_120px_rgba(78,205,196,0.2)]"
                : "border-border shadow-[0_0_30px_rgba(255,159,28,0.2)]"
            }`}
          >
            {/* CRT Scanline Overlay */}
            <div
              className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-500 ${
                isHovered ? "opacity-30" : "opacity-0"
              }`}
              style={{
                background:
                  "repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, transparent 2px, transparent 4px)",
                animation: isHovered ? "scanline-sweep 8s linear infinite" : "none",
              }}
            />

            {/* YouTube Video */}
            <div className="relative aspect-video bg-black">
              <div ref={playerDivRef} className="w-full h-full" />
            </div>

            {/* Terminal Control Panel */}
            <div className="bg-void/95 backdrop-blur-md border-t border-white/10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Terminal Commands */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-grass animate-pulse" />
                    <span className="font-mono text-xs text-gray-500">SYSTEM READY</span>
                  </div>

                  {/* Play/Pause */}
                  <button
                    onClick={() =>
                      executeCommand(
                        isPlaying ? "$ killall playback" : "$ ./demo.sh --play",
                        handlePlayPause
                      )
                    }
                    className="w-full text-left font-mono text-sm text-gray-300 hover:text-yuzu transition-colors duration-300 group"
                  >
                    <span className="text-grass">$</span>{" "}
                    {activeCommand === (isPlaying ? "$ killall playback" : "$ ./demo.sh --play") ? (
                      <span className="typing-text">
                        {isPlaying ? "killall playback" : "./demo.sh --play"}
                        <span className="animate-blink">_</span>
                      </span>
                    ) : (
                      <span className="group-hover:text-yuzu">
                        {isPlaying ? "killall playback" : "./demo.sh --play"}
                      </span>
                    )}
                  </button>

                  {/* Seek */}
                  <button
                    onClick={() => executeCommand("$ seek --timestamp 00:00", () => handleSeek(0))}
                    className="w-full text-left font-mono text-sm text-gray-300 hover:text-hydro transition-colors duration-300 group"
                  >
                    <span className="text-grass">$</span>{" "}
                    <span className="group-hover:text-hydro">seek --timestamp 00:00</span>
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={() =>
                      executeCommand("$ expand --mode theater", handleFullscreen)
                    }
                    className="w-full text-left font-mono text-sm text-gray-300 hover:text-grass transition-colors duration-300 group"
                  >
                    <span className="text-grass">$</span>{" "}
                    <span className="group-hover:text-grass">expand --mode theater</span>
                  </button>
                </div>

                {/* Right: System Stats */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>TIMESTAMP:</span>
                    <span className="text-yuzu font-bold">{formatTime(currentTime)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>CHAPTER:</span>
                    <span className="text-hydro">{getActiveChapter().label}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>STATUS:</span>
                    <span className={isPlaying ? "text-grass" : "text-gray-400"}>
                      {isPlaying ? "▶ PLAYING" : "⏸ PAUSED"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>RESOLUTION:</span>
                    <span className="text-white">1920x1080 @ 60fps</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>CODEC:</span>
                    <span className="text-white">H.264 | AAC</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>NETWORK:</span>
                    <span className="text-grass">CONNECTED ██████████ 100%</span>
                  </div>
                </div>
              </div>

              {/* Chapter Timeline */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {chapters.map((chapter, idx) => {
                    const isActive = getActiveChapter() === chapter;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSeek(chapter.time)}
                        className={`px-3 py-2 rounded-lg font-mono text-xs transition-all duration-300 ${
                          isActive
                            ? "bg-yuzu/20 border border-yuzu text-yuzu shadow-[0_0_20px_rgba(255,159,28,0.3)]"
                            : "bg-white/5 border border-white/10 text-gray-400 hover:border-hydro hover:text-hydro"
                        }`}
                      >
                        {formatTime(chapter.time)} - {chapter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 reveal delay-200">
          <p className="font-mono text-sm text-gray-400 mb-4">
            Ready to experience the chillest data marketplace?
          </p>
          <a
            href="/marketplace"
            className="inline-block px-8 py-4 bg-yuzu hover:bg-yuzu/90 text-void font-bold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,159,28,0.5)]"
          >
            Explore Marketplace
          </a>
        </div>
      </div>
    </section>
  );
}
