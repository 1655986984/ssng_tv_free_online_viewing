/**
 * 360资源代理端点
 * 代理到 https://360zy5.com
 */

import { createProxyHandler } from './utils/proxy-utils.js';

export default createProxyHandler('https://360zy5.com');
