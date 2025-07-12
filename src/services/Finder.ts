import tmp from 'tmp-promise';

import { downloadYoutubeAudio, searchYoutubeVideos, searchYoutubeDescription, reencodeFirstMinute, convertToWavTmp, compareFingerprint } from '../lib/audio';
import { downloadSampleAudio } from '../lib/scraper';

export async function Finder(trackId: string, title: string, artist: string): Promise<boolean> {
  const videoRes = await searchYoutubeVideos(artist, title);

  console.log(`[audio] 음원 찿는 중 : ${title.replace(/\(.*?\)/g, '').trim()} - ${artist}`);

  let searchVideos: { id: string; channel: string; description: string }[] = [];

  for (const video of videoRes) {
    try {
      const { id, channel, description }: any = await searchYoutubeDescription(video.id);
      if (!id) continue;
      if (description.includes("Auto-generated")) {
        searchVideos.push({ id, channel, description });
      }
    } catch { }
  }

  const normalizedArtist = artist.replace(/\(.*?\)/g, "").trim();
  const matchIndex = searchVideos.findIndex(video => video.channel.includes(normalizedArtist));
  if (matchIndex > 0) {
    const [matched] = searchVideos.splice(matchIndex, 1);
    searchVideos.unshift(matched);
  }

  if (!searchVideos.length) return false;

  console.log(`[audio] 음원 검색 완료 : https://www.youtube.com/watch?v=${searchVideos[0].id}`);

  const AudioA = await tmp.file({ postfix: '.wav' });
  const AudioB = await tmp.file({ postfix: '.wav' });

  await downloadYoutubeAudio(searchVideos[0].id)
  await downloadSampleAudio(trackId, AudioA);
  await reencodeFirstMinute('public/audio.mp3', AudioB.path);

  console.log(`[audio] 비교 원본 음원 다운로드 완료`);

  const wavA = await convertToWavTmp(AudioA.path);
  const wavB = await convertToWavTmp(AudioA.path);

  const similarity = await compareFingerprint(wavA, wavB);

  console.log(`[audio] 오디오 유사도 (fpcalc): ${similarity.toFixed(2)}%`);
  return similarity > 90;
}
