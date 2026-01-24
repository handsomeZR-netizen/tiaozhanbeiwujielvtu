import OSS from 'ali-oss';

const getOSSClient = () => {
  // @ts-ignore - ali-oss uses CommonJS exports
  return new OSS({
    region: process.env.ALIYUN_OSS_REGION || 'oss-ap-southeast-1',
    accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY_ID!,
    accessKeySecret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
    bucket: process.env.ALIYUN_OSS_BUCKET!,
  });
};

export const uploadImageToOSS = async (
  buffer: Buffer | ArrayBuffer,
  filename: string
): Promise<string> => {
  const client = getOSSClient();
  const key = `posters/${filename}`;
  
  try {
    const result = await client.put(key, Buffer.from(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
    
    // 强制返回 HTTPS URL（修复 Mixed Content 问题）
    const httpsUrl = result.url.replace(/^http:\/\//i, 'https://');
    console.log('✅ Image uploaded successfully:', httpsUrl);
    return httpsUrl;
  } catch (error) {
    console.error('❌ Failed to upload to OSS:', error);
    throw error;
  }
};

export const uploadBase64ToOSS = async (
  base64: string,
  filename: string
): Promise<string> => {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  return uploadImageToOSS(buffer, filename);
};

export const deleteFromOSS = async (filename: string): Promise<void> => {
  const client = getOSSClient();
  const key = `posters/${filename}`;
  
  try {
    await client.delete(key);
  } catch (error) {
    console.error('Failed to delete from OSS:', error);
    // 不抛出错误，删除失败不影响主流程
  }
};
