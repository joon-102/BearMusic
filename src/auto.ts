import { spawn } from 'child_process';
import { Command } from 'commander';
import mongoose from 'mongoose';
import cron from 'node-cron';

const config = require('../config.json');

const Track = mongoose.model("Track", new mongoose.Schema({ track: String }));
const Use = mongoose.model("UseTrack", new mongoose.Schema({ track: String }));
const program = new Command();

program
    .version('1.0.0')
    .description('Auto Create a youtube video')
    .parse(process.argv);


async function connectToDatabase() {
    mongoose.set("strictQuery", false);
    try {
        await mongoose.connect(config.mongo);
        console.info("mongoose connected");
    } catch (error) {
        console.info(`mongoose connect Error : ${error}`);
    }
}

async function makeVideo(track: string): Promise<boolean> {
    try {
        const data = await new Promise<string[]>((resolve, reject) => {
            const child = spawn('node', ['.', '--track', track]);

            let output: string[] = [];

            child.stdout.on('data', (data: Buffer) => {
                const dataStr = data.toString();
                console.log(dataStr);
                output.push(dataStr);
            });

            child.on('close', (code) => {
                console.log(`프로세스 종료 코드: ${code}\n\n`);
                resolve(output);
            });

            child.on('error', (error) => {
                console.error(`프로세스 오류: ${error}\n\n`);
                reject(error);
            });
        });

        return data.some((output) => output.includes("업로드 성공!"));
    } catch (error) {
        return false;
    }
}

(async () => {
    await connectToDatabase();

    async function start() {
        let PlayList: any = await Track.find().exec();

        if (PlayList.length <= 0) {
            return console.log('존재하는 플레이리스트가 없습니다.');
        }

        const track = PlayList[0].track;

        await makeVideo(track);

        await Track.deleteMany({ track: track });
        await new Use({ track: track }).save();
    }

    await start()
    setInterval(async () => {
        await start()
    },  10800000);
})();

