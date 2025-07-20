/**
 * 代理工具函数
 * 提供通用的代理处理逻辑
 */

// 允许的请求头
const ALLOWED_HEADERS = [
  'accept',
  'accept-encoding',
  'accept-language',
  'authorization',
  'cache-control',
  'content-length',
  'content-type',
  'cookie',
  'origin',
  'pragma',
  'referer',
  'user-agent',
  'x-requested-with'
];

// 允许的响应头
const ALLOWED_RESPONSE_HEADERS = [
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-headers',
  'access-control-allow-methods',
  'cache-control',
  'content-encoding',
  'content-length',
  'content-type',
  'date',
  'etag',
  'expires',
  'last-modified',
  'server',
  'set-cookie',
  'vary'
];

/**
 * 处理CORS预检请求
 */
function handleCORS(req, res) {
  const origin = req.headers.origin;
  
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

/**
 * 过滤请求头
 */
function filterHeaders(headers, allowedHeaders) {
  const filtered = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (allowedHeaders.includes(lowerKey)) {
      // 特殊处理host头
      if (lowerKey === 'host') {
        continue; // 让fetch自动设置正确的host
      }
      filtered[key] = value;
    }
  }
  
  return filtered;
}

/**
 * 构建目标URL
 */
function buildTargetUrl(baseUrl, req) {
  // 获取路径参数
  const pathMatch = req.url.match(/^\/api\/[^\/]+(.*)$/);
  const path = pathMatch ? pathMatch[1] : '';
  
  let targetUrl = baseUrl + path;
  
  // 添加查询参数
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  if (urlObj.search) {
    targetUrl += urlObj.search;
  }
  
  return targetUrl;
}

/**
 * 创建代理处理器
 */
export function createProxyHandler(targetBaseUrl) {
  return async function handler(req, res) {
    try {
      // 处理CORS
      if (handleCORS(req, res)) {
        return;
      }
      
      // 构建目标URL
      const targetUrl = buildTargetUrl(targetBaseUrl, req);
      
      // 过滤请求头
      const filteredHeaders = filterHeaders(req.headers, ALLOWED_HEADERS);
      
      // 构建fetch选项
      const fetchOptions = {
        method: req.method,
        headers: filteredHeaders,
        redirect: 'follow'
      };
      
      // 处理请求体
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        if (typeof req.body === 'string') {
          fetchOptions.body = req.body;
        } else {
          fetchOptions.body = JSON.stringify(req.body);
        }
      }
      
      console.log(`Proxying ${req.method} ${targetUrl}`);
      
      // 发起代理请求
      const response = await fetch(targetUrl, fetchOptions);
      
      // 设置响应状态
      res.status(response.status);
      
      // 复制响应头
      for (const [key, value] of response.headers.entries()) {
        if (ALLOWED_RESPONSE_HEADERS.includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }
      
      // 确保CORS头存在
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // 处理响应体
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        res.json(data);
      } else if (contentType.includes('text/')) {
        const text = await response.text();
        res.send(text);
      } else {
        // 处理二进制数据
        const buffer = await response.arrayBuffer();
        res.send(Buffer.from(buffer));
      }
      
    } catch (error) {
      console.error('Proxy error:', error);
      
      // 确保CORS头存在
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      res.status(500).json({ 
        error: 'Proxy request failed', 
        message: error.message 
      });
    }
  };
}
