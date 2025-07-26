// Vercel API处理函数
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // 获取请求路径
  const { url } = req;

  // 根据路径处理不同的API请求
  if (url.startsWith('/api/')) {
    // 转发到heimuer.tv
    const targetUrl = `https://www.heimuer.tv${url.replace('/api', '')}`;
    return res.status(200).json({
      url: targetUrl,
      message: 'API proxy is working'
    });
  }

  // 默认响应
  res.status(200).json({
    message: 'API is working',
    path: url
  });
}