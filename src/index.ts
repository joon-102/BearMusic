import { fetchTrackPreview, getLyrics, getMp3 } from './util/getSpotify.js';
import { BasicImage, LyricsImage } from './util/imageProcessor.js';
import { VideoCreation } from './util/videoProcessor.js';

const generateFixedValue = require('../generateFixedValue.json');
const config = require('../config.json');

(async () => {
    // 생성 리스트 불러오기
    for (let index: number = 0; index < config.TrackList.length; index++) {
        await Run(generateFixedValue, config, index);
    }
})();

async function Run(generateFixedValue: any, config: any, index: number): Promise<void> {
    let Search = await fetchTrackPreview(config.TrackList[index].trackId, "ko");
    let Lyrics = await getLyrics(config, index);

    if (config.TrackList[index].title != "") {
        Search.title = config.TrackList[index].title;
    }

    if (config.TrackList[index].artist != "") {
        Search.artist = config.TrackList[index].artist;
    }

    await BasicImage(generateFixedValue, Search);
    await LyricsImage(generateFixedValue, Lyrics.lines, Search.artist);
    await getMp3(config.TrackList[index].trackId);
    await VideoCreation(Lyrics.lines, Search);

    let Search_en = await fetchTrackPreview(config.TrackList[index].trackId, "en");
    console.log("\n비디오 생성이 완료되었습니다\n")
    console.table({
        "곡정보": `${Search.title} - ${Search.artist}`,
        "영문": `${Search_en.title} - ${Search_en.artist}`,
        "업로드": `${Search.title}(${Search_en.title}) - ${Search.artist}(${Search_en.artist})  [가사/lyrics]`,
    });
}