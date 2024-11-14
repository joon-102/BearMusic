 import { bugsService } from './services/bugsService';
import { imageService } from './services/imageService';

import sharp from 'sharp';

(async () => {
    const image = new imageService()
    const bugs = new bugsService()

    const trackInfo = await bugs.getTrackInfo(6188625)

    const Background: Buffer = await image.createBackgroundImage(trackInfo.imgSrc);
    const trackImg: Buffer = await image.addTrackInfo(await image.createAlbumImage(trackInfo.imgSrc, Background), trackInfo.track, trackInfo.artist, trackInfo.album)

    sharp(trackImg)
        .toFile('dd.png')



})();