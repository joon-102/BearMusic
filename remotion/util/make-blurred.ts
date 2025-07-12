import sharp from 'sharp';

const input = 'public/album-cover.png';        
const output = 'public/dist/blurred-album-cover.webp';  

(async () => {
    const scaleFactor = 1.2;
    const blurAmount = 66;

    const metadata = await sharp(input).metadata();

    const width = Math.round(metadata.width * scaleFactor);
    const height = Math.round(metadata.height * scaleFactor);

    await sharp(input)
        .resize(width, height)    
        .blur(blurAmount)       
        .webp({ quality: 80 })
        .toFile(output);

    console.log(`[util] Blurred image saved`);
})()

