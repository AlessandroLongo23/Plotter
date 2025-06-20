export const fromHexToRgb = (hex) => {
    // Remove # if present and validate
    const cleanHex = hex.replace('#', '');
    
    // Handle 3-digit hex (e.g., #RGB -> #RRGGBB)
    const fullHex = cleanHex.length === 3 
        ? cleanHex.split('').map(char => char + char).join('')
        : cleanHex;
    
    if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
        throw new Error('Invalid hex color format');
    }
    
    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);
    
    return {
        r: r,
        g: g,
        b: b
    }
}

export const fromHexToHsl = (hex) => {
    const rgb = fromHexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    return hsl;
}

export const rgbToHsl = (rgb) => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    const l = (max + min) / 2;
    const d = max - min;

    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

    let h = 0;
    if (d !== 0) {
        if (r === max) {
            h = (g - b) / d;
        } else if (g === max) {
            h = 2 + (b - r) / d;
        } else {
            h = 4 + (r - g) / d;
        }
        h *= 60;
        
        // Ensure hue is positive (0-360 range)
        if (h < 0) {
            h += 360;
        }
    }

    return {
        x: Math.round(h),
        y: Math.round(s * 100),
        z: Math.round(l * 100)
    }
}