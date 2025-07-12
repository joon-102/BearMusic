import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate, Img } from "remotion";
import { useMemo } from "react";

import Background from "./components/Background";
import AlbumInfo from "./components/AlbumInfo";
import LyricsArea from "./components/LyricsArea";

export const App = (songInfo: { title: string; artist: string; album: string; runningTime: number; lyrics: { appearAt: number; text: string }[] }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const delayFrame = Math.floor(fps * 1.2);
  const frame = useCurrentFrame();

  const currentIndex = useMemo(() => {
    if (!songInfo.lyrics?.length) return -1;
    const currentTime = (frame - delayFrame) / fps;
    for (let i = 0; i < songInfo.lyrics.length; i++) {
      const appearAt = songInfo.lyrics[i].appearAt;
      const nextAppearAt = songInfo.lyrics[i + 1]?.appearAt ?? Infinity;
      if (currentTime >= appearAt && currentTime < nextAppearAt) return i;
    }
    return -1;
  }, [frame, delayFrame, fps, songInfo.lyrics]);

  const { currentLyric, prevLyrics, nextLyrics } = useMemo(() => {
    const getText = (idx: number) => idx >= 0 && idx < songInfo.lyrics.length ? songInfo.lyrics[idx].text : "ㅤ";

    return {
      currentLyric: getText(currentIndex),
      prevLyrics: Array.from({ length: 4 }, (_, i) => getText(currentIndex - 4 + i)),
      nextLyrics: Array.from({ length: 4 }, (_, i) => getText(currentIndex + 1 + i)),
    };
  }, [currentIndex, songInfo.lyrics]);

  const currentOpacity = useMemo(() => {
    return interpolate(
      frame - (delayFrame + songInfo.lyrics[currentIndex]?.appearAt * fps),
      [0, 5],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }, [frame, currentIndex, songInfo.lyrics, fps, delayFrame]);

  const introOpacity = useMemo(() => spring({
    frame,
    fps,
    from: 1,
    to: 0,
    config: { damping: 100, stiffness: 50 },
    delay: fps,
  }), [frame, fps]);

  return (
    <AbsoluteFill style={{ fontFamily: "PyeojinGothic-Bold" }}>

      <Sequence from={delayFrame}>
        <Audio src={staticFile("audio.mp3")} />
      </Sequence>

      <Background />
      <AbsoluteFill className="absolute inset-0 bg-black/75" />

      {/* 인트로 */}
      <AbsoluteFill className="absolute inset-0 z-30 flex items-center justify-center bg-black/70" style={{ opacity: introOpacity }}>
        <div className="absolute  bottom-16 text-white" >
          <div className="text-5xl font-bold text-white/80 tracking-wider">BEARMUSIC</div>
        </div>

        <div className="text-center">
          <Img src={staticFile("dist/album-cover.webp")} className="w-120 h-120 mx-auto rounded-2xl shadow-2xl mb-10 object-cover" />
          <h1 className="text-8xl font-bold text-white mb-4">{songInfo.title}</h1>
          <p className="text-5xl text-white/80 mb-2">{songInfo.artist}</p>
          <p className="text-4xl text-white/60">{songInfo.album}</p>
        </div>
      </AbsoluteFill>

      {/* 앨범 정보 */}
      <Sequence durationInFrames={durationInFrames - fps * 1}>
        <AlbumInfo album={songInfo.album} artist={songInfo.artist} title={songInfo.title} fps={fps} frame={frame} />
      </Sequence>

      <Sequence from={delayFrame} durationInFrames={durationInFrames - fps - delayFrame}>
        <LyricsArea fps={fps} frame={frame} />

        <AbsoluteFill
          className="absolute left-[1228px] w-[1155px] h-full flex items-center justify-center text-white z-40"
          style={{ fontFamily: "PyeojinGothic-SemiBold" }}
        >
          <div className="text-center px-12">
            {/* 이전 가사 */}
            {prevLyrics.map((lyric, i) =>
              lyric?.trim() ? (
                <div className="relative w-[1155px] mx-auto">
                  <p
                    key={`prev-${i}`}
                    className={`overflow-hidden font-normal text-7xl   ${["mb-13 opacity-10", "mb-13 opacity-20", "mb-13 opacity-30", "mb-8 opacity-40"][i]
                      }`}
                  >
                    {lyric}
                  </p>
                </div>
              ) : null
            )}

            {/* 현재 가사 */}
            {currentLyric?.trim() && (
              <div className="relative w-[1155px] mx-auto">
                <div className="absolute inset-0 bg-black/55 z-10"></div>
                <p
                  className="text-7xl overflow-hidden  break-normal relative z-20 text-center py-7.5"
                  style={{
                    opacity: currentOpacity
                  }}
                >
                  {currentLyric}
                </p>
              </div>
            )}

            {/* 다음 가사 */}
            {nextLyrics.map((lyric, i) =>
              lyric?.trim() ? (
                <div className="relative w-[1155px] mx-auto">
                  <p
                    key={`next-${i}`}
                    className={`overflow-hidden text-7xl break-normal ${["opacity-40 mt-8", "opacity-30 mt-13", "opacity-20 mt-13", "opacity-10 mt-13"][i]
                      }`}
                  >
                    {lyric}
                  </p>
                </div>
              ) : null
            )}
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={durationInFrames - fps} durationInFrames={durationInFrames}>
        <AbsoluteFill className="absolute inset-0 z-30 flex items-center justify-center bg-black/70" style={{ opacity: spring({ frame, fps, from: 0, to: 1, config: { damping: 100, stiffness: 50 }, delay: 0 }) }}>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
            <div className="text-7xl font-bold text-white/80 tracking-wider">BEARMUSIC</div>
            <div className="text-4xl text-white/60">Thanks for watching</div>
          </div>

        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};
