/**
 * 华为资源代理端点
 * 代理到 https://cjhwba.com
 */

import { createProxyHandler } from './utils/proxy-utils.js';

export default createProxyHandler('https://cjhwba.com');
