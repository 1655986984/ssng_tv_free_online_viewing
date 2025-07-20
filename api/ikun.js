/**
 * iKun资源代理端点
 * 代理到 https://ikunzy.net
 */

import { createProxyHandler } from './utils/proxy-utils.js';

export default createProxyHandler('https://ikunzy.net');
