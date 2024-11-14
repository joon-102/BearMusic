import sharp from 'sharp';
import axios from 'axios';

export class imageService {

    async createBackgroundImage(imgSrc: string, width: number = 2560, height: number = 1440): Promise<Buffer> {

        const response = await axios.get(imgSrc, { responseType: 'arraybuffer' });
        const album: Buffer = Buffer.from(response.data, 'binary');

        return await sharp(album)
            .resize(width, height)
            .modulate({ brightness: 0.23, saturation: 0.5 })
            .sharpen()
            .blur(40)
            .flatten({ background: { "r": 232, "g": 158, "b": 111 } })
            .toFormat('png')
            .toBuffer();
    }

    async createAlbumImage(imgSrc: string, background: Buffer): Promise<Buffer> {

        const response = await axios.get(imgSrc, { responseType: 'arraybuffer' });
        const album: Buffer = Buffer.from(response.data, 'binary');

        const AfterAlbum: Buffer = await sharp(album)
            .resize(1125, 1125, { fit: 'cover' })
            .composite([
                {
                    input: Buffer.from(
                        `<svg width="1125" height="1125">
                            <rect x="0" y="0" width="1125" height="1125" rx="5" ry="5" fill="black"/>
                        </svg>
                        `),
                    blend: 'dest-in'
                }
            ])
            .toFormat('png')
            .toBuffer()

        return await sharp(background)
            .composite([{
                input: AfterAlbum,
                top: 157,
                left: 155,
                blend: 'over',
            }])
            .toFormat('png')
            .toBuffer();
    }

    async addTrackInfo(AlbumImage: Buffer, title: string, artist: string, album: string, width: number = 2560, height: number = 1440) {

        const rectX = 1268;
        const rectY = 170;
        const rectWidth = 1280;
        const rectHeight = 200;

        const titleSize = 65;
        const artistSize = 48;
        const albumSize = 40;

        const artistHeight = 65.5;
        const albumHeight = 55;

        return sharp(AlbumImage)
            .composite([
                {
                    input: Buffer.from(`
                        <svg width="${width}" height="${height}">
                            <rect x="${rectX + rectWidth / 2}" y="${rectY + rectHeight / 2 + titleSize / 2}" width="${rectWidth}" height="${rectHeight}" fill="none" stroke="none"/>
                            <text x="${rectX + rectWidth / 2}" y="${rectY + rectHeight / 2 + titleSize / 2}" font-family="GmarketSansMedium" font-size="${titleSize}" fill="White" text-anchor="middle" dominant-baseline="middle">${title}</text>
                        </svg>
                        `),
                    gravity: 'northwest'
                },
                {
                    input: Buffer.from(`
                        <svg width="${width}" height="${height}">
                            <rect x="${rectX + rectWidth / 2}" y="${rectY + rectHeight / 2 + artistSize / 2 + artistHeight}" width="${rectWidth}" height="${rectHeight}" fill="none" stroke="none"/>
                            <text x="${rectX + rectWidth / 2}" y="${rectY + rectHeight / 2 + artistSize / 2 + artistHeight}" font-family="GmarketSansMedium" font-size="${artistSize}" fill="White" text-anchor="middle" dominant-baseline="middle">${artist}</text>
                        </svg>
                        `),
                    gravity: 'northwest'
                },
                {
                    input: Buffer.from(`
                        <svg width="${width}" height="${height}">
                            <text x="${rectX + rectWidth / 2}" y="${rectY + rectHeight / 2 + albumSize / 2 + (albumHeight + artistHeight)}" font-family="GmarketSansMedium" font-size="${albumSize}" fill="White" text-anchor="middle" dominant-baseline="middle">[ ${album} ]</text>
                        </svg>
                        `),
                    gravity: 'northwest'
                },
                {
                    input: Buffer.from(`
                        <svg width="${width}" height="${height}">
                            <text x="315" y="143.5" font-family="SB 어그로 M" font-size="60" fill="White" text-anchor="middle" dominant-baseline="middle">
                                <tspan x="315" dy="0">BEAR</tspan>
                                <tspan dx="-8" dy="0">MUSIC</tspan>
                            </text>
                        </svg>
                        `),
                    gravity: 'northwest'
                },
            ])
            .toFormat('png')
            .toBuffer();
    }
};
