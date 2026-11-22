import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FONT, loadPoppins, outline } from "../../lib/fonts";

loadPoppins();

export const TEST_DURATION = 150; // 5 s at 30 fps

export const Test: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hue = (frame * 2) % 360;
  const angle = 135 + frame * 1.2;
  const popAt = 10;
  const pop = spring({ frame: frame - popAt, fps, config: { damping: 9, stiffness: 160, mass: 0.8 } });
  const scale = interpolate(pop, [0, 1], [0, 1]);
  const breathe = 1 + Math.sin(frame / 8) * 0.025;
  const rot = Math.sin(frame / 15) * 2;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${angle}deg, hsl(${hue},85%,55%), hsl(${(hue + 80) % 360},85%,45%), hsl(${(hue + 160) % 360},80%,35%))`,
      }}
    >
      <AbsoluteFill
        style={{ background: "radial-gradient(circle at 50% 45%, transparent 45%, rgba(0,0,0,0.55) 100%)" }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 300 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 150,
            lineHeight: 1.05,
            color: "#FFE14D",
            textAlign: "center",
            transform: `scale(${scale * breathe}) rotate(${rot}deg)`,
            ...outline(14),
            textShadow: "0 14px 0 rgba(0,0,0,0.35)",
          }}
        >
          STUDIO
          <br />
          READY!
        </div>
      </AbsoluteFill>
      <Sequence from={popAt}>
        <Html5Audio src={staticFile("sfx/pop.wav")} volume={0.3} />
      </Sequence>
    </AbsoluteFill>
  );
};
