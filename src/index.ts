import { imageService  } from './services/imageService'

(async()=>{
    const dd = new imageService()

    const color = (await dd.extractPastelColors("https://image.bugsm.co.kr/album/images/original/9968/996863.jpg?version=undefined"))

})();