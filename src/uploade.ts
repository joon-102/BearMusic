const { upload } = require('youtube-videos-uploader')

export async function Videoupload(config : any ,  Search: any): Promise<void> {
    await upload(
        config.credentials ,
        [{ 
            path: `archive/${Search.ko.title}.mp4`, 
            title: `${Search.ko.title}(${Search.en.title}) - ${Search.ko.artist}(${Search.en.artist})  [가사/lyrics]`, 
            description: `${Search.ko.title}(${Search.en.title}) - ${Search.ko.artist}(${Search.en.artist})`, 
            language: 'korean', 
            onSuccess: ()=>{
                console.log("업로드 성공!")
            }, 
            skipProcessingWait: true ,
            publishType: 'PRIVATE', 
            isNotForKid: false,
            uploadAsDraft: false,
        }], {headless:false} 
    ).then(console.log)
}