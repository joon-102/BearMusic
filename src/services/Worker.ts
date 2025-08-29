import axios from 'axios';
import timers from 'node:timers/promises'
import { exec } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import mm from 'music-metadata';
import { upload } from 'youtube-videos-uploader';

import pendingqueue from '../models/pendingQueue';
import historyQueue from '../models/historyQueue';

import { Finder } from '../services/Finder';
import { spawn } from 'node:child_process';

const execAsync = promisify(exec);

export async function startWorker() {
    let Timeout = 1000 * 60 * 60;

    try {
        const queue = await pendingqueue.find().exec();
        if (queue.length === 0) return (Timeout = 1000 * 60);

        const trackId = queue[0].trackId;

        const trackRes = await axios.get(`https://music.bugs.co.kr/player/track/${trackId}`);
        const lyricsRes = await axios.get(`https://music.bugs.co.kr/player/lyrics/T/${trackId}`);

        const albumId = String(trackRes.data.track.album_id);

        const title = trackRes.data.track.track_title;
        const artist = trackRes.data.track.artist_disp_nm;
        const album = trackRes.data.track.album_title;
        const release = trackRes.data.track.release_ymd;

        if (lyricsRes.data.lyrics === '') return (Timeout = 1000 * 60);

        const lyrics = lyricsRes.data.lyrics.split('＃').map((item: string) => {
            const [appearAt, text] = item.split('|');
            return { appearAt: parseFloat(appearAt), text };
        });

        const albumImgRes = await axios.get(`https://image.bugsm.co.kr/album/images/original/${albumId.slice(0, -2)}/${albumId}.jpg`, { responseType: 'arraybuffer' });
        const albumBuffer: Buffer = Buffer.from(albumImgRes.data, 'binary');

        await sharp(albumBuffer).toFile('public/album-cover.png');

        await execAsync('yarn run make-blurred', { cwd: process.cwd() });
        await execAsync('yarn run convert-webp', { cwd: process.cwd() });

        await pendingqueue.deleteMany({ trackId: trackId });
        await new historyQueue({
            identifier: queue[0].identifier,
            trackId: trackId
        }).save();

        const audio = await Finder(trackId, title, artist.replace(/\([^)]*\)/g, '').trim());

        if (!audio) {
            console.log('노래를 찾지 못했습니다. 1분 후 다시 실행합니다.');
            return Timeout = 1000 * 60;
        }

        const audioMeta: any = await mm.parseFile('public/audio.mp3');
        const audioTime: number = audioMeta.format.duration;

        const songInfo = {
            title: title.replace(/\([^)]*\)/g, '').replace("(", "").replace(")", "").trim(),
            artist: artist.replace(/\([^)]*\)/g, '').trim(),
            album: album.trim(),
            runningTime: Math.floor(audioTime),
            lyrics: lyrics,
        }

        await writeFile('public/song-info.json', JSON.stringify(songInfo, null, 2), 'utf-8');

        await new Promise((resolve, reject) => {
            const child = spawn('npx', ['remotion', 'render', 'remotion/index.ts'], { cwd: process.cwd(), shell: true });

            child.stdout.on('data', (data) => process.stdout.write(data.toString()));
            child.stderr.on('data', (data) => process.stderr.write(data.toString()));

            child.on('close', (code) => {
                if (code === 0) resolve(code);
                else reject(new Error(`Remotion 렌더링 실패 (종료 코드 ${code})`));
            });
        });

        let isSuccess = false;
        const credentials = {
            email: String(process.env.GOODLE_ACCOUNT_EMAIL),
            pass: String(process.env.GOODLE_ACCOUNT_PASS),
        };

        const formattedReleaseDate = String(release).replace(
            /^(\d{4})(\d{2})(\d{2})$/,
            '$1년 $2월 $3일'
        );

        const videoOptions: any = [{
            path: 'out/Composition.mp4',
            title: `${artist.replace(/\([^)]*\)/g, '').trim()} - ${title.replace(/\([^)]*\)/g, '').replace("(", "").replace(")", "").trim()} [${album}]ㅣ가사/Lyrics`,
            description: [
                `🎶 본 영상은 가사 자막 영상입니다, 수익 창출은 되지 않습니다.`,
                ``,
                `🎧 Title : ${title}`,
                `🎤 Artist : ${artist}`,
                `💿 Album : ${album}`,
                `📅 Release : ${formattedReleaseDate}`,
                ``,
                `👨‍💻 Developed by Taejeong Kim`,
                `GitHub: https://bit.ly/4lUBwVQ`,
                ``,
                `📝 영상 피드백을 받고 있습니다!`,
                `Forms: https://bit.ly/46duNSf`,
                ``,
                `#${artist.replace(/\([^)]*\)/g, '').trim()} #${title.replace(/\([^)]*\)/g, '').replace("(", "").replace(")", "").trim().replace(" ","")} #가사`
            ].join('\n'),
            language: 'korean',
            skipProcessingWait: true,
            publishType: "PUBLIC",
            isNotForKid: true,
            uploadAsDraft: false,
            onSuccess: () => {
                console.log('[Upload] YouTube 업로드 성공!');
                console.log('[Upload] 업로드된 동영상 정보:');
                console.log(`[Upload] - 제목: ${title}`);
                console.log(`[Upload] - 앨범: ${album}`);
                console.log(`[Upload] - 아티스트: ${artist}`);
                console.log(`[Upload] - 발매일: ${formattedReleaseDate}`);
                isSuccess = true;
            }
        }];

        try {
            await upload(credentials, videoOptions, { headless: false });
        } catch {
            console.log("[Upload] YouTube 업로드 실패, 1시간 후 다시 실행합니다")
            return Timeout = 1000 * 60 * 1;
        }

        if (isSuccess) {
            console.log("[Upload] 영상 업로드 성공, 2시간 후 다시 실행합니다")
            return Timeout = 1000 * 60 * 60 * 2;
        }
    } catch (error) {
        console.log(`예기치 않은 오류가 발생했습니다: ${error}. 30분 뒤 다시 시도합니다.`);
        return Timeout = 1000 * 60 * 30;
    } finally {
        console.log(`다음 작업은 ${Timeout / 1000 / 60}분 후에 실행됩니다.`);
        await timers.setTimeout(Timeout);
        startWorker()
    }
}
