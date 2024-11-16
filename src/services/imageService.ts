import sharp from 'sharp';
import axios from 'axios';
import tmp from 'tmp';

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

    async addTrackInfo(AlbumImage: Buffer, title: string, artist: string, album: string, width: number = 2560, height: number = 1440): Promise<Buffer> {
        const rectX = 1275;
        const rectY = 155;
        const rectWidth = 1280;
        const rectHeight = 200;

        const titleSize = title.length > 20 ? 58 : 63;
        const artistSize = 47;
        const albumSize = title.length > 20 ? 35 : 40;

        const artistHeight = 63;
        const albumHeight = 53;

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
                            <text x="320" y="143.5" font-family="SB 어그로 M" font-size="60" fill="White" text-anchor="middle" dominant-baseline="middle">
                                <tspan x="315" dy="0">BEAR</tspan>
                                <tspan dx="-9" dy="0">MUSIC</tspan>
                            </text>
                        </svg>
                        `),
                    gravity: 'northwest'
                },
            ])
            .toFormat('png')
            .toBuffer();
    }

    async addLyricsToImage(trackImg: Buffer, lyrics: { Before: string, Current: string, After: string }, width: number = 2560, height: number = 1440): Promise<Buffer> {
        const BoxWidth = 1280;
        const BoxHeight = 120;

        const CurrentX = 1280;
        const CurrentY = 710;

        const BeforeX = CurrentX
        const BeforeY = CurrentY - 102;

        const AfterX = CurrentX
        const AfterY = CurrentY + 102;

        const CurrentSize = 60;
        const BeforeSize = 45;
        const AfterSize = 45;

        return sharp(trackImg)
            .composite([
                {
                    input: Buffer.from(`
                    <svg width="${width}" height="${height}">
                        <rect x="${BeforeX + BoxWidth / 2}" y="${BeforeY + BoxHeight / 2 + BeforeSize / 2}" width="${BoxWidth}" height="${BoxHeight}" fill="none" stroke="none"/>
                        <text x="${BeforeX + BoxWidth / 2}" y="${BeforeY + BoxHeight / 2 + BeforeSize / 2}" font-family="GmarketSansMedium" font-size="${BeforeSize}" fill="rgba(255, 255, 255, 0.72)" text-anchor="middle" dominant-baseline="middle">${lyrics.Before}</text>
                    </svg>
                    `),
                    gravity: 'northwest'
                },
                {
                    input: Buffer.from(`
                    <svg width="${width}" height="${height}">
                        <rect x="${CurrentX + BoxWidth / 2}" y="${CurrentY + BoxHeight / 2 + CurrentSize / 2}" width="${BoxWidth}" height="${BoxHeight}" fill="none" stroke="none"/>
                        <text x="${CurrentX + BoxWidth / 2}" y="${CurrentY + BoxHeight / 2 + CurrentSize / 2}" font-family="GmarketSansMedium" font-size="${CurrentSize}" fill="White" text-anchor="middle" dominant-baseline="middle">${lyrics.Current}</text>
                    </svg>
                    `),
                    gravity: 'northwest'
                },
                {
                    input: Buffer.from(`
                    <svg width="${width}" height="${height}">
                        <rect x="${AfterX + BoxWidth / 2}" y="${AfterY + BoxHeight / 2 + AfterSize / 2}" width="${BoxWidth}" height="${BoxHeight}" fill="none" stroke="none"/>
                        <text x="${AfterX + BoxWidth / 2}" y="${AfterY + BoxHeight / 2 + AfterSize / 2}" font-family="GmarketSansMedium" font-size="${AfterSize}" fill="rgba(255, 255, 255, 0.72)" text-anchor="middle" dominant-baseline="middle">${lyrics.After}</text>
                    </svg>
                    `),
                    gravity: 'northwest'
                },
            ])
            .toFormat('png')
            .toBuffer();
    }

    async tempLyricsToImage(trackImg: Buffer, sinklyrics: { time: number; lyrics: string }[]): Promise<{ lyricsList: { time: number; path: string }[]; tempFile: tmp.FileResult[] }> {
        const lyricsList: { time: number; path: string }[] = [];
        const tempFile: tmp.FileResult[] = [];

        for (let i = 0; i < sinklyrics.length; i++) {
            const previousLyric = i === 0 ? '' : sinklyrics[i - 1].lyrics;
            const currentLyric = sinklyrics[i].lyrics;
            const nextLyric = i === sinklyrics.length - 1 ? '' : sinklyrics[i + 1].lyrics;

            const generatedLyrics = await this.addLyricsToImage(trackImg, {
                Before: previousLyric,
                Current: currentLyric,
                After: nextLyric,
            });

            const tmpobj = tmp.fileSync();
            await sharp(generatedLyrics).toFile(tmpobj.name);

            lyricsList.push({ time: sinklyrics[i].time, path: tmpobj.name });
            tempFile.push(tmpobj);
        }

        return { lyricsList, tempFile };
    }
};
