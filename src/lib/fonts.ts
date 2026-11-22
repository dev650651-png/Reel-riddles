import { continueRender, delayRender, staticFile } from "remotion";

// Loads Poppins 700/800 from public/fonts with the FontFace API.
// Rendering waits (delayRender) until both faces are ready.
let started = false;

export const loadPoppins = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("Loading Poppins 700/800");
  const faces = [
    new FontFace("Poppins", `url(${staticFile("fonts/Poppins-700.woff2")}) format("woff2")`, { weight: "700" }),
    new FontFace("Poppins", `url(${staticFile("fonts/Poppins-800.woff2")}) format("woff2")`, { weight: "800" }),
  ];
  Promise.all(faces.map((f) => f.load()))
    .then((loaded) => {
      loaded.forEach((f) => document.fonts.add(f));
      continueRender(handle);
    })
    .catch((err) => {
      console.error("Font load failed", err);
      continueRender(handle);
    });
};

export const FONT = "Poppins, sans-serif";

// Thick dark outline for on-screen chips (per CLAUDE.md LOOK rules).
export const outline = (px = 10, color = "#1a1030") => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: "stroke fill" as const,
});
