import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 使用新的 PPT 专用 API Key
const ARK_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
const PPT_ARK_API_KEY = '7041e3a8-18c7-4949-8641-7bbd82cc17ab';
const NEGATIVE_PROMPT = '不要文字，不要水印，不要logo，不要二维码，不要畸形手指，不要多余肢体，不要模糊，不要低清，不要过曝，不要血腥暴力，不要政治敏感标识';

async function testAPI() {
  console.log('测试 PPT 专用 API Key...\n');
  console.log(`API Base: ${ARK_BASE}`);
  console.log(`API Key: ${PPT_ARK_API_KEY.substring(0, 20)}...`);
  console.log(`负面提示词: ${NEGATIVE_PROMPT}\n`);

  const testPrompt = '16:9，新中式科技风，简单测试图片，纸纹质感背景，留白，无文字无logo';
  const fullPrompt = `${testPrompt}。${NEGATIVE_PROMPT}`;

  console.log(`测试提示词: ${testPrompt}\n`);

  try {
    console.log('发送请求...');
    const response = await fetch(`${ARK_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PPT_ARK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'doubao-seedream-4-5-251128',
        prompt: fullPrompt,
        response_format: 'url',
        size: '2K',
        sequential_image_generation: 'disabled',
        watermark: false,
        stream: false,
      }),
    });

    console.log(`响应状态: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 请求失败:');
      console.error(errorText);
      process.exit(1);
    }

    const result = await response.json();
    console.log('✅ API 测试成功！\n');
    console.log('响应数据:');
    console.log(JSON.stringify(result, null, 2));

    if (result?.data?.[0]?.url) {
      console.log('\n图片 URL:');
      console.log(result.data[0].url);
      console.log('\n✅ API 配置正确，可以开始生成 PPT 图片！');
    } else {
      console.log('\n⚠️  警告: 响应格式异常，未找到图片 URL');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testAPI();
