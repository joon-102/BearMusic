const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const perhooks = require('node:perf_hooks');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function VideoCreation(config: any, lyrics: any , Spotify_Search : any): Promise<void> {
    let LyricsList: any = []

    LyricsList.push({ path: `temp/lyrics/0.png`, time: 0 });
    lyrics.forEach((lyric: any, index: number) => {
        LyricsList.push({ path: `temp/lyrics/${index + 1}.png`, time: lyric.time / 1000 });
    });
    console.info(`비디오 생성을 위한 이미지 불러오기 완료.`);

    await BasicVideoCreation(LyricsList);
    await InsertAudio(config , Spotify_Search);
}

async function BasicVideoCreation(LyricsList: any): Promise<void>  {
    return new Promise<void>((resolve, reject) => {
        const startTime = perhooks.performance.now();
        const spinnerChars = ['|', '/', '-', '\\'];
        let currentCharIndex = 0;

        const updateSpinner = () => {
            process.stdout.write(`\r${spinnerChars[currentCharIndex]} 비디오 생성중...`);
            currentCharIndex = (currentCharIndex + 1) % spinnerChars.length;
        };

        const spinnerInterval = setInterval(updateSpinner, 100);
        const videoCommand = ffmpeg();

        LyricsList.forEach((line: { time: number; path: any; }, index: number) => {
            videoCommand.input(line.path).inputOptions('-loop 1').inputOptions(`-t ${index < LyricsList.length - 1 ? LyricsList[index + 1].time - line.time : 5}`);
        });

        videoCommand
            .on('error', (err: { message: any; }) => {
                clearInterval(spinnerInterval);
                console.error(`비디오 생성 오류: ${err.message}`);
                reject(err);
            })
            .on('end', () => {
                clearInterval(spinnerInterval);
                process.stdout.write(`\r비디오 생성 완료, 소요시간 : ${((perhooks.performance.now() - startTime) / 1000).toFixed(1)}초.\n`);
                resolve();
            })
            .mergeToFile('temp/temp.mp4');
    });
}

async function InsertAudio(config : any , Spotify_Search : any) : Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const startTime = perhooks.performance.now();
        const spinnerChars = ['|', '/', '-', '\\'];
        let currentCharIndex = 0;

        ffmpeg()
            .input('temp/temp.mp4')
            .input("temp/music.mp3")
            .audioCodec('aac')
            .videoCodec('libx264')
            .on('progress', (progress  : any) => {
                process.stdout.write(`\r${spinnerChars[currentCharIndex]} 오디오 합성중... ${Math.floor(progress.percent)}% 완료`);
                currentCharIndex = (currentCharIndex + 1) % spinnerChars.length;
            })
            .on('error', (err: any) => {
                console.error(`오디오 추가 오류: ${err.message}`);
                reject(err);
            })
            .on('end', async () => {
                process.stdout.write(`\r오디오 합성 완료 , 소요시간 : ${((perhooks.performance.now() - startTime) / 1000).toFixed(1)}초.\n`);
                resolve();
            })
            .output(`archive/${Spotify_Search.title}.mp4`)
            .run();
    })
}