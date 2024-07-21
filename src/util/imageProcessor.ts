const cliProgress = require('cli-progress');
const fetch = require('node-fetch');
const sharp = require('sharp');
const chalk = require('chalk');

function getSvgText(weight: number, height: number, fontWeight: number, fontSize: number, text: string) {
    return `<svg width="${weight}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><style>.title { font-family: 'MinSans-Bold'; font-weight: ${fontWeight}; font-size: ${fontSize}px; fill: white; } </style></defs><text x="50%" y="50%" text-anchor="middle" class="title">${text}</text></svg>`
}

export async function applyBlur(config: any, Link: string , Spotify_Search : any): Promise<void> {

    const progressBar = new cliProgress.SingleBar({
        format: `{status} |${chalk.blue("{bar}")}| {percentage}% | {value}/{total} Chunks`,
    }, cliProgress.Presets.shades_classic);

    progressBar.start(4, 0, { status: '시작 중...' });

    progressBar.update(1, { status: '이미지 다운로드 중...' });
    const response = await fetch(Link);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    try {
        const buffer = await response.buffer();

        progressBar.update(2, { status: '이미지 처리 중...' });
        const composite = await sharp(buffer)
            .resize(420, 420)
            .extend({ top: 1, bottom: 1, left: 1, right: 1, background: { r: 255, g: 255, b: 255, alpha: 0.2 } })
            .toBuffer()

        const default_image = await sharp(buffer)
            .resize(config.Width, config.Height)
            .modulate({ brightness: 0.7, saturation: 1.15, })
            .sharpen()
            .blur(40)
            .flatten({ background: { r: 232, g: 158, b: 111 } })
            .composite([{ input: composite, left: Math.floor(((config.Width / 2) / 2) - 210), top: Math.floor(((config.Height) / 2) - 210), blend: 'over' }])
            .toBuffer();


        progressBar.update(3, { status: '트랙 정보 추가 중..' });
        const svgText = getSvgText(1000 , 1000 , 900 , 30 , Spotify_Search.title);
        const svgText2 = getSvgText(1000 , 1000 , 600 , 26 , Spotify_Search.artist);
        await sharp(default_image)
            .composite([
                { input: Buffer.from(svgText), left: Math.floor(((config.Width / 2) / 2) - 500), top: Math.floor(((config.Height) / 2) - 210) - 35 },
                { input: Buffer.from(svgText2), left: Math.floor(((config.Width / 2) / 2) - 500), top: Math.floor(((config.Height) / 2) - 210) + 4 }
            ])
            .toFile('temp/Thumbnail_Blur.png');


        progressBar.update(4, { status: "섬네일 이미지 생성완료." });
        progressBar.stop();
    } catch (error) {
        console.log('\n' + error)
        progressBar.stop();
        throw new Error(chalk.red(`섬네일 이미지 생성 실패.`));
    }
}