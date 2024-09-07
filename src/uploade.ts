const { upload , update } = require('youtube-videos-uploader');
const translate = require('translate-google');

function isEnglish(text: string) {
    const englishRegex = /^[A-Za-z\s]+$/;
    return englishRegex.test(text);
}

export async function Videoupload(config: any, Search: any , track : any): Promise<void> {
    let koTitle = [Search.ko.title, Search.ko.artist];
    let enTitle = [Search.en.title, Search.en.artist];

    if (!isEnglish(enTitle[0])) {
        enTitle = [await translate(Search.en.title, { to: 'en' }), Search.en.artist];
    }

    if (!isEnglish(enTitle[1])) {
        enTitle = [Search.en.title, await translate(Search.en.artist, { to: 'en' })];
    }

    if (isEnglish(koTitle[0])) {
        koTitle = [await translate(Search.ko.title, { to: 'ko' }), Search.ko.artist];
    }

    if (isEnglish(koTitle[1])) {
        koTitle = [Search.ko.title , await translate(Search.ko.artist, { to: 'ko' }),];
    }

    let title = `${koTitle[0]}(${enTitle[0]}) - ${koTitle[1]}(${enTitle[1]})`;

    const input = [{
        path: `temp/video.mp4`,
        title: `${title} [가사/lyrics]`,
        description: `${title}`,
        language: 'korean',
        onSuccess: () => console.log(`업로드 성공!`),
        skipProcessingWait: true,
        publishType: 'PRIVATE',
        isNotForKid: true,
        uploadAsDraft: false,
    }]

    await upload(config.credentials, input, { headless: false }).then(console.log);
};

