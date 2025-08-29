import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import { load } from 'cheerio'

dotenv.config();

const historyQueue = mongoose.model("historyQueue", new mongoose.Schema(
    {
        identifier: { type: String, required: true },
        trackId: { type: String, required: true },
    }
));

const pendingQueues = mongoose.model("pendingqueues", new mongoose.Schema(
    {
        identifier: { type: String, required: true },
        trackId: { type: String, required: true },
    }
));

const INTERVAL = 1000 * 60 * 60 * 10; // 10 hours

(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    let Queue = [];

    console.log(`${INTERVAL / 1000}초 마다 차트 데이터를 가져옵니다.`);

    async function Run() {
        console.log("새로운 차트 데이터를 가져오는 중...");

        const types = ["nb", "nfa", "nindie", "nrs"];
        const results = await Promise.all(types.map(type => getChart(type)));
        let newQueue = results.flat();

        newQueue = newQueue.filter(
            (item, index, self) =>
                index === self.findIndex(t => t.trackId === item.trackId)
        );

        const newItems = newQueue.filter(
            item => !Queue.some(oldItem => oldItem.trackId === item.trackId)
        );

        for (const item of newItems) {
            const trackId = Number(item.trackId);

            const HistoryQueue = await historyQueue.findOne({ trackId });
            const trashList = await pendingQueues.findOne({ trackId });

            if (HistoryQueue || trashList) {
                console.log(`trackId ${trackId}는 이미 ${HistoryQueue ? 'HistoryQueue' : 'PendingQueues'}에 존재합니다.`);
                continue;
            }

            const trackInfo = await getTrackInfo(trackId);
            const lyrics = await getSinklyrics(trackId);

            if (!lyrics) {
                console.log(`trackId ${trackInfo.track}의 가사를 찾을 수 없습니다.`);
                continue;
            }

            console.log(`trackId ${trackId} 추가 중...`);
            const addData = new pendingQueues({
                identifier: `${trackInfo.artist} - ${trackInfo.track} [${trackInfo.album}]`,
                trackId: item.trackId,
            });

            await addData.save();
            console.log(`trackId ${trackId} 데이터베이스에 추가됨.`);
        }

        Queue = newQueue;
        console.log("데이터 업데이트 완료.");
    };

    Run();
    setInterval(Run, INTERVAL);
})();

const getChart = async (type = "nrs") => {
    const trackRes = await axios.get(`https://music.bugs.co.kr/chart/track/day/${type}`);
    const $ = load(trackRes.data);

    const tracks = [];

    $('#CHARTday > table > tbody > tr').each((_, el) => {
        const $el = $(el);

        const title = $el.find('.title a').text().trim();
        const artist = $el.find('.artist a').text().trim();
        if (!title || !artist) return;

        const trackHref = $el.find('.trackInfo').attr('href') ?? '';
        const artistHref = $el.find('.artist a').attr('href') ?? '';
        const albumHref = $el.find('td:nth-child(9) > a').attr('href') ?? '';
        const imgSrcRaw = $el.find('.thumbnail img').attr('src') ?? '';

        const trackId = trackHref.split('/track/')[1]?.split('?')[0];
        const artistId = artistHref.split('/artist/')[1]?.split('?')[0];
        const albumId = albumHref.split('/album/')[1]?.split('?')[0];
        const imgSrc = imgSrcRaw.replace('50', 'original').split('?')[0];

        tracks.push({ title, artist, trackId, artistId, imgSrc, albumId });
    });

    return tracks.slice(0, 100);
};


const getSinklyrics = async (trackId) => {
    const response = await axios.get(`https://music.bugs.co.kr/player/lyrics/T/${trackId}`);
    if (!response.data.lyrics) return null;

    return response.data.lyrics.split('＃').map(item => {
        const [time, lyrics] = item.split('|');
        return { time: parseFloat(time), lyrics };
    });
};

const getTrackInfo = async (trackId) => {
    const response = await axios.get(`https://music.bugs.co.kr/player/track/${trackId}`);
    return {
        track: response.data.track.track_title,
        artist: response.data.track.artist_disp_nm,
        album: response.data.track.album_title,
        release: response.data.track.release_ymd
    };
};