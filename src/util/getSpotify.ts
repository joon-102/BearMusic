import LyricsClient from 'sync-lyrics';

const fetch = require('isomorphic-unfetch');
const spotify = require('spotify-url-info')(fetch);
const chalk = require('chalk');

interface Config {
    Language: string,
    SpotifyCookie: string,
    TrackId: string
}

export function getPreview(config: Config) {
    const result = spotify.getPreview(`https://open.spotify.com/track/` + config.TrackId, {
        headers: {
            'Accept-Language': config.Language
        }
    });
    if (result == undefined) throw new Error('스토리파이 트랙 아이디가 잘못되었습니다.');
    return result;
}

export async function getLyrics(config: Config) {
    const client: any = new LyricsClient(config.SpotifyCookie);
    try {
        const lyrics = await client.getLyrics(config.TrackId);
        console.info("가사 싱크 다운로드 완료.")
        return lyrics;
    } catch (error) {
        throw new Error(chalk.red(`해당 트랙은 가사가 등록되지 않았습니다.`));
    }

}