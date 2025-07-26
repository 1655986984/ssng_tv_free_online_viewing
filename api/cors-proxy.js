import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const { url, method, headers: reqHeaders, body } = req;

  // 从请求URL中提取目标URL
  // 假设请求路径是 /api/cors-proxy?url=https://target.com/path
  const targetUrlParam = new URL(`http://localhost${url}`).searchParams.get('url');

  if (!targetUrlParam) {
    return res.status(400).json({ message: 'Missing target URL parameter.' });
  }

  // 过滤掉可能导致问题的头部，只转发必要的头部
  const filteredHeaders = {};
  const headersToForward = [
    'accept',
    'accept-encoding',
    'accept-language',
    'user-agent',
    'referer',
    'content-type',
    'x-requested-with'
  ];

  for (const key of headersToForward) {
    if (reqHeaders[key]) {
      filteredHeaders[key] = reqHeaders[key];
    }
  }

  try {
    const response = await axios({
      method: method,
      url: targetUrlParam,
      headers: filteredHeaders,
      data: body,
      responseType: 'arraybuffer' // 确保处理二进制数据
    });

    // 转发目标服务器的响应头
    for (const key in response.headers) {
      if (response.headers.hasOwnProperty(key)) {
        res.setHeader(key, response.headers[key]);
      }
    }

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('CORS proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      res.status(500).json({ message: 'No response from target server', error: error.message });
    } else {
      res.status(500).json({ message: 'Error during CORS proxy request', error: error.message });
    }
  }
}