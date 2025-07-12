import sharp from 'sharp';

const input = 'public/album-cover.png';           
const output = 'public/dist/album-cover.webp';  

(async () => {
    await sharp(input)
        .webp({ quality: 80 })
        .toFile(output);

    console.log(`[util] Converted image to WebP format`);
})()

