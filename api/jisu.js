/**
 * 极速资源代理端点
 * 代理到 https://www.jisuzy.com
 */

import { createProxyHandler } from './utils/proxy-utils.js';

export default createProxyHandler('https://www.jisuzy.com');
