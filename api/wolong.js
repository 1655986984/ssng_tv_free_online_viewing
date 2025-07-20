/**
 * 卧龙资源代理端点
 * 代理到 https://wolongzyw.com
 */

import { createProxyHandler } from './utils/proxy-utils.js';

export default createProxyHandler('https://wolongzyw.com');
