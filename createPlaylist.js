const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const cheerio = require('cheerio');

const Add = mongoose.model("Add", new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    release: { type: String, required: true },
    imgSrc: { type: String, required: true },
    trackId: { type: String, required: true },
    albumId: { type: String, required: true },
    lyrics: [
        { time: { type: Number, required: true }, lyrics: { type: String, required: true } }
    ]
}));

const Trash = mongoose.model("Trash", new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    album: { type: String, required: true },
    trackId: { type: String, required: true }
}));

dotenv.config();

const INTERVAL = 120000;

(async () => {

    await mongoose.connect(process.env.MONGO_URI);
    let previousData = await getNewestChart();

    console.log(`${INTERVAL / 1000}초 마다 차트 데이터를 가져옵니다.`);

    const fetchAndStoreNewData = async () => {
        console.log("새로운 차트 데이터를 가져오는 중...");
        const newData = await getNewestChart();
        const newItems = newData.filter(item => !previousData.some(oldItem => oldItem.trackId === item.trackId));

        for (const item of newItems) {
            const trackId = Number(item.trackId);

            const playList = await Add.findOne({ trackId });
            const trashList = await Trash.findOne({ trackId });

            if (playList || trashList) {
                console.log(`trackId ${trackId}는 이미 ${playList ? 'Playlist' : 'Trash'}에 존재합니다.`);
                continue;
            }

            const trackInfo = await getTrackInfo(trackId);
            const lyrics = await getSinklyrics(trackId);

            if (!lyrics) {
                console.log(`trackId ${trackId}의 가사를 찾을 수 없습니다.`);
                continue;
            }

            console.log(`trackId ${trackId} 추가 중...`);
            const addData = new Add({
                title: trackInfo.track,
                artist: trackInfo.artist,
                album: trackInfo.album,
                release: trackInfo.release,
                imgSrc: item.imgSrc,
                trackId: item.trackId,
                albumId: item.albumId,
                lyrics
            });

            await addData.save();
            console.log(`trackId ${trackId} 데이터베이스에 추가됨.`);
        }

        previousData = newData;
        console.log("데이터 업데이트 완료.");
    };

    fetchAndStoreNewData();
    setInterval(fetchAndStoreNewData, INTERVAL);
})();

const getNewestChart = async () => {
    const response = await axios.get('https://music.bugs.co.kr/newest/track/totalpicked?nation=ALL');
    const $ = cheerio.load(response.data);
    const tracks = [];

    $('#GENREtotalpicked > table > tbody > tr').each((_, element) => {
        const title = $(element).find('.title a').text().trim();
        const artist = $(element).find('.artist a').text().trim();
        const trackId = $(element).find('.trackInfo').attr('href')?.replace("https://music.bugs.co.kr/track/", "").split("?")[0];
        const artistId = $(element).find('.artist a').attr('href')?.replace("https://music.bugs.co.kr/artist/", "").split("?")[0];
        const imgSrc = $(element).find('.thumbnail img').attr('src')?.replace("50", "original").split("?")[0];
        const albumId = $(element).find('td:nth-child(8) > a').attr('href')?.replace("https://music.bugs.co.kr/album/", "").split("?")[0];

        if (title && artist) {
            tracks.push({ title, artist, trackId, artistId, imgSrc, albumId });
        }
    });

    return tracks;
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
        track: response.data.track.track_title.replace(/\([^()]*\)/g, '').trim(),
        artist: response.data.track.artist_disp_nm.replace(/\([^()]*\)/g, '').trim(),
        album: response.data.track.album_title.replace(/\([^()]*\)/g, '').trim(),
        release: response.data.track.release_ymd
    };
};
