// Cloudflare Worker - Railway 后端反向代理
// 用于提升国内用户访问 Railway 后端的速度
// 
// 部署步骤：
// 1. 登录 Cloudflare Dashboard
// 2. 进入 Workers & Pages
// 3. 创建新 Worker (从 Hello World 开始)
// 4. 将此代码复制到 Worker 编辑器
// 5. 修改下面的 RAILWAY_URL 为你的实际地址
// 6. 保存并部署
// 7. 在 Worker 设置中绑定自定义域名: api.xzr5.top

export default {
  async fetch(request, env) {
    // ⚠️ 修改为你的 Railway 后端地址
    const RAILWAY_URL = 'https://tiaozhanbeiwujielvtu-production.up.railway.app';
    
    const url = new URL(request.url);
    
    // 构建目标 URL
    const targetUrl = RAILWAY_URL + url.pathname + url.search;
    
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      });
    }
    
    // 复制请求并转发到 Railway
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });
    
    try {
      // 转发请求到 Railway
      const response = await fetch(modifiedRequest);
      
      // 复制响应
      const modifiedResponse = new Response(response.body, response);
      
      // 添加 CORS 头
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
      modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return modifiedResponse;
    } catch (error) {
      // 错误处理
      return new Response(JSON.stringify({
        error: 'Proxy Error',
        message: error.message
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
