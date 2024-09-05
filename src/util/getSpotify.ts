const perhooks = require('node:perf_hooks');
const fs = require('node:fs');
const timers = require('node:timers/promises')

const { fullLists, PlaywrightBlocker } = require( '@cliqz/adblocker-playwright')
const spotify = require('spotify-url-info');
const playwright = require('playwright');
const fetch = require('node-fetch');

export async function fetchTrackPreview(trackId: string, language: string) {
    const url = `https://open.spotify.com/track/${trackId}`;
    const options = {
        headers: { 'Accept-Language': `${language}` }
    };
    const previewResponse : any = await spotify(fetch).getPreview(url, options);
    previewResponse.title = previewResponse.title.replace(/\([^)]*\)/g, '');

    return previewResponse;
}

export async function getLyrics(config: any , trackId : string): Promise<{ lines: [time: number, words: string] }> {
    const start = perhooks.performance.now();
    console.info('가사 싱크 다운로드 중...');

    let cachedToken: any = null;

    if (!(cachedToken && cachedToken.accessTokenExpirationTimestampMs > Date.now())) {
        const tokenResponse  = await fetch("https://open.spotify.com/get_access_token?reason=transport&productType=web_player", { 
            headers: { 
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36", 
                "App-platform": "WebPlayer", 
                "content-type": "text/html; charset=utf-8", 
                cookie: `sp_dc=${config.SpotifyCookie}` 
            } 
        });

        if (!tokenResponse.ok) {
            throw new Error(`스포티파이 액세스 토큰 요청 실패, status: ${tokenResponse.status}`);
        }

        cachedToken = await tokenResponse.json();
    }

    const lyricsResponse = await fetch(`https://spclient.wg.spotify.com/color-lyrics/v2/track/${encodeURI(trackId)}?format=json&market=from_token`, { 
        method: "GET", 
        headers: { 
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Safari/537.36", 
            "App-platform": "WebPlayer", 
            "authorization": `Bearer ${cachedToken.accessToken}` 
        } 
    });

    const data : any = await lyricsResponse.json();

    const elapsedTime = ((perhooks.performance.now() - start) / 1000).toFixed(1);
    process.stdout.write(`\x1B[1A\x1B[2K가사 싱크 다운로드 완료 , 소요시간 ${elapsedTime}초\n`);


    return { 
        lines: data.lyrics.lines.map((value: { words: any , startTimeMs: any }) => ({ 
            words: value.words, 
            time: Number(value.startTimeMs) 
        })),
    };
}

export async function getMp3(TrackId: any): Promise<void> {
    const contents = [
        "#__next > div > div.relative > input",
        "#__next > div > button",
        "#__next > div > div.mt-5.m-auto.text-center > div.mb-12.grid.grid-cols-1.gap-3.m-auto > div > div.flex.items-center.justify-end > button",
        "#__next > div > div.mt-5.m-auto.text-center > div.my-5.grid.sm\\:grid-cols-2.gap-4.sm\\:gap-2 > a:nth-child(1)"
    ]
    const start = perhooks.performance.now();
    const browser = await playwright.chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const blocker = await PlaywrightBlocker.fromLists(fetch, fullLists, {
        enableCompression: true,
    });

    await blocker.enableBlockingInPage(page);
    process.stdout.write(`\rmp3 다운로드 중...`);

    await page.goto("https://spotifydown.com");
    await page.waitForNavigation();
    await page.fill(contents[0], `https://open.spotify.com/track/${TrackId}`);
    await page.click(contents[1]);
    await page.click(contents[2]);
    await page.locator(contents[3]).waitFor({ state: 'visible' });

    await new Promise<void>((resolve, reject) => {
        page.on('download', async (download: any) => {
            try {
                await fs.copyFileSync(await download.path(), "temp/music.mp3");
                await timers.setTimeout(500);
                await page.close();
                resolve();
            } catch (_) {
                await timers.setTimeout(500);
                await page.close();
                reject(_);
            }
        });

        page.click(contents[3]).catch(reject);
    });

    await browser.close();

    const elapsedTime = ((perhooks.performance.now() - start) / 1000).toFixed(1);
    process.stdout.write(`\rmp3 다운로드 완료 , 소요시간 ${elapsedTime}초\n`);
}
