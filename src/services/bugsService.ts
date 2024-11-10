import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';

export class bugsService {

    async getNewestChart(): Promise<{ title: string; artist: string; imgSrc?: string; trackId?: number; artistId?: number; albumId?: number; }[]> {
        const request: AxiosResponse<string> = await axios.get<string>('https://music.bugs.co.kr/newest/track/totalpicked?nation=ALL');
        const $: cheerio.Root = cheerio.load(request.data);
        const tracks: any[] = [];

        $('#GENREtotalpicked > table > tbody > tr').each((_, element) => {
            const title = $(element).find('.title a').text().trim();
            const artist = $(element).find('.artist a').text().trim();
            const trackId = $(element).find('.trackInfo').attr('href')?.replace("https://music.bugs.co.kr/track/", "").split("?")[0];
            const artistId = $(element).find('.artist a').attr('href')?.replace("https://music.bugs.co.kr/artist/", "").split("?")[0];
            const imgSrc = $(element).find('.thumbnail img').attr('src')?.replace("50", "original").split("?")[0];
            const albumId = $(element).find('td:nth-child(8) > a').attr('href')?.replace("https://music.bugs.co.kr/album/", "").split("?")[0];

            if (title && artist) {
                tracks.push({ title, artist, trackId, artistId, imgSrc, albumId });
            };
        });

        return tracks;
    };

    async getSinklyrics(trackId: number): Promise<{ time: number; lyrics: string }[] | null> {
        const request: AxiosResponse<{ lyrics: string }> = await axios.get<{ lyrics: string }>(`https://music.bugs.co.kr/player/lyrics/T/${trackId}`);

        if (request.data.lyrics === '') return null;

        const processing = request.data.lyrics.split('＃').map(item => {
            const [time, lyrics] = item.split('|');
            return { time: parseFloat(time), lyrics };
        });

        return processing;
    };

    async getTrackInfo(trackId: number): Promise<any> {
        const request: AxiosResponse<{ track: any }> = await axios.get<any>(`https://music.bugs.co.kr/player/track/${trackId}`);

        return {
            track: request.data.track.track_title.replace(/\([^()]*\)/g, '').replace(/\([^()]*\)/g, '').trim(),
            artist: request.data.track.artist_disp_nm.replace(/\([^()]*\)/g, '').replace(/\([^()]*\)/g, '').trim(),
            album: request.data.track.album_title.replace(/\([^()]*\)/g, '').trim(),
            release: request.data.track.release_ymd,
        };
    };
};

