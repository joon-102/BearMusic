const { Command } = require('commander');
const mongoose = require('mongoose');
const spotify = require('spotify-url-info');
const fetch = require('node-fetch');

const config = require('../config.json');

const TrackModel = mongoose.model("Track", new mongoose.Schema({ track: String }));
const UseModel = mongoose.model("UseTrack", new mongoose.Schema({ track: String }));
const program = new Command();

program
    .version('1.0.0')
    .description('Auto Create a youtube video')
    .option('-track, --track <string>', 'Please enter your Storyify track ID.')
    .option('-del, --del <string>', 'Please enter the track ID you want to delete.')
    .parse(process.argv);

const { track, del } = program.opts();


(async () => {
    await connectToDatabase();

    if (track) {
        let TrackID;
        
        try {
            const urlObj = new URL(track);

            let pathname = urlObj.pathname;
            pathname = pathname.replace('/track/', '/');
            urlObj.pathname = pathname;
            urlObj.searchParams.delete('si');


            TrackID = urlObj.pathname.substring(1);
        } catch (error) {
            console.log('You must enter a URL.')
            process.exit(1);
        }

        const TrackFind = await TrackModel.findOne({ track: TrackID });

        if (TrackFind) {
            console.log('The song is already registered.')
            process.exit(1);
        }

        let Track = await spotify(fetch).getPreview(track, { headers: { 'Accept-Language': `ko` } })

        console.log(`${Track.title} - ${Track.artist}, A song has been added.`)

        await new TrackModel({ track: TrackID }).save();
        process.exit(1);
    } else if (del) {
        await new UseModel({ track: del }).save();
        console.log(`${del}, All tracks have been deleted.`)
        process.exit(1);
    } else {
        const PlayList = await TrackModel.find().exec();

        if (PlayList.length == 0) {
            console.log('Playlist does not exist.');
            process.exit(1);
        }

        console.log('----------------LIST----------------');
        for (let index = 0; index < PlayList.length; index++) {
            const Track = await spotify(fetch).getPreview(`https://open.spotify.com/track/${PlayList[index].track}`, { headers: { 'Accept-Language': `ko` } })
            console.log(`${index + 1} . ${Track.title} - ${Track.artist}`)
        }
        console.log('------------------------------------');
        process.exit(1);
    }
})();

async function connectToDatabase() {
    mongoose.set("strictQuery", false);
    try {
        await mongoose.connect(config.mongo);
    } catch (error) {
        console.info(`mongoose connect Error : ${error}`);
    }
}
