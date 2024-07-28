import { getPreview, getLyrics, getMp3 } from './util/getSpotify';
import { BasicImage, LyricsImage } from './util/imageProcessor';
import { VideoCreation } from './util/videoProcessor';
import fs from 'fs-extra';

let config = require('../config.json');

(async () => {
    for (let index = 0; index < config.TrackList.length; index++) {
        const track = config.TrackList[index];
        config.TrackId = track.trackid;
        await Run(config, track);
    }
})();

async function Run(config: any, track: any): Promise<void> {
    await fs.emptyDirSync('temp/lyrics');

    let Spotify_Search = await getPreview(config);

    if (track.title != "") {
        Spotify_Search[0].title = track.title;
    }

    if (track.artist != "") {
        Spotify_Search[0].artist = track.artist;
    }

    Spotify_Search[0].title = Spotify_Search[0].title.replace(/\([^)]*\)/g, '');

    console.info(`트랙를 찾았습니다. : ${Spotify_Search[0].title} - ${Spotify_Search[0].artist}`);
    console.log(`영문 | ${Spotify_Search[1].title} - ${Spotify_Search[1].artist} [가사/lyrics]\n`)
    const Lyrics_Find: any = await getLyrics(config);
    await BasicImage(config, Spotify_Search[0]);
    await LyricsImage(config, Lyrics_Find.lines);
    await getMp3(config);
    await VideoCreation(config, Lyrics_Find.lines, Spotify_Search[0]);
}