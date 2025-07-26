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

  let targetUrl = '';
  if (url.startsWith('/api/api.php/provide/vod/')) {
    targetUrl = `https://www.heimuer.tv${url}`;
  } else if (url.startsWith('/api/')) {
    targetUrl = `https://www.heimuer.tv${url}`;
  } else if (url.startsWith('/ikun/')) {
    targetUrl = `https://ikunzy.net${url}`;
  } else if (url.startsWith('/subo/')) {
    targetUrl = `https://www.suboziyuan.net${url}`;
  } else if (url.startsWith('/huawei/')) {
    targetUrl = `https://cjhwba.com${url}`;
  } else if (url.startsWith('/jisu/')) {
    targetUrl = `https://www.jisuzy.com${url}`;
  } else if (url.startsWith('/360/')) {
    targetUrl = `https://360zy5.com${url}`;
  } else if (url.startsWith('/wolong/')) {
    targetUrl = `https://wolongzyw.com${url}`;
  } else {
    return res.status(404).json({ message: 'Not Found' });
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
      url: targetUrl,
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
    console.error('Proxy error:', error.message);
    if (error.response) {
      // 目标服务器返回的错误响应
      res.status(error.response.status).send(error.response.data);
    } else if (error.request) {
      // 请求已发出但没有收到响应
      res.status(500).json({ message: 'No response from target server', error: error.message });
    } else {
      // 其他错误
      res.status(500).json({ message: 'Error during proxy request', error: error.message });
    }
  }
}