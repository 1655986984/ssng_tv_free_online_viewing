# Vercel Edge Functions 迁移说明

## 概述

本次重构将原有的 Vercel 路由代理配置迁移为使用 Edge Functions 实现，提供更好的性能、更灵活的控制和更强的功能。

## 主要变化

### 1. 架构变化

**之前 (路由代理):**
```json
{
  "routes": [
    { "src": "/api/api.php/(.*)", "dest": "https://www.heimuer.tv/api.php/$1" },
    { "src": "/ikun/(.*)", "dest": "https://ikunzy.net/$1" }
  ]
}
```

**现在 (Edge Functions):**
```json
{
  "functions": {
    "api/api.js": { "runtime": "edge" },
    "api/ikun.js": { "runtime": "edge" }
  },
  "routes": [
    { "src": "/api/api.php/(.*)", "dest": "/api/api" },
    { "src": "/ikun/(.*)", "dest": "/api/ikun" }
  ]
}
```

### 2. 新增文件

- `api/_proxy-utils.js` - 通用代理工具函数
- `api/api.js` - 处理 `/api/api.php/*` 路径的 Edge Function
- `api/ikun.js` - 处理 `/ikun/*` 路径的 Edge Function
- `api/subo.js` - 处理 `/subo/*` 路径的 Edge Function
- `api/huawei.js` - 处理 `/huawei/*` 路径的 Edge Function
- `api/jisu.js` - 处理 `/jisu/*` 路径的 Edge Function
- `api/360.js` - 处理 `/360/*` 路径的 Edge Function
- `api/wolong.js` - 处理 `/wolong/*` 路径的 Edge Function

### 3. 代理映射

| 路径前缀 | 目标服务器 | Edge Function |
|---------|-----------|---------------|
| `/api/api.php/*` | `https://www.heimuer.tv/api.php/*` | `api/api.js` |
| `/ikun/*` | `https://ikunzy.net/*` | `api/ikun.js` |
| `/subo/*` | `https://www.suboziyuan.net/*` | `api/subo.js` |
| `/huawei/*` | `https://cjhwba.com/*` | `api/huawei.js` |
| `/jisu/*` | `https://www.jisuzy.com/*` | `api/jisu.js` |
| `/360/*` | `https://360zy5.com/*` | `api/360.js` |
| `/wolong/*` | `https://wolongzyw.com/*` | `api/wolong.js` |

## Edge Functions 优势

### 1. 性能提升
- **更快的冷启动**: Edge Functions 启动速度比传统 Serverless Functions 快
- **全球分布**: 在 Vercel 的全球边缘网络上运行，延迟更低
- **流式响应**: 支持流式处理大型响应

### 2. 更好的控制
- **自定义头部处理**: 可以精确控制请求和响应头部
- **错误处理**: 提供详细的错误信息和日志
- **CORS 支持**: 内置完整的 CORS 支持

### 3. 增强功能
- **请求修改**: 可以在代理前修改请求
- **响应处理**: 可以在返回前处理响应
- **缓存控制**: 可以设置自定义缓存策略

## 技术实现

### 通用代理函数 (`_proxy-utils.js`)

```javascript
export async function createProxy(request, targetHost, pathPrefix) {
  // 1. 处理 OPTIONS 预检请求
  // 2. 清理和设置请求头部
  // 3. 发送代理请求
  // 4. 处理响应头部
  // 5. 添加 CORS 支持
  // 6. 错误处理
}
```

### 功能特性

1. **头部清理**: 自动移除可能导致问题的头部
2. **CORS 支持**: 添加完整的 CORS 头部
3. **错误处理**: 提供详细的错误信息
4. **安全性**: 移除敏感的安全头部以避免冲突

## 部署说明

### 1. 自动部署
推送到 Git 仓库后，Vercel 会自动检测 Edge Functions 并部署。

### 2. 验证部署
部署完成后，可以通过以下方式验证：

```bash
# 测试 API 代理
curl https://your-domain.vercel.app/api/api.php/some-endpoint

# 测试其他代理
curl https://your-domain.vercel.app/ikun/some-path
```

### 3. 监控和日志
- 在 Vercel Dashboard 中查看函数日志
- 监控函数执行时间和错误率
- 查看边缘网络分布情况

## 兼容性

### 保持兼容
- 所有现有的 API 路径保持不变
- 客户端代码无需修改
- 响应格式和状态码保持一致

### 改进之处
- 更好的错误处理和错误信息
- 完整的 CORS 支持
- 更快的响应时间
- 更详细的日志记录

## 故障排除

### 常见问题

1. **CORS 错误**: Edge Functions 已内置完整 CORS 支持
2. **头部冲突**: 自动清理可能导致问题的头部
3. **超时**: Edge Functions 有更长的执行时间限制

### 调试方法

1. 查看 Vercel Dashboard 中的函数日志
2. 使用浏览器开发者工具检查网络请求
3. 检查响应头部是否正确设置

## 未来扩展

Edge Functions 架构为未来功能扩展提供了基础：

1. **缓存策略**: 可以添加智能缓存
2. **请求限制**: 可以实现速率限制
3. **数据转换**: 可以在代理过程中转换数据
4. **认证**: 可以添加认证和授权逻辑
5. **监控**: 可以添加详细的监控和分析

## 总结

通过迁移到 Edge Functions，我们获得了：
- ✅ 更好的性能和更低的延迟
- ✅ 更强的功能和更灵活的控制
- ✅ 更好的错误处理和调试能力
- ✅ 完整的 CORS 支持
- ✅ 为未来功能扩展奠定基础

同时保持了：
- ✅ 完全的向后兼容性
- ✅ 相同的 API 接口
- ✅ 无需客户端代码修改
