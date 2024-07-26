const cliProgress = require('cli-progress');
const perhooks = require('node:perf_hooks');
const fetch = require('node-fetch');
const sharp = require('sharp');
const fs = require("node:fs");

function getSvgText(weight: number, height: number, fontWeight: number, fontSize: number, text: string) {
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    return `<svg width="${weight - 10}" height="${height - 10}" viewBox="0 0 ${weight} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><style>.title { word-spacing : 0.1px; font-family: 'Pretendard'; font-weight: ${fontWeight}; font-size: ${fontSize}px; fill: white; } </style></defs><text x="50%" y="50%" text-anchor="middle" dy=".3em" class="title">${text}</text></svg>`
}

export async function BasicImage(config: any, Spotify_Search: any): Promise<void> {
    const progressBar = new cliProgress.SingleBar({
        format: `{status} |{bar}| {percentage}% | {value}/{total} Chunks `,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
    }, cliProgress.Presets.shades_classic);

    const start = perhooks.performance.now();
    progressBar.start(3, 0, { status: "기본 이미지 생성을 시작합니다...", speed: "N/A" });

    progressBar.update(1, { status: '이미지 다운로드 중...' });
    const response = await fetch(Spotify_Search.image);
    if (!response.ok) throw new Error(`이미지 다운로드 실패 : ${response.statusText}`);
    const buffer = await response.buffer();

    progressBar.update(2, { status: '앨범 커버 생성 중...' });
    const Album_Cover = await sharp(buffer)
        .resize(config.album_cover.width, config.album_cover.height)
        .composite([{ input: Buffer.from(`<svg width="${config.album_cover.width}" height="${config.album_cover.height}"><rect x="0" y="0" width="${config.album_cover.width}" height="${config.album_cover.height}" rx="${config.album_cover.round}" ry="${config.album_cover.round}" fill="black"/></svg>`), blend: 'dest-in' }])
        .toFormat('png')
        .toBuffer();

    progressBar.update(3, { status: '백그라운드 사진 합성 중...' });
    const Background_photo = await sharp(buffer)
        .resize(config.background_photo.width, config.background_photo.height)
        .modulate({ brightness: config.background_photo.brightness, saturation: config.background_photo.saturation, })
        .sharpen()
        .blur(config.background_photo.blur)
        .flatten({ background: config.background_photo.flatten })
        .composite([
            { input: Buffer.from(`<svg width="${config.background_photo.width}" height="${config.background_photo.height}"><rect x="0" y="0" width="${config.background_photo.width}" height="${config.background_photo.height}" fill="rgba(0, 0, 0, ${config.background_photo.shadow})"/></svg>`), blend: 'over' },
            { input: await Album_Cover, left: Math.floor(config.background_photo.width / 4 - config.album_cover.width / 2), top: Math.floor((config.album_cover.height / 2) - (config.background_photo.height / 4.0)), blend: 'over' }
        ])
        .toFormat('png')
        .toBuffer();

    progressBar.stop();

    process.stdout.write('\x1B[1A\x1B[2K');
    process.stdout.write(`기본 이미지 생성 완료 , 소요시간 ${((perhooks.performance.now() - start) / 1000).toFixed(1)}초\n`);

    const svgText = getSvgText(1000, 1000, 900, 75, Spotify_Search.title);
    const svgText2 = getSvgText(1000, 1000, 600, 58, Spotify_Search.artist);
    await sharp(Background_photo)
        .composite([
            { input: Buffer.from(svgText), left: Math.floor(((config.background_photo.width / 2) / 2) - 500), top: (Math.floor(config.background_photo.height / 2) + 13) },
            { input: Buffer.from(svgText2), left: Math.floor(((config.background_photo.width / 2) / 2) - 500), top: (Math.floor(config.background_photo.height / 2) + 85) }
        ])
        .toFile('temp/Thumbnail_Blur.png');
}

export async function LyricsImage(config: any, lyrics: any): Promise<void> {

    await fs.rmSync('temp/lyrics', { recursive: true, force: true });
    await fs.mkdirSync('temp/lyrics', { recursive: true });

    const progressBar = new cliProgress.SingleBar({
        format: `{status} |{bar}| {percentage}% | {value}/{total} Chunks`,
    }, cliProgress.Presets.shades_classic);

    const start = perhooks.performance.now();
    progressBar.start(lyrics.length, 0, { status: '가사 이미지 합성 시작중...' });

    await sharp("temp/Thumbnail_Blur.png")
        .composite([{ input: Buffer.from(getSvgText(1500, 1000, 600, 100, "♪")), left: Math.floor((config.background_photo.width / 4 + config.album_cover.width / 2) - 23.5), top: Math.floor(((config.background_photo.height) / 2) - 500) }])
        .toFormat('png')
        .toFile(`temp/lyrics/0.png`);

    for (let index = 0; index < lyrics.length; index++) {
        const text = lyrics[index].words || "♪";
        const size = text === "♪" ? 100 : 70;
        const svgText = getSvgText(1500, 1000, 600, size, text);

        await sharp("temp/Thumbnail_Blur.png")
            .composite([{ input: Buffer.from(svgText), left: Math.floor((config.background_photo.width / 4 + config.album_cover.width / 2) - 23.5), top: Math.floor(((config.background_photo.height) / 2) - 500) }])
            .toFormat('png')
            .toFile(`temp/lyrics/${index + 1}.png`);

        progressBar.update(index + 1, { status: `${index + 1} 번째 이미지 합성  중...` });
    }

    progressBar.stop();
    process.stdout.write('\x1B[1A\x1B[2K');
    process.stdout.write(`가사 이미지 합성 완료. , 소요시간 ${((perhooks.performance.now() - start) / 1000).toFixed(1)}초\n`);
}