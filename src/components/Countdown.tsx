import React from "react";

interface CountdownProps {
  onComplete: () => void;
}

const playBeep = (
  pitch: number,
  duration: number,
  type: OscillatorType = "sine",
) => {
  const soundOn = localStorage.getItem("soundOn") !== "false";
  if (!soundOn) return;

  try {
    // @ts-expect-error
    const AudioContext =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);

    // Exponential fade-out for a smooth premium tone and no clicks
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + duration - 0.02,
    );

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn(
      "Audio Context playback failed or was blocked by browser policy:",
      e,
    );
  }
};

const Countdown = ({ onComplete }: CountdownProps): React.ReactElement => {
  const [count, setCount] = React.useState<number>(3);
  const [key, setKey] = React.useState<number>(0);

  // Play audio tones when count changes
  React.useEffect(() => {
    if (count > 0) {
      // Warm, digital beep for 3, 2, 1 (D5 note, synth style)
      playBeep(587.33, 0.25, "triangle");
    } else if (count === 0) {
      // Rich dual-tone synthesizer sweep for GO!
      playBeep(880.0, 0.4, "triangle");
      setTimeout(() => {
        playBeep(1174.66, 0.6, "sine");
      }, 80);
    }
  }, [count]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 950);
          return 0;
        }
        setKey((k) => k + 1);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onComplete]);

  // Dynamic instruction text matching the countdown state
  const getSubText = () => {
    switch (count) {
      case 3:
        return "PREPARE YOUR MIND...";
      case 2:
        return "CRACK THE PATTERN...";
      case 1:
        return "READY TO SCAN...";
      case 0:
      default:
        return "FIND THE CODE!";
    }
  };

  const displayText = count === 0 ? "GO!" : count.toString();

  return (
    <div className="absolute bg-white inset-0 z-50 flex flex-col justify-center items-center select-none overflow-hidden">
      {/* Dynamic Instructional Subtitle */}
      <div className="h-6 flex items-center justify-center">
        <p className="font-mono text-sm sm:text-base font-bold tracking-[0.2em] text-gray-600 drop-shadow-[0_0_10px_rgba(244,63,94,0.3)] uppercase">
          {getSubText()}
        </p>
      </div>
      {/* Main Countdown Container */}
      <div className="flex flex-col items-center justify-center gap-6 z-10">
        {/* Large Glowing Number */}
        <div className="h-44 flex items-center justify-center">
          <span
            key={key}
            className={`
              text-8xl sm:text-9xl font-black tracking-tight select-none
              animate-countdown-tick
            `}
          >
            {displayText}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
