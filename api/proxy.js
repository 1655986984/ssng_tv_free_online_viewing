/**
 * 通用代理函数
 * 支持多个目标服务器的代理转发
 */

// 代理目标配置
const PROXY_TARGETS = {
  'heimuer': 'https://www.heimuer.tv',
  'ikun': 'https://ikunzy.net',
  'subo': 'https://www.suboziyuan.net',
  'huawei': 'https://cjhwba.com',
  'jisu': 'https://www.jisuzy.com',
  '360': 'https://360zy5.com',
  'wolong': 'https://wolongzyw.com'
};

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
  'host',
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
 * 构建目标URL
 */
function buildTargetUrl(service, path, query) {
  const baseUrl = PROXY_TARGETS[service];
  if (!baseUrl) {
    throw new Error(`Unknown service: ${service}`);
  }
  
  let targetUrl = baseUrl + path;
  
  // 添加查询参数
  if (query && Object.keys(query).length > 0) {
    const queryString = new URLSearchParams(query).toString();
    targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
  }
  
  return targetUrl;
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
 * 主代理函数
 */
export default async function handler(req, res) {
  try {
    // 处理CORS
    if (handleCORS(req, res)) {
      return;
    }
    
    // 解析路径参数
    const { service, ...pathParts } = req.query;
    const path = '/' + (pathParts['0'] || '').split('/').filter(Boolean).join('/');
    
    // 验证服务名
    if (!service || !PROXY_TARGETS[service]) {
      return res.status(400).json({ 
        error: 'Invalid service', 
        available: Object.keys(PROXY_TARGETS) 
      });
    }
    
    // 构建目标URL
    const targetUrl = buildTargetUrl(service, path, req.query);
    
    // 过滤请求头
    const filteredHeaders = filterHeaders(req.headers, ALLOWED_HEADERS);
    
    // 构建fetch选项
    const fetchOptions = {
      method: req.method,
      headers: filteredHeaders,
      redirect: 'follow'
    };
    
    // 处理请求体
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body) {
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
}
