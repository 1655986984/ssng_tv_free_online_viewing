// 通用代理函数
export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { target, path } = req.query;
    
    // 目标域名映射
    const targetMap = {
      'heimuer': 'https://www.heimuer.tv',
      'ikun': 'https://ikunzy.net',
      'subo': 'https://www.suboziyuan.net',
      'huawei': 'https://cjhwba.com',
      'jisu': 'https://www.jisuzy.com',
      '360': 'https://360zy5.com',
      'wolong': 'https://wolongzyw.com'
    };

    if (!target || !targetMap[target]) {
      return res.status(400).json({ error: 'Invalid target specified' });
    }

    const baseUrl = targetMap[target];
    const targetPath = path ? `/${path}` : '/';

    // 构建完整的目标URL，包含查询参数
    const url = new URL(req.url, `https://${req.headers.host}`);
    const searchParams = new URLSearchParams(url.search);

    // 移除我们的内部参数
    searchParams.delete('target');
    searchParams.delete('path');

    // 构建最终的目标URL
    const queryString = searchParams.toString();
    const targetUrl = `${baseUrl}${targetPath}${queryString ? '?' + queryString : ''}`;

    // 构建请求选项
    const requestOptions = {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(baseUrl).host,
        origin: baseUrl,
        referer: baseUrl + '/',
      },
    };

    // 删除可能导致问题的头部
    delete requestOptions.headers['x-forwarded-for'];
    delete requestOptions.headers['x-forwarded-host'];
    delete requestOptions.headers['x-forwarded-proto'];
    delete requestOptions.headers['x-vercel-id'];
    delete requestOptions.headers['x-vercel-forwarded-url'];

    // 如果有请求体，添加到选项中
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const body = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => {
          data += chunk;
        });
        req.on('end', () => {
          resolve(data);
        });
      });
      if (body) {
        requestOptions.body = body;
      }
    }

    // 发起代理请求
    const response = await fetch(targetUrl, requestOptions);
    
    // 复制响应头
    response.headers.forEach((value, key) => {
      // 跳过一些不应该转发的头部
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // 设置状态码
    res.status(response.status);

    // 获取响应内容
    const responseBody = await response.arrayBuffer();
    
    // 发送响应
    res.end(Buffer.from(responseBody));

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message 
    });
  }
}
