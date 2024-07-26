import { getPreview, getLyrics, getMp3  } from './util/getSpotify';
import { BasicImage, LyricsImage } from './util/imageProcessor';
import { VideoCreation } from './util/videoProcessor';
import fs from 'fs-extra';

const config = require('../config.json');

(async () => {
    await fs.emptyDirSync('temp/lyrics');

    const Spotify_Search = await getPreview(config);
    console.info(`트랙를 찾았습니다. : ${Spotify_Search.title} - ${Spotify_Search.artist}`);
    const Lyrics_Find = await getLyrics(config);
    await BasicImage(config, Spotify_Search);
    await LyricsImage(config, Lyrics_Find.lines)
    await getMp3(config)
    await VideoCreation(config , Lyrics_Find.lines)
})();