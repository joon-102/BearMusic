import { chromium } from "playwright";
import { writeFile } from 'fs/promises';

export async function downloadSampleAudio(trackId: string, AudioA: any) {
    const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
    const context = await browser.newContext();
    const playerPage = await context.newPage();
    await playerPage.goto('https://music.bugs.co.kr/newPlayer');

    const audioPromise: any = new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
        playerPage.on('response', async (response) => {
            if (response.url().startsWith('https://w-aod.bugs.co.kr/raout')) {
                const buffer = await response.body();
                clearTimeout(timeout);
                await browser.close()
                resolve(buffer.toString('base64'));
            }
        });
    });

    const trackPage = await context.newPage();
    await trackPage.goto(`https://music.bugs.co.kr/track/${trackId}`);
    await trackPage.evaluate(() => { window.open = () => null; });
    const selector = '#container > section.sectionPadding.summaryInfo.summaryTrack > div > div.basicInfo > p > a:nth-child(1)';
    await trackPage.waitForSelector(selector);
    await trackPage.click(selector);

    const base64 = await audioPromise;
    await writeFile(AudioA.path, Buffer.from(base64, 'base64'));
}