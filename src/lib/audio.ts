
import { unlinkSync, existsSync } from 'fs';
import { exec } from 'youtube-dl-exec';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg'
import tmp from 'tmp-promise';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function downloadYoutubeAudio(videoId: string): Promise<void> {
    const outputPath = 'public/audio.mp3';

    if (existsSync(outputPath)) {
        unlinkSync(outputPath);
    }

    await exec(`https://www.youtube.com/watch?v=${videoId}`, {
        extractAudio: true,
        audioFormat: 'mp3',
        output: outputPath,
    });

    console.log(`[audio] 음원 다운로드 완료`);
}

async function searchYoutubeVideos(artist: string, title: string): Promise<{ id: string, title: string, channelTitle: string }[]> {
    try {
        const response = await axios.get(encodeURI(`https://www.youtube.com/results?search_query="Auto-generated"${artist}-${title}&sp=EgIQAQ%3D%3D`));
        const html = response.data;

        const splitByInitData = html.split("var ytInitialData =");
        if (splitByInitData.length < 2) return [];

        const jsonDataText = splitByInitData[1].split("</script>")[0].trim().slice(0, -1);
        const initialData = JSON.parse(jsonDataText);

        const sectionList = initialData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer;
        const results: any[] = [];

        sectionList?.contents?.forEach((section: any) => {
            const items = section.itemSectionRenderer?.contents || [];
            items.forEach((entry: any) => {
                const video = entry.videoRenderer || entry.playlistVideoRenderer;
                if (!video?.videoId) return;

                const videoId = video.videoId;
                const videoTitle = video.title?.runs?.[0]?.text || "";
                const channelName = video.ownerText?.runs?.[0]?.text || "";

                results.push({ id: videoId, title: videoTitle, channelTitle: channelName });
            });
        });

        return results;
    } catch {
        return [];
    }
}

async function searchYoutubeDescription(videoId: string): Promise<{ id: string, channel: string, description: string } | null> {
    try {
        const response = await axios.get(encodeURI(`https://www.youtube.com/watch?v=${videoId}`));
        const html = response.data;

        const splitByPlayerResponse = html.split("var ytInitialPlayerResponse =");
        if (splitByPlayerResponse.length < 2) return null;
        const jsonText = splitByPlayerResponse[1].split("</script>")[0].trim().slice(0, -1);
        const playerResponse = JSON.parse(jsonText);

        const videoDetails = playerResponse.videoDetails;

        return {
            id: videoDetails?.videoId || "",
            channel: String(videoDetails?.author),
            description: String(videoDetails?.shortDescription)
        };
    } catch {
        return null;
    }
};

async function reencodeFirstMinute(inputPath: string, outputPath: string): Promise<void> {
    return await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .setStartTime(0).setDuration(60).audioBitrate(128).audioCodec('libmp3lame').audioFrequency(44100).audioChannels(2)
            .on('error', () => reject())
            .on('end', () => resolve())
            .save(outputPath);
    });
}


async function convertToWavTmp(inputPath: string): Promise<string> {
    const { path: tmpPath } = await tmp.file({ postfix: '.wav' });
    return await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .audioChannels(1).audioFrequency(16000).format('wav')
            .on('error', (err) => { reject(err); })
            .on('end', () => { resolve(tmpPath); })
            .save(tmpPath);
    });
}

async function getFingerprint(path: string): Promise<number[]> {
    const { stdout } = await execFileAsync('fpcalc', ['-raw', '-length', '55', path]);
    const lines = stdout.trim().split('\n').find(line => line.startsWith('FINGERPRINT='));
    if (!lines) throw new Error('Fingerprint not found in fpcalc output.');
    return lines.replace('FINGERPRINT=', '').split(',').map(Number);
}

async function compareFingerprint(pathA: string, pathB: string): Promise<number> {
    const [fpA, fpB] = await Promise.all([getFingerprint(pathA), getFingerprint(pathB)]);
    const len = Math.min(fpA.length, fpB.length);
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < len; i++) {
        dot += fpA[i] * fpB[i];
        magA += fpA[i] * fpA[i];
        magB += fpB[i] * fpB[i];
    }
    return (dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100;
}

export { downloadYoutubeAudio, searchYoutubeVideos, searchYoutubeDescription, reencodeFirstMinute, convertToWavTmp, compareFingerprint }