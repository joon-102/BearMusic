import { bugsService } from './services/bugsService';
import { imageService } from './services/imageService';
import { audioService } from './services/audioService';
import { videoService } from './services/videoService';

import Add from './models/Add'
import Trash from './models/Trash'

import timers from 'node:timers/promises'
import * as YouTubeUploader from 'youtube-videos-uploader';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

class BearMusic {
    image: imageService;
    bugs: bugsService;
    audio: audioService;
    video: videoService;
    trackInfo?: { rawTrack: string; rawArtist: string; track: string; artist: string; trackId: number; albumId: number; album: string; release: string; imgSrc: string; };

    constructor() {
        this.image = new imageService();
        this.bugs = new bugsService(this);
        this.audio = new audioService();
        this.video = new videoService();
    }

    async debug(message: string) {
        console.debug("\x1b[32m%s\x1b[0m", `[ DEBUG ] ${message}`);
    }

    async system(message: string) {
        console.debug("\x1b[34m%s\x1b[0m", `[ SYSTEM ] ${message}`);
    }

    async uploadToYouTube(videoPath: string): Promise<{ code: string, path: string, error?: string }> {
        try {
            let isSuccess: boolean = false;
            const tag = "#" + ['가사', '베어뮤직', 'BearMusic', this.trackInfo?.rawTrack.replace(/[^a-zA-Z0-9가-힣\s]/g, ''), this.trackInfo?.rawArtist.replace(/[^a-zA-Z0-9가-힣\s]/g, ''), this.trackInfo?.album.replace(/[^a-zA-Z0-9가-힣\s]/g, '')].join('#');
            const video = [{
                path: videoPath,
                title: `${this.trackInfo?.rawTrack} - ${this.trackInfo?.rawArtist} | [가사/lyrics] `,
                description: `🎶 본 영상은 가사 자막 영상입니다, 수익 창출은 되지 않습니다.\n\n🎧 Title : ${this.trackInfo?.rawTrack.replace(/[^a-zA-Z0-9가-힣\s]/g, '')}\n🎤 Artist : ${this.trackInfo?.rawArtist}\n💿 Album : ${this.trackInfo?.album.replace(/[^a-zA-Z0-9가-힣\s]/g, '')}\n📅 Release : ${this.trackInfo?.release.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1년$2월$3일')}\n\n✨ Made by BearMusic\n\n${tag}`,
                language: 'korean',
                onSuccess: () => { isSuccess = true },
                skipProcessingWait: true,
                publishType: "PUBLIC",
                isNotForKid: true,
                uploadAsDraft: false,
            }];

            const upload = await (YouTubeUploader as any).upload({ email: process.env.GOODLE_ACCOUNT_EMAIL, pass: process.env.GOODLE_ACCOUNT_PASS }, video, { headless: false })
            if (isSuccess) {
                return { code: 'SUCCESS_VIDEO_UPLOAD', path: upload[0] }
            } else {
                return { code: 'ERR_VIDEO_UPLOAD', path: '', }
            }
        } catch (error) {
            return { code: 'ERR_VIDEO_UPLOAD', path: '', error: String(error) }
        }
    }

