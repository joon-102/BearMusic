import { bugsService } from './services/bugsService';
import { imageService } from './services/imageService';
import { audioService } from './services/audioService';
import { videoService } from './services/videoService';
import * as dotenv from 'dotenv';

(async () => {
    dotenv.config();

    const image = new imageService();
    const bugs = new bugsService();
    const audio = new audioService();
    const video = new videoService();

    const trackInfo = await bugs.getTrackInfo(32660867);

    const Background: Buffer = await image.createBackgroundImage(trackInfo.imgSrc);
    const trackImg: Buffer = await image.addTrackInfo(await image.createAlbumImage(trackInfo.imgSrc, Background), trackInfo.track, trackInfo.artist, trackInfo.album)

    const Videoyt = await audio.getVideoyt(trackInfo.trackId);
    if (Videoyt == null) return

    await audio.downloadYouTubeAsMP3(Videoyt, `${trackInfo.track} - ${trackInfo.artist}`);

    const sinklyrics = await bugs.getSinklyrics(trackInfo.trackId);
    if (sinklyrics == null) return;

    sinklyrics.unshift({ time: 0, lyrics: '● ● ●' });

    const lyricsImage = await image.tempLyricsToImage(trackImg, sinklyrics);

    const VideoWithoutAudio = await video.generateVideoWithoutAudio(lyricsImage.lyricsList)

    await video.addAudioToVideo(VideoWithoutAudio, `${trackInfo.track} - ${trackInfo.artist}`)

    VideoWithoutAudio.tempFile.removeCallback();
    lyricsImage.tempFile.forEach((element) => {
        element.removeCallback();
    });

})();
