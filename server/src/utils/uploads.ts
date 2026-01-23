import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'uploads');

export const getUploadsDir = () => UPLOAD_DIR;

export const ensureUploadsDir = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
};

export const saveDataUrl = async (dataUrl: string) => {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid data URL');
  }
  const mime = match[1];
  const ext = mime.split('/')[1] || 'png';
  const buffer = Buffer.from(match[2], 'base64');
  const filename = `${randomUUID()}.${ext}`;
  await ensureUploadsDir();
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return { filename, mime };
};
