// 测试文化识别API的脚本
const API_BASE = 'https://tiaozhanbeiwujielvtu-production.up.railway.app';

async function testCultureAPI() {
  console.log('🔍 开始测试文化识别API...\n');
  
  // 测试1: 使用demo图片路径
  const testCases = [
    {
      name: '茶艺图片 (本地路径)',
      imageUrl: '/demo-images/tea-ceremony.jpg',
      preferences: ['传统工艺']
    },
    {
      name: '灯笼图片 (本地路径)',
      imageUrl: '/demo-images/lantern-festival.jpg',
      preferences: ['节庆']
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 测试: ${testCase.name}`);
    console.log(`   图片路径: ${testCase.imageUrl}`);
    
    try {
      const response = await fetch(`${API_BASE}/ai/culture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testCase.imageUrl,
          preferences: testCase.preferences
        })
      });

      const data = await response.json();
      
      console.log(`   ✅ 状态码: ${response.status}`);
      console.log(`   📦 响应数据:`);
      
      if (data.data) {
        const result = data.data.result || data.data;
        console.log(`      - 识别元素: ${result.elements?.join(', ') || '无'}`);
        console.log(`      - 解读数量: ${result.insights?.length || 0}`);
        console.log(`      - 提示数量: ${result.tips?.length || 0}`);
        
        if (data.data.warning) {
          console.log(`      ⚠️  警告: ${data.data.warning}`);
        }
        
        if (data.data.raw) {
          console.log(`      📄 原始响应长度: ${data.data.raw.length} 字符`);
        }
      } else {
        console.log(`      ❌ 响应格式异常:`, JSON.stringify(data, null, 2));
      }
      
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
    }
  }
  
  console.log('\n\n✨ 测试完成！');
}

testCultureAPI();
