/**
 * 通用代理函数，用于处理HTTP请求代理
 * @param {Request} request - 原始请求
 * @param {string} targetHost - 目标主机
 * @param {string} pathPrefix - 要移除的路径前缀
 * @returns {Promise<Response>} 代理响应
 */
export async function createProxy(request, targetHost, pathPrefix) {
  const url = new URL(request.url)
  const path = url.pathname.replace(pathPrefix, '')
  const targetUrl = `${targetHost}${path}${url.search}`

  try {
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // 创建代理请求头
    const proxyHeaders = new Headers()
    
    // 复制原始请求头，但排除一些可能导致问题的头部
    const excludeHeaders = new Set([
      'host',
      'origin',
      'referer',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
      'x-real-ip',
      'cf-connecting-ip',
      'cf-ipcountry',
      'cf-ray',
      'cf-visitor',
    ])

    for (const [key, value] of request.headers.entries()) {
      if (!excludeHeaders.has(key.toLowerCase())) {
        proxyHeaders.set(key, value)
      }
    }

    // 设置目标主机相关头部
    const targetHostname = new URL(targetHost).hostname
    proxyHeaders.set('host', targetHostname)
    proxyHeaders.set('origin', targetHost)
    proxyHeaders.set('referer', targetHost + '/')

    // 创建代理请求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    })

    // 发送代理请求
    const response = await fetch(proxyRequest)
    
    // 创建响应头
    const responseHeaders = new Headers()
    
    // 复制响应头，但排除一些可能导致问题的头部
    const excludeResponseHeaders = new Set([
      'x-frame-options',
      'content-security-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-xss-protection',
      'referrer-policy',
    ])

    for (const [key, value] of response.headers.entries()) {
      if (!excludeResponseHeaders.has(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    }

    // 添加CORS头部
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, User-Agent')
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Date, Server')

    // 创建代理响应
    const proxyResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })

    return proxyResponse
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response(JSON.stringify({ 
      error: 'Proxy request failed',
      message: error.message,
      target: targetUrl 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}
