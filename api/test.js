/**
 * 代理功能测试端点
 * 用于测试各个代理服务是否正常工作
 */

export default async function handler(req, res) {
  // 处理CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // 测试配置
  const testEndpoints = [
    {
      name: '黑木耳',
      service: 'heimuer',
      url: 'https://www.heimuer.tv',
      testPath: '/api/provide/vod/?ac=list&t=1&pg=1'
    },
    {
      name: 'iKun资源',
      service: 'ikun',
      url: 'https://ikunzy.net',
      testPath: '/api.php/provide/vod/?ac=list&t=1&pg=1'
    },
    {
      name: '速播资源',
      service: 'subo',
      url: 'https://www.suboziyuan.net',
      testPath: '/inc/sapi.php?ac=list&t=1&pg=1'
    },
    {
      name: '华为资源',
      service: 'huawei',
      url: 'https://cjhwba.com',
      testPath: '/inc/sapi.php?ac=list&t=1&pg=1'
    },
    {
      name: '极速资源',
      service: 'jisu',
      url: 'https://www.jisuzy.com',
      testPath: '/provide/vod/?ac=list&t=1&pg=1'
    },
    {
      name: '360资源',
      service: '360',
      url: 'https://360zy5.com',
      testPath: '/inc/sapi.php?ac=list&t=1&pg=1'
    },
    {
      name: '卧龙资源',
      service: 'wolong',
      url: 'https://wolongzyw.com',
      testPath: '/inc/sapi.php?ac=list&t=1&pg=1'
    }
  ];
  
  const results = [];
  
  // 测试每个端点
  for (const endpoint of testEndpoints) {
    const result = {
      name: endpoint.name,
      service: endpoint.service,
      url: endpoint.url,
      testPath: endpoint.testPath,
      status: 'unknown',
      responseTime: 0,
      error: null
    };
    
    try {
      const startTime = Date.now();
      
      // 测试直接访问
      const response = await fetch(endpoint.url + endpoint.testPath, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });
      
      result.responseTime = Date.now() - startTime;
      result.status = response.ok ? 'success' : 'error';
      result.statusCode = response.status;
      
      if (!response.ok) {
        result.error = `HTTP ${response.status} ${response.statusText}`;
      }
      
    } catch (error) {
      result.status = 'error';
      result.error = error.message;
      result.responseTime = Date.now() - (result.responseTime || Date.now());
    }
    
    results.push(result);
  }
  
  // 生成测试报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
      avgResponseTime: Math.round(
        results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
      )
    },
    results: results,
    proxyEndpoints: {
      direct: testEndpoints.map(e => `/api/${e.service}${e.testPath}`),
      generic: testEndpoints.map(e => `/api/proxy/${e.service}${e.testPath}`),
      legacy: testEndpoints
        .filter(e => e.service !== 'heimuer')
        .map(e => `/${e.service}${e.testPath}`)
    }
  };
  
  res.json(report);
}
