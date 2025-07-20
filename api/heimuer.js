/**
 * 黑木耳代理端点
 * 代理到 https://www.heimuer.tv
 */

import { createProxyHandler } from './utils/proxy-utils.js';

export default createProxyHandler('https://www.heimuer.tv');
