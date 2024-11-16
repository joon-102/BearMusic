import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import tmp from 'tmp';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export class videoService {

    async generateVideoWithoutAudio(lyrics: { time: number, path: string }[]): Promise<{ fileName: string, tempFile: tmp.FileResult }> {
        const tempFile = tmp.fileSync({ postfix: '.mp4' });
    
        const fileName = await new Promise<string>((resolve, reject) => {
            const command = ffmpeg();
    
            lyrics.forEach((lyric, index) => {
                command.input(lyric.path)
                    .inputOptions('-loop 1')
                    .inputOptions(`-t ${index < lyrics.length - 1 ? lyrics[index + 1].time - lyric.time : 5}`);
            });

            command
                .videoCodec('libx264')
                .videoBitrate('1000k')
                .on('error', (err) => {
                    console.error(`Error: ${err.message}`);
                    reject(err);
                })
                .on('end', () => {
                    resolve(tempFile.name);
                })
                .mergeToFile(tempFile.name, './');
        });
    
        return { fileName, tempFile };
    }
    

    async addAudioToVideo(video: { fileName: string, tempFile: tmp.FileResult }, audioTrack: string): Promise<string> {
        return await new Promise<string>((resolve, reject) => {
            ffmpeg()
                .input(video.fileName)
                .input(`out/${audioTrack}.mp3`)
                .audioCodec('aac')
                .on('error', (err) => {
                    console.error(`Error: ${err.message}`);
                    reject(err);
                })
                .on('end', () => {
                    resolve(audioTrack);
                })
                .output(`out/${audioTrack}.mp4`)
                .run();
        });
    }

}
