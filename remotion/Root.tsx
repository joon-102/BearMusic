import { Composition  } from "remotion";
import { App } from "./App";
import "./index.css";

import songInfo from '../public/song-info.json';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Composition"
      component={App}
      durationInFrames={20 * songInfo.runningTime}
      fps={20}
      width={2560}
      height={1440}
      defaultProps={songInfo}
    />
  );
};


