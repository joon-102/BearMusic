import axios, { AxiosResponse } from 'axios';
import { exec } from 'youtube-dl-exec';

export class audioService {

    isWithinOneMonth(isoTime: string): boolean {
        const givenDate = new Date(isoTime);
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1); // 한 달 전 날짜

        return givenDate.getTime() >= oneMonthAgo.getTime();
    }

    async getVideoDetails(videoId: string): Promise<string> {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                part: 'snippet',
                id: videoId,
                key: process.env.YOUTUBE_API_KEY
            }
        });

        return response.data.items[0].snippet.description;
    }

    async getVideoyt(trackId: number): Promise<string | null> {
        const request: AxiosResponse<{ track: any }> = await axios.get<any>(`https://music.bugs.co.kr/player/track/${trackId}`);

        const response: AxiosResponse<{ items: any }> = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: `"Auto-generated" ${request.data.track.track_title} - ${request.data.track.artist_disp_nm}`,
                type: 'video',
                maxResults: 5,
                key: process.env.YOUTUBE_API_KEY
            }
        });

        let selectedVideos: { id: { videoId: string } }[] = [];

        for (let i = 0; i < response.data.items.length; i++) {
            const video = response.data.items[i];
            const title = String(video.snippet.title);

            const VideoDetail = await this.getVideoDetails(video.id.videoId);

            if (this.isWithinOneMonth(video.snippet.publishTime) && VideoDetail.includes("Auto-generated") && !title.includes("(instrumental)") && VideoDetail.includes(request.data.track.artist_disp_nm.replace(/\(.*?\)/g, '').trim())) {
                selectedVideos.push(video);
            };
        };

        if (!selectedVideos[0]) return null;

        return selectedVideos[0].id.videoId;
    }

    async downloadYouTubeAsMP3(videoId: string, fileName: string): Promise<boolean> {
        const outputPath = `./out/${fileName}.%(ext)s`

        try {
            await exec(`https://www.youtube.com/watch?v=${videoId}`, {
                extractAudio: true,
                audioFormat: 'mp3',
                output: outputPath,
            });

            return true;
        } catch (_) {
            return false;
        }
    }

};
