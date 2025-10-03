import fs from 'fs';
import path from 'path';

/**
 * Load logo image and convert to base64
 * @returns base64 encoded logo string (data:image/png;base64,...)
 */
export function loadLogoBase64(): string {
  const logoPath = path.join(
    process.cwd(),
    'public',
    'images',
    'logo',
    'logo-full-white.png'
  );

  try {
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('[loadLogo] Failed to load logo:', error);
    return ''; // Return empty string if logo not found
  }
}
