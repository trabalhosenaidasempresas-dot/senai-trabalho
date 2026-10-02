import path from 'path';
import { fileURLToPath } from 'url';
import { APP_CONFIG } from './appConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadDirectory = path.isAbsolute(APP_CONFIG.uploadDir)
  ? APP_CONFIG.uploadDir
  : path.join(__dirname, APP_CONFIG.uploadDir);

export const uploadSettings = {
  destination: uploadDirectory,
  limits: { fileSize: APP_CONFIG.maxFileSize },
};
