import Vibrant from 'node-vibrant';
import sharp from 'sharp';
import axios from 'axios';

export class imageService {

    private adjustToPastel(rgb: number[]): number[] {
        const [r, g, b] = rgb;

        return [
            Math.min(280, r + (280 - r) * 0.5),
            Math.min(280, g + (280 - g) * 0.5),
            Math.min(280, b + (280 - b) * 0.5)
        ];
    }

    private contrast(rgb: number[], color: number[]): number {
        return (0.2126 * Math.pow(rgb[0] / 255, 2.2) + 0.7152 * Math.pow(rgb[1] / 255, 2.2) + 0.0722 * Math.pow(rgb[2] / 255, 2.2) + 0.05) / (0.2126 * Math.pow(color[0] / 255, 2.2) + 0.7152 * Math.pow(color[1] / 255, 2.2) + 0.0722 * Math.pow(color[2] / 255, 2.2) + 0.05);
    }

    private isStrongColor(rgb: number[]): boolean {
        const [r, g, b] = rgb;
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 200;
    }

    async extractPastelColors(imgSrc: string): Promise<{ startColor: number[]; endColor: number[] } | null> {

        const palette: any = await Vibrant.from(imgSrc).getPalette();

        if (palette && palette.Vibrant && palette.Muted) {
            let startColor = palette.LightVibrant
                ? palette.LightVibrant.getRgb()
                : palette.Vibrant.getRgb();
            let endColor = palette.DarkVibrant
                ? palette.DarkVibrant.getRgb()
                : palette.Muted.getRgb();

            if (this.isStrongColor(startColor)) {
                startColor = palette.Muted ? palette.Muted.getRgb() : palette.LightVibrant.getRgb();
            }

            if (this.isStrongColor(endColor)) {
                endColor = palette.Muted ? palette.Muted.getRgb() : palette.LightVibrant.getRgb();
            }

            startColor = this.adjustToPastel(startColor);
            endColor = this.adjustToPastel(endColor);

            const contrast1 = this.contrast(startColor, [255, 255, 255]);
            const contrast2 = this.contrast(endColor, [255, 255, 255]);

            return {
                startColor: contrast1 > contrast2 ? startColor : endColor,
                endColor: contrast1 > contrast2 ? endColor : startColor
            };
        }
        return null;
    }


    async createBackgroundImage(width: number, height: number, startColor: number[], endColor: number[]): Promise<Buffer> {

        const grayStartX: number = 180.5;
        const grayEndY: number = height - Math.tan((40 * Math.PI) / 180) * (width - grayStartX);

        return await sharp({ create: { width: width, height: height, channels: 3, background: { r: startColor[0], g: startColor[1], b: startColor[2] } } })
            .composite([{
                input: Buffer.from(
                    `
                    <svg width="${width}" height="${height}">
                        <polygon points="${grayStartX},${height} ${width},${grayEndY} ${width},${height}" fill="rgb(${endColor[0]},${endColor[1]},${endColor[2]})" />
                    </svg>
                `
                ),
                blend: 'over',
            }])
             .toFormat('png')
            .toBuffer();
    }

    async createAlbumImage(imgSrc: string, background: Buffer): Promise<Buffer> {

        const response = await axios.get(imgSrc, { responseType: 'arraybuffer' });
        const album: Buffer = Buffer.from(response.data, 'binary');

        return await sharp(background)
            .composite([{
                input: await sharp(album).resize(1125, 1125, { fit: 'cover' }).toBuffer(),
                top: 157,
                left: 155,
                blend: 'over',
            }])
            .toFormat('png')
            .toBuffer();
    }

    async addTrackInfo(width: number, height: number, AlbumImage: Buffer, title: string, artist: string, album: string) {

        const rectX = 1270;
        const rectY = 275;
        const rectWidth = 1280;
        const rectHeight = 200;

        const titleSize = 62;
        const artistSize = 50;
        const albumSize = 42;

        const artistHeight = 80 + 5;
        const albumHeight = 60;

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
                            <rect x="${rectX + rectWidth / 2}" y="${rectY + rectHeight / 2 + albumSize / 2 + (albumHeight + artistHeight)}" width="${rectWidth}" height="${rectHeight}" fill="none" stroke="none"/>
                            <text x="${rectX + rectWidth / 2}" y="${rectY + rectHeight / 2 + albumSize / 2 + (albumHeight + artistHeight)}" font-family="GmarketSansMedium" font-size="${albumSize}" fill="White" text-anchor="middle" dominant-baseline="middle">[ ${album} ]</text>
                        </svg>
                        `),
                    gravity: 'northwest'
                }
            ])
            .toFormat('png')
            .toBuffer();

    }


};
