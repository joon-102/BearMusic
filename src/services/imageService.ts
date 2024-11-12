import Vibrant from 'node-vibrant';

export class imageService {

    private adjustToPastel(rgb: number[]): number[] {
        const [r, g, b] = rgb;
        return [Math.min(255, r + (255 - r) * 0.4), Math.min(255, g + (255 - g) * 0.4), Math.min(255, b + (255 - b) * 0.4)]
    }

    private contrast(rgb: number[], color: number[]) {
        const lum1 = 0.2126 * Math.pow(rgb[0] / 255, 2.2) + 0.7152 * Math.pow(rgb[1] / 255, 2.2) + 0.0722 * Math.pow(rgb[2] / 255, 2.2);
        const lum2 = 0.2126 * Math.pow(color[0] / 255, 2.2) + 0.7152 * Math.pow(color[1] / 255, 2.2) + 0.0722 * Math.pow(color[2] / 255, 2.2);
        return (lum1 + 0.05) / (lum2 + 0.05);
    }

    private toRgbString = (color: [number, number, number]): string => {
        return `rgb(${Math.round(color[0])}, ${Math.round(color[1])}, ${Math.round(color[2])})`;
    };

    async extractPastelColors(imgSrc: string): Promise<any> {
        const palette: any = await Vibrant.from(imgSrc).getPalette();

        if (palette && palette.Vibrant && palette.Muted) {
            let startColor = palette.LightVibrant ? palette.LightVibrant.getRgb() : palette.Vibrant.getRgb();
            let endColor = palette.DarkVibrant ? palette.DarkVibrant.getRgb() : palette.Muted.getRgb();

            startColor = this.adjustToPastel(startColor);
            endColor = this.adjustToPastel(endColor);

            const white = [255, 255, 255];

            const contrast1 = this.contrast(startColor, white);
            const contrast2 = this.contrast(endColor, white);

            return {
                startColor: (contrast1 > contrast2 ? startColor : endColor),
                endColor: (contrast1 > contrast2 ? endColor : startColor)
            };
        }
        return null;
    }
};
