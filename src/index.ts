import { imageService } from './services/imageService'
import sharp from 'sharp';

(async () => {
    const dd = new imageService()

    const color = (await dd.extractPastelColors("https://image.bugsm.co.kr/album/images/original/40833/4083370.jpg?version=undefined"))
    if (color == null) return


    const Background = await dd.createBackgroundImage(2560, 1440, color.startColor, color.endColor);
    const ddd = await dd.createAlbumImage('https://image.bugsm.co.kr/album/images/original/40833/4083370.jpg?version=undefined', Background);

    const ddd123123: any = dd.addTrackInfo(2560, 1440, ddd, '친구로 지내다 보면', 'BIG Naughty', '친구로 지내다 보면')


    sharp(await ddd123123)
        .toFile('dd.png')



})();