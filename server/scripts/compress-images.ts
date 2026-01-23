import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TESTIMAGES_DIR = join(__dirname, '../testimages');

// 压缩配置
const COMPRESSION_CONFIG = {
  jpeg: {
    quality: 80,
    mozjpeg: true,
  },
  png: {
    quality: 80,
    compressionLevel: 9,
  },
  maxWidth: 1920, // 最大宽度
  maxHeight: 1920, // 最大高度
};

async function getImageFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getImageFiles(fullPath)));
    } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function compressImage(filePath: string): Promise<void> {
  try {
    const originalStats = await stat(filePath);
    const originalSize = originalStats.size;

    const image = sharp(filePath);
    const metadata = await image.metadata();

    // 调整尺寸（如果超过最大尺寸）
    let resized = image;
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > COMPRESSION_CONFIG.maxWidth ||
        metadata.height > COMPRESSION_CONFIG.maxHeight)
    ) {
      resized = image.resize(COMPRESSION_CONFIG.maxWidth, COMPRESSION_CONFIG.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // 根据格式压缩
    const ext = filePath.toLowerCase();
    if (ext.endsWith('.png')) {
      await resized
        .png({
          quality: COMPRESSION_CONFIG.png.quality,
          compressionLevel: COMPRESSION_CONFIG.png.compressionLevel,
        })
        .toFile(filePath + '.tmp');
    } else {
      await resized
        .jpeg({
          quality: COMPRESSION_CONFIG.jpeg.quality,
          mozjpeg: COMPRESSION_CONFIG.jpeg.mozjpeg,
        })
        .toFile(filePath + '.tmp');
    }

    // 检查压缩后的大小
    const compressedStats = await stat(filePath + '.tmp');
    const compressedSize = compressedStats.size;

    // 只有压缩后更小才替换
    if (compressedSize < originalSize) {
      const { rename, unlink } = await import('fs/promises');
      await unlink(filePath);
      await rename(filePath + '.tmp', filePath);

      const savedKB = ((originalSize - compressedSize) / 1024).toFixed(2);
      const savedPercent = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
      console.log(
        `✓ ${filePath.replace(TESTIMAGES_DIR, '')}: ${(originalSize / 1024).toFixed(
          2
        )}KB → ${(compressedSize / 1024).toFixed(2)}KB (节省 ${savedKB}KB, ${savedPercent}%)`
      );
    } else {
      const { unlink } = await import('fs/promises');
      await unlink(filePath + '.tmp');
      console.log(`⊘ ${filePath.replace(TESTIMAGES_DIR, '')}: 已是最优大小，跳过`);
    }
  } catch (error) {
    console.error(`✗ 压缩失败 ${filePath}:`, error);
  }
}

async function main() {
  console.log('🔍 扫描图片文件...\n');
  const imageFiles = await getImageFiles(TESTIMAGES_DIR);
  console.log(`找到 ${imageFiles.length} 张图片\n`);

  console.log('🗜️  开始压缩...\n');
  for (const file of imageFiles) {
    await compressImage(file);
  }

  console.log('\n✅ 压缩完成！');
}

main().catch(console.error);
