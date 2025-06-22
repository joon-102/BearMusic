import "./index.css";
import { useEffect, useState } from 'react';
import { Composition, staticFile } from "remotion";
import { App } from "./Composition";

type SongInfo = {
  title: string;
  artist: string;
  album: string;
  RunningTime: number;
  lyrics: { appearAt: number; text: string }[];
};

export const RemotionRoot: React.FC = () => {
  const [songInfo, setSongInfo] = useState<SongInfo>();

  useEffect(() => {
    fetch(staticFile('song-info.json'))
      .then((res) => res.json())
      .then((data) => setSongInfo(data));
  }, []);

  if (!songInfo) return;

  return (
    <Composition
      id="MyComp"
      component={App}
      durationInFrames={30 * songInfo?.RunningTime}
      fps={30}
      width={2560}
      height={1440}
    />
  );
};
