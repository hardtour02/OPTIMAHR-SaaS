import { PaletteColors } from '../types';

const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 0];
    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s, l];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        h /= 360;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbArrayToString = (rgb: [number, number, number]): string => `${rgb[0]} ${rgb[1]} ${rgb[2]}`;

const rotateHue = (hsl: [number, number, number], degrees: number): [number, number, number] => {
    const [h, s, l] = hsl;
    return [(h + degrees) % 360, s, l];
};

export const generatePalettes = (primaryHex: string) => {
    const primaryRgb = hexToRgb(primaryHex);
    const primaryHsl = rgbToHsl(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    const [h, s, l] = primaryHsl;

    const secondaryHsl = rotateHue(primaryHsl, 150);

    const generatePalette = (mode: 'light' | 'dark'): PaletteColors => {
        const isLight = mode === 'light';
        
        // Ensure primary color has enough contrast
        const primaryLightness = isLight ? Math.min(0.6, Math.max(0.4, l)) : Math.min(0.7, Math.max(0.5, l));
        const finalPrimaryHsl: [number, number, number] = [h, s, primaryLightness];
        const finalSecondaryHsl: [number, number, number] = [secondaryHsl[0], secondaryHsl[1], primaryLightness];

        return {
            '--color-primary': rgbArrayToString(hslToRgb(...finalPrimaryHsl)),
            '--color-secondary': rgbArrayToString(hslToRgb(...finalSecondaryHsl)),
            
            '--color-background': isLight ? '245 245 245' : '18 18 18',
            '--color-surface': isLight ? '255 255 255' : '33 33 33',
            '--color-on-surface': isLight ? '33 33 33' : '245 245 245',
            '--color-on-surface-variant': isLight ? '117 117 117' : '189 189 189',
            
            '--color-error': '229 57 53',
            '--color-alert': '251 140 0',
            '--color-success': '102 187 106',
            '--color-info': '100 181 246',

            '--color-primary-dark-hover': rgbArrayToString(hslToRgb(finalPrimaryHsl[0], finalPrimaryHsl[1], finalPrimaryHsl[2] * 0.8)),
            '--color-secondary-dark-hover': rgbArrayToString(hslToRgb(finalSecondaryHsl[0], finalSecondaryHsl[1], finalSecondaryHsl[2] * 0.8)),
            '--color-primary-light-hover': isLight 
                ? rgbArrayToString(hslToRgb(finalPrimaryHsl[0], finalPrimaryHsl[1] * 0.5, 0.95))
                : rgbArrayToString(hslToRgb(finalPrimaryHsl[0], finalPrimaryHsl[1] * 0.5, 0.20)),
            
            '--color-neutral-border': isLight ? '189 189 189' : '66 66 66',
            '--color-table-row-striped': isLight ? '250 250 250' : '42 42 42',
        };
    };
    
    return {
        light: generatePalette('light'),
        dark: generatePalette('dark'),
    };
};
