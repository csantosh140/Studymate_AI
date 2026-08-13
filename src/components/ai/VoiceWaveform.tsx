"use client";

export function VoiceWaveform({ active }: { active: boolean }) {
  const bars = [4, 7, 12, 9, 5, 14, 8, 11, 6, 10];
  return (
    <span className="voice-waveform" aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`voice-bar${active ? " voice-bar--active" : ""}`}
          style={{ "--bar-h": `${h}px`, "--bar-i": i } as React.CSSProperties}
        />
      ))}
    </span>
  );
}
