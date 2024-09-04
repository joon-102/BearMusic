import { fetchTrackPreview, getLyrics, getMp3 } from './util/getSpotify.js';
import { BasicImage, LyricsImage } from './util/imageProcessor.js';
import { VideoCreation } from './util/videoProcessor.js';
import { Videoupload } from './uploade'

import { Command } from 'commander';

const generateFixedValue = require('../generateFixedValue.json');
const config = require('../config.json');

const program = new Command();

program
    .version('1.0.0')
    .description('Create a youtube video')
    .option('-track, --track <string>', 'Please enter your Storyify track ID.')
    .option('-title, --title <string>', 'You can forcefully change song notation information.')
    .option('-artist, --artist <string>', 'You can forcefully change song notation information.')
    .parse(process.argv);

const { track, title, artist } = program.opts();

if (track === undefined || track < 0) {
    console.error('Invalid or missing index. Please provide a valid index within the range.');
    process.exit(1);
}

(async () => {
    await Run(generateFixedValue, config, track, title, artist);
})();

async function Run(generateFixedValue: any, config: any, track: any, title: any, artist: any): Promise<void> {
    let Search = await fetchTrackPreview(track, "ko");
    console.info(`트랙를 찾았습니다. : ${Search.title} - ${Search.artist}`);

    if(Search.title.length > 20) {
        throw new Error('글자수가 너무 깁니다.')
    }

    let Lyrics = await getLyrics(config, track);

    if (title) { Search.title = title; }
    if (artist) { Search.artist = artist; }

    await BasicImage(generateFixedValue, Search);
    await LyricsImage(generateFixedValue, Lyrics.lines);
    await getMp3(track);
    await VideoCreation(Lyrics.lines, Search);

    const Search_en = await fetchTrackPreview(track, "en");
    await Videoupload(config, { ko: Search, en: Search_en }, track);
};
