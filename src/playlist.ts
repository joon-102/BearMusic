import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { bugsService } from './services/bugsService';
import Add from './models/AddSchema';
import Trash from './models/TrashSchema';
import { program } from 'commander';

dotenv.config();

program
    .version('1.0.0')
    .description('Auto Create a YouTube Video')
    .option('-i, --interval <interval>', 'Set the interval for fetching data in seconds', '300') 
    .parse(process.argv);

const options = program.opts();
const interval = parseInt(options.interval, 10) * 1000;

(async () => {
    await mongoose.connect(String(process.env.MONGO_URI));

    const client = new bugsService();
    let previousData = await client.getNewestChart();

    console.log(`${interval}ms 마다 반복해서 차트 데이터를 가져옵니다.`)

    const fetchAndStoreNewData = async () => {
        console.log("새로운 차트 데이터를 가져오는 중...");
        const newData = await client.getNewestChart();
        const newItems = newData.filter(item => !previousData.some(oldItem => oldItem.trackId === item.trackId));

        for (let i = 0; i < newItems.length; i++) {
            const trackId = Number(newItems[i].trackId);

            const trackInfo = await client.getTrackInfo(trackId);
            const sinkLyrics = await client.getSinklyrics(trackId);
            const playList = await Add.findOne({ trackId: trackId });
            const trashList = await Trash.findOne({ trackId: trackId });

            if (playList) {
                console.log(`trackId ${trackId}가 playList에 이미 존재합니다. 건너뜁니다.`);
                continue;
            }

            if (trashList) {
                console.log(`trackId ${trackId}가 trash에 이미 존재합니다. 건너뜁니다.`);
                continue;
            }

            if (sinkLyrics === null) {
                console.log(`trackId ${trackId}에 대한 가사를 찾을 수 없습니다. 건너뜁니다.`);
                continue;
            }

            console.log(`trackId ${trackId}가 모든 체크를 통과했습니다. 데이터베이스에 추가 중...`);

            const addData = new Add({
                title: trackInfo.track,
                artist: trackInfo.artist,
                album: trackInfo.album,
                release: trackInfo.release,
                imgSrc: newItems[i].imgSrc,
                trackId: newItems[i].trackId,
                albumId: newItems[i].albumId,
                lyrics: sinkLyrics,
            });

            await addData.save();
            console.log(`trackId ${trackId}가 데이터베이스에 추가되었습니다.`);
        }

        previousData = newData;
        console.log("데이터 가져오기 완료.");
    };

    fetchAndStoreNewData();
    setInterval(fetchAndStoreNewData, interval);
})();
