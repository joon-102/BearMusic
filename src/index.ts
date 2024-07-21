import { getPreview, getLyrics } from './util/getSpotify';
import { applyBlur } from './util/imageProcessor';

const config = require('../config.json');

(async () => {
    const Spotify_Search = await getPreview(config)
   
    // console.log(Spotify_Search)

    console.info(`노래를 찾았습니다. : ${Spotify_Search.artist} - ${Spotify_Search.title}`)

    const Lyrics_Find = await getLyrics(config)

    // console.log(Lyrics_Find)

    const Thumbnail_Blur = await applyBlur(config, Spotify_Search.image , Spotify_Search )



})();