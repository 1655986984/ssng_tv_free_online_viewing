/**
 * 速播资源代理端点
 * 代理到 https://www.suboziyuan.net
 */

import { createProxyHandler } from './utils/proxy-utils.js';

export default createProxyHandler('https://www.suboziyuan.net');
