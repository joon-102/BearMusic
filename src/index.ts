import { getPreview, getLyrics, getMp3 } from './util/getSpotify';
import { BasicImage, LyricsImage } from './util/imageProcessor';
import { VideoCreation } from './util/videoProcessor';
import fs from 'fs-extra';

let config = require('../config.json');

(async () => {
    for (let index = 0; index < config.TrackList.length; index++) {
        config.TrackId = config.TrackList[index];
        await Run(config);
    }
})();

async function Run(config: any) : Promise<void> {
    await fs.emptyDirSync('temp/lyrics');

    const Spotify_Search = await getPreview(config);
    console.info(`트랙를 찾았습니다. : ${Spotify_Search[0].title} - ${Spotify_Search[0].artist}`);
    console.log(`영문 | ${Spotify_Search[1].title} - ${Spotify_Search[1].artist} [가사/lyrics]\n`)

    const Lyrics_Find : any = await getLyrics(config);
    await BasicImage(config, Spotify_Search[0]);
    await LyricsImage(config, Lyrics_Find.lines);
    await getMp3(config);
    await VideoCreation(config, Lyrics_Find.lines);
}