    async createVideoTrack(ALBUM_ID: number): Promise<{ code: string, path: string }> {
        this.debug("Launching BearMusic...")

        try {
            const trackInfo = await this.bugs.getTrackInfo(ALBUM_ID);
            if (trackInfo == null) return { code: 'ERR_TRACK_NOT_FOUND', path: '' }

            this.trackInfo = trackInfo;

            const Background: Buffer = await this.image.createBackgroundImage(trackInfo.imgSrc);
            this.debug(`  >> create background image`)
            const trackImg: Buffer = await this.image.addTrackInfo(await this.image.createAlbumImage(trackInfo.imgSrc, Background), trackInfo.track, trackInfo.artist, trackInfo.album)
            this.debug(`  >> create track image`)

            const Videoyt = await this.audio.getVideoyt(trackInfo.trackId);
            if (Videoyt == null) return { code: 'ERR_VIDEO_NOT_FOUND', path: '' }
            this.debug(`  >> https://www.youtube.com/watch?v=${Videoyt} - Find Track YouTube sound source`)

            await this.audio.downloadYouTubeAsMP3(Videoyt, `${trackInfo.track} - ${trackInfo.artist}`);
            this.debug(`  >> https://www.youtube.com/watch?v=${Videoyt} - Download YouTube sound source`)

            const sinklyrics = await this.bugs.getSinklyrics(trackInfo.trackId);
            if (sinklyrics == null) return { code: 'ERR_LYRICS_NOT_FOUND', path: '' }
            this.debug(`  >> Get Sink lyrics`)

            sinklyrics.unshift({ time: 0, lyrics: '● ● ●' });

            this.debug("Start creating a video...")
            const lyricsImage = await this.image.tempLyricsToImage(trackImg, sinklyrics);
            this.debug("  >> Successful creation of lyric image")
            const VideoWithoutAudio = await this.video.generateVideoWithoutAudio(lyricsImage.lyricsList)
            this.debug("  >> Successfully created a video without audio")

            this.debug("  >> Start audio synthesis...")
            await this.video.addAudioToVideo(VideoWithoutAudio, `${trackInfo.track} - ${trackInfo.artist}`)
            this.debug("Successful audio synthesis")

            VideoWithoutAudio.tempFile.removeCallback();
            lyricsImage.tempFile.forEach((element) => {
                element.removeCallback();
            });

            this.debug("BearMusic successfully launched")
            return { code: 'SUCCESS_VIDEO_CREATED', path: `out/${trackInfo.track} - ${trackInfo.artist}.mp4` }
        } catch (error) {
            console.error(error)
            return { code: 'ERR_VIDEO_NOT_GENERATION', path: `` }
        }
    }
}

(async () => {
    dotenv.config();
    mongoose.connect(String(process.env.MONGO_URI));

    const app = new BearMusic();

    const processLoop = async () => {
        let Timeout = 1000 * 60 * 30;

        try {
            const playlist = await Add.find().exec();

            if (playlist.length <= 0) {
                app.system("플레이리스트가 비어 있습니다. 1분 뒤 다시 시도합니다.");
                Timeout = 1000 * 60;
                return;
            }

            const track = Number(playlist[0].trackId);
            const video = await app.createVideoTrack(track);

            if (video.code === "ERR_VIDEO_NOT_GENERATION") {
                app.system("ERR 알 수 없는 이유로 비디오를 생성하지 못했습니다. 30분 뒤 다시 시도합니다.");
                Timeout = 1000 * 60 * 30;
                return;
            }

            if (video.code === "ERR_VIDEO_NOT_FOUND") {
                app.system("ERR YT 비디오를 찾지 못했습니다. 1분 뒤 다시 시도합니다.");
                Timeout = 1000 * 60;
                return;
            }

            if (video.code === "ERR_LYRICS_NOT_FOUND") {
                app.system("ERR 싱크 가사가 등록되어 있지 않습니다. 1분 뒤 다시 시도합니다.");
                Timeout = 1000 * 60;
                return;
            }

            if (video.code === "SUCCESS_VIDEO_CREATED") {
                app.system("비디오가 성공적으로 생성되었습니다.");

                const upload = await app.uploadToYouTube(video.path);

                if (upload.code === "ERR_VIDEO_UPLOAD") {
                    app.system("비디오를 업로드하지 못했습니다. 3시간 뒤 다시 시도합니다.");
                    Timeout = 1000 * 60 * 60 * 3;
                    return;
                }

                await Add.deleteMany({ trackId: app.trackInfo?.trackId });
                await new Trash({
                    title: app.trackInfo?.track,
                    artist: app.trackInfo?.rawArtist,
                    album: app.trackInfo?.album,
                    trackId: app.trackInfo?.trackId,
                }).save();

                app.system("비디오를 성공적으로 업로드 하였습니다. 1시간 뒤 프로세스를 반복합니다.");
                app.system(`업로드 정보\n🔗 Youtube : ${upload.path}\n🎧 Title : ${app.trackInfo?.rawTrack}\n🎤 Artist : ${app.trackInfo?.rawArtist}\n💿 Album : ${app.trackInfo?.album}\n📅 Release : ${app.trackInfo?.release.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1년$2월$3일")}`);
                Timeout = 1000 * 60 * 60;
            }
        } catch (error) {
            app.system(`예기치 않은 오류가 발생했습니다: ${error}. 30분 뒤 다시 시도합니다.`);
            Timeout = 1000 * 60 * 30;
        } finally {
            app.system(`다음 실행까지 ${Timeout / 1000 / 60}분 대기합니다.`);
            await timers.setTimeout(Timeout);
            processLoop();
        }
    };

    processLoop();
})();
