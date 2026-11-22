import { Composition } from "remotion";
import { Test, TEST_DURATION } from "./videos/Test/Test";

// Every video lives in src/videos/<name>/ and is registered here.
const V = { width: 1080, height: 1920, fps: 30 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Test" component={Test} durationInFrames={TEST_DURATION} {...V} />
    </>
  );
};
