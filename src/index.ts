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

    async createVideoTrack(ALBUM_ID : number) : Promise<{ code : string , path : string }> {
        const trackInfo = await this.bugs.getTrackInfo(ALBUM_ID);
        if (trackInfo == null) return { code : 'ERR_TRACK_NOT_FOUND' , path : '' }

        const Background: Buffer = await this.image.createBackgroundImage(trackInfo.imgSrc);
        const trackImg: Buffer = await this.image.addTrackInfo(await this.image.createAlbumImage(trackInfo.imgSrc, Background), trackInfo.track, trackInfo.artist, trackInfo.album)

        const Videoyt = await this.audio.getVideoyt(trackInfo.trackId);
        if (Videoyt == null) return { code : 'ERR_VIDEO_NOT_FOUND' , path : '' }

        await this.audio.downloadYouTubeAsMP3(Videoyt, `${trackInfo.track} - ${trackInfo.artist}`);

        const sinklyrics = await this.bugs.getSinklyrics(trackInfo.trackId);
        if (sinklyrics == null) return { code : 'ERR_LYRICS_NOT_FOUND' , path : '' }

        sinklyrics.unshift({ time: 0, lyrics: '● ● ●' });

        const lyricsImage = await this.image.tempLyricsToImage(trackImg, sinklyrics);

        const VideoWithoutAudio = await this.video.generateVideoWithoutAudio(lyricsImage.lyricsList)

        await this.video.addAudioToVideo(VideoWithoutAudio, `${trackInfo.track} - ${trackInfo.artist}`)

        VideoWithoutAudio.tempFile.removeCallback();
        lyricsImage.tempFile.forEach((element) => {
            element.removeCallback();
        });

        return { code : 'SUCCESS_VIDEO_CREATED' , path : `out/${trackInfo.track} - ${trackInfo.artist}.mp4` }
    }
}

(async () => {
    dotenv.config();
    const app = new BearMusic()

    await app.createVideoTrack(32660867)

})();
