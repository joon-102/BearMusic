const perhooks = require('node:perf_hooks');

const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export async function VideoCreation(lyrics: any, Search: any): Promise<void> {
    const LyricsList = lyrics.map((lyric: any, index: number) => ({
        path: `temp/lyrics/${index + 1}.png`,
        time: lyric.time / 1000
    }));

    LyricsList.unshift({ path: `temp/lyrics/0.png`, time: 0 });

    console.info(`이미지 불러오기 완료.`);

    await BasicVideoCreation(LyricsList);
    await InsertAudio(Search);
}

async function BasicVideoCreation(LyricsList: { time: number, path: string; }[] ): Promise<void> {
    const startTime = perhooks.performance.now();

    return new Promise<void>((resolve, reject) => {
        const videoCommand = ffmpeg();

        LyricsList.forEach((line, index) => {
            videoCommand.input(line.path)
                .inputOptions('-loop 1')
                .inputOptions(`-t ${index < LyricsList.length - 1 ? LyricsList[index + 1].time - line.time : 5}`);
        });
        
        console.log('비디오 생성중...');

        videoCommand
            .on('error', (err: { message: string; }) => {
                console.error(`비디오 생성 오류: ${err.message}`);
                reject(err);
            })
            .on('end', () => {
                const duration = ((perhooks.performance.now() - startTime) / 1000).toFixed(1);
                process.stdout.write(`\r비디오 생성 완료, 소요시간: ${duration}초.\n`);
                resolve();
            })
            .mergeToFile('temp/temp.mp4');
    });
}

async function InsertAudio(Search: any): Promise<void> {
    const startTime = perhooks.performance.now();

    return new Promise<void>((resolve, reject) => {
        ffmpeg()
            .input('temp/temp.mp4')
            .input("temp/music.mp3")
            .audioCodec('aac')
            .videoCodec('libx264')
            .on('progress', (progress: any) => {
                process.stdout.write(`\r오디오 합성중...`); // ${Math.floor(progress.percent)}% 완료`);
            })
            .on('error', (err: any) => {
                console.error(`오디오 추가 오류: ${err.message}`);
                reject(err);
            })
            .on('end', () => {
                const duration = ((perhooks.performance.now() - startTime) / 1000).toFixed(1);
                process.stdout.write(`\r오디오 합성 완료, 소요시간: ${duration}초.\n`);
                resolve();
            })
            .output(`temp/video.mp4`)
            .run();
    })
}