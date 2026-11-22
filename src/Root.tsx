import { Composition } from "remotion";
import { Test, TEST_DURATION } from "./videos/Test/Test";
import { ScooterProfit, SCOOTER_PROFIT_DURATION } from "./videos/ScooterProfit/ScooterProfit";
import { ScooterAnswer, SCOOTER_ANSWER_DURATION } from "./videos/ScooterAnswer/ScooterAnswer";

// Every video lives in src/videos/<name>/ and is registered here.
const V = { width: 1080, height: 1920, fps: 30 } as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Test" component={Test} durationInFrames={TEST_DURATION} {...V} />
      <Composition id="ScooterProfit" component={ScooterProfit} durationInFrames={SCOOTER_PROFIT_DURATION} {...V} />
      <Composition id="ScooterAnswer" component={ScooterAnswer} durationInFrames={SCOOTER_ANSWER_DURATION} {...V} />
    </>
  );
};
