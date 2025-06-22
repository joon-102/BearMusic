import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, spring, Img } from "remotion";
import { useEffect, useState } from 'react';

type SongInfo = {
  title: string;
  artist: string;
  album: string;
  RunningTime: number;
  lyrics: { appearAt: number; text: string }[];
};

export const App = () => {
  const [songInfo, setSongInfo] = useState<SongInfo>();
  const { fps, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const delayFrame = Math.floor(fps * 1.2);

  useEffect(() => {
    fetch(staticFile('song-info.json'))
      .then((res) => res.json())
      .then((data) => setSongInfo(data));
  }, []);

  if (!songInfo) return;

  const currentIndex = songInfo.lyrics.findIndex((lyric, index) => {
    const start = delayFrame + lyric.appearAt * fps;
    const end = index < songInfo.lyrics.length - 1 ? delayFrame + songInfo.lyrics[index + 1].appearAt * fps : Infinity;
    return frame >= start && frame < end;
  });

  const getLyricText = (idx: number) => idx >= 0 && idx < songInfo.lyrics.length ? songInfo.lyrics[idx].text : "ㅤ";
  const prevLyrics = Array(4).fill(0).map((_, i) => getLyricText(currentIndex - 4 + i));
  const currentLyric = getLyricText(currentIndex);
  const nextLyrics = Array(4).fill(0).map((_, i) => getLyricText(currentIndex + 1 + i));

  return (
    <>
      {/* 음악 */}
      <Sequence from={delayFrame}>
        <Audio src={staticFile("audio.mp3")} />
      </Sequence>

      {/* 배경 이미지 */}
      <AbsoluteFill className="fixed inset-0">
        <Img
          className="absolute inset-0 w-full h-full object-cover"
          src={staticFile("album-cover.png")}
          style={{
            filter: 'blur(77px)',
            transform: 'scale(1.2)',
          }}
        />
        <div className="absolute inset-0 bg-black/10" style={{ opacity: 0.3 }} />
      </AbsoluteFill>

      {/* 배경 어두운 레이어 */}
      <AbsoluteFill className="absolute inset-0 bg-black/75" />

      {/* 인트로 */}
      <AbsoluteFill className="absolute inset-0 z-30 flex items-center justify-center bg-black/70" style={{ opacity: spring({ frame, fps, from: 1, to: 0, config: { damping: 100, stiffness: 50 }, delay: fps }) }}>

        <div className="absolute  bottom-16 text-white" style={{ opacity: spring({ frame, fps, from: 1, to: 0, config: { damping: 100, stiffness: 50 }, delay: fps }), }}>
          <div className="text-5xl font-bold text-white/80 tracking-wider">BEARMUSIC</div>
        </div>

        <div className="text-center">
          <Img src={staticFile("album-cover.png")} className="w-120 h-120 mx-auto rounded-2xl shadow-2xl mb-10 object-cover" />
          <h1 className="text-8xl font-bold text-white mb-4">{songInfo.title}</h1>
          <p className="text-5xl text-white/80 mb-2">{songInfo.artist}</p>
          <p className="text-4xl text-white/60">{songInfo.album}</p>
        </div>
      </AbsoluteFill>


      {/* 앨범 정보 */}
      <Sequence durationInFrames={durationInFrames - fps * 1}>
        <AbsoluteFill className="absolute top-[100px] left-[110px] z-20 text-white" style={{ opacity: spring({ frame, fps, from: 0, to: 1, delay: fps }) }}>
          <div>
            <p className="text-3xl mb-1.5">{songInfo.album}</p>
            <h1 className="text-6xl font-bold mb-4">{songInfo.artist} - {songInfo.title}</h1>
          </div>
          <div className="flex items-center gap-8">
            <Img src={staticFile("album-cover.png")} className="w-[1036px] h-[1036px] rounded-xl object-cover shadow-xl" />

          </div>
        </AbsoluteFill>
      </Sequence>


      <Sequence from={delayFrame} durationInFrames={durationInFrames - fps * 1 - delayFrame}>
        {/* 가사 영역 */}
        <AbsoluteFill className="relative w-[1155px] h-full left-[1228px]" style={{ opacity: spring({ frame, fps, from: 0, to: 1, delay: fps }), }}>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center,rgba(0,0,0,0) 40%,rgba(0,0,0,0.45) 90%),linear-gradient(to bottom,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.45) 100%)` }} />
        </AbsoluteFill>

        {/* 가사 텍스트 */}
        <AbsoluteFill className="absolute left-[1228px] w-[1155px] h-full flex items-center justify-center text-white z-40">
          <div className="text-center px-12 ">
            {/* 이전 가사들 */}
            {prevLyrics.map((lyric, i) =>
              lyric ? (
                <p key={`prev-${i}`} className={`text-7xl opacity-50 whitespace-nowrap ${["mb-13", "mb-13", "mb-13", "mb-8"][i]}`}>
                  {lyric}
                </p>
              ) : null
            )}
            {/* 현재 가사 */}
            {currentLyric && (
              <div className="relative w-[1155px] mx-auto">
                <div className="absolute inset-0 bg-black/55 z-10"></div>

                {currentLyric && (
                  <p className="text-7xl whitespace-nowrap relative z-20 text-center py-7.5">
                    {currentLyric}
                  </p>
                )}
              </div>
            )}
            {/* 다음 가사들 */}
            {nextLyrics.map((lyric, i) =>
              lyric ? (
                <p key={`next-${i}`} className={`text-7xl opacity-50 whitespace-nowrap ${["mt-8", "mt-13", "mt-13", "mt-13"][i]}`}>
                  {lyric}
                </p>
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

    </>
  );
};
