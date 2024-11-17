import { bugsService } from './services/bugsService';
import { imageService } from './services/imageService';
import { audioService } from './services/audioService';
import { videoService } from './services/videoService';
import * as dotenv from 'dotenv';

class BearMusic {
    image: imageService;
    bugs: bugsService;
    audio: audioService;
    video: videoService;
    trackInfo?: { track: string; artist: string; trackId: number; albumId: number; album: string; release: string; imgSrc: string };

    constructor() {
        this.image = new imageService();
        this.bugs = new bugsService();
        this.audio = new audioService();
        this.video = new videoService();
    }

    async createVideoTrack(ALBUM_ID: number): Promise<{ code: string, path: string }> {
        console.debug("Launching BearMusic...")
        const trackInfo = await this.bugs.getTrackInfo(ALBUM_ID);
        if (trackInfo == null) return { code: 'ERR_TRACK_NOT_FOUND', path: '' }

        const Background: Buffer = await this.image.createBackgroundImage(trackInfo.imgSrc);
        console.debug(`  >> create background image`)
        const trackImg: Buffer = await this.image.addTrackInfo(await this.image.createAlbumImage(trackInfo.imgSrc, Background), trackInfo.track, trackInfo.artist, trackInfo.album)
        console.debug(`  >> create track image`)

        const Videoyt = await this.audio.getVideoyt(trackInfo.trackId);
        if (Videoyt == null) return { code: 'ERR_VIDEO_NOT_FOUND', path: '' }
        console.debug(`  >> https://www.youtube.com/watch?v=${Videoyt} - Find Track YouTube sound source`)

        await this.audio.downloadYouTubeAsMP3(Videoyt, `${trackInfo.track} - ${trackInfo.artist}`);
        console.debug(`  >> https://www.youtube.com/watch?v=${Videoyt} - Download YouTube sound source`)

        const sinklyrics = await this.bugs.getSinklyrics(trackInfo.trackId);
        if (sinklyrics == null) return { code: 'ERR_LYRICS_NOT_FOUND', path: '' }
        console.debug(`  >> Get Sink lyrics`)

        sinklyrics.unshift({ time: 0, lyrics: '● ● ●' });

        console.debug("Start creating a video...")
        const lyricsImage = await this.image.tempLyricsToImage(trackImg, sinklyrics);
        console.debug(" >> Successful creation of lyric image")
        const VideoWithoutAudio = await this.video.generateVideoWithoutAudio(lyricsImage.lyricsList)
        console.debug(" >> Successfully created a video without audio")

        console.debug(" >> Start audio synthesis...")
        await this.video.addAudioToVideo(VideoWithoutAudio, `${trackInfo.track} - ${trackInfo.artist}`)
        console.log("Successful audio synthesis")

        VideoWithoutAudio.tempFile.removeCallback();
        lyricsImage.tempFile.forEach((element) => {
            element.removeCallback();
        });

        console.debug("BearMusic successfully launched")
        return { code: 'SUCCESS_VIDEO_CREATED', path: `out/${trackInfo.track} - ${trackInfo.artist}.mp4` }
    }
}

(async () => {
    dotenv.config();
    const app = new BearMusic()

    await app.createVideoTrack(31548135)
})();
