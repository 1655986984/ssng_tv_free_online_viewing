# Serverless Functions 代理架构

本项目已从Vercel路由重写迁移到Serverless Functions实现，提供更好的性能和可维护性。

## 架构概述

### 代理端点

每个资源站都有对应的Serverless Function端点：

- `/api/heimuer/*` → `https://www.heimuer.tv/*`
- `/api/ikun/*` → `https://ikunzy.net/*`
- `/api/subo/*` → `https://www.suboziyuan.net/*`
- `/api/huawei/*` → `https://cjhwba.com/*`
- `/api/jisu/*` → `https://www.jisuzy.com/*`
- `/api/360/*` → `https://360zy5.com/*`
- `/api/wolong/*` → `https://wolongzyw.com/*`

### 兼容性路由

为了保持向后兼容，以下路由仍然有效：

- `/ikun/*` → `/api/ikun/*`
- `/subo/*` → `/api/subo/*`
- `/huawei/*` → `/api/huawei/*`
- `/jisu/*` → `/api/jisu/*`
- `/360/*` → `/api/360/*`
- `/wolong/*` → `/api/wolong/*`

### 通用代理端点

还提供了一个通用代理端点：

- `/api/proxy/{service}/{path}` - 通过service参数指定目标服务

支持的服务名：`heimuer`, `ikun`, `subo`, `huawei`, `jisu`, `360`, `wolong`

## 功能特性

### CORS支持
- 自动处理跨域请求
- 支持预检请求(OPTIONS)
- 动态设置允许的源

### 请求转发
- 完整的HTTP方法支持(GET, POST, PUT, DELETE等)
- 请求头过滤和转发
- 查询参数保持
- 请求体转发

### 响应处理
- 状态码透传
- 响应头过滤和转发
- 支持JSON、文本和二进制数据
- 自动内容类型检测

### 错误处理
- 详细的错误日志
- 友好的错误响应
- 超时和网络错误处理

## 文件结构

```
api/
├── README.md              # 本文档
├── proxy.js              # 通用代理函数
├── heimuer.js            # 黑木耳代理端点
├── ikun.js               # iKun资源代理端点
├── subo.js               # 速播资源代理端点
├── huawei.js             # 华为资源代理端点
├── jisu.js               # 极速资源代理端点
├── 360.js                # 360资源代理端点
├── wolong.js             # 卧龙资源代理端点
└── utils/
    └── proxy-utils.js    # 代理工具函数
```

## 使用示例

### 直接访问代理端点
```javascript
// 获取黑木耳资源
fetch('/api/heimuer/api/provide/vod/')

// 获取iKun资源
fetch('/api/ikun/api.php/provide/vod/')

// 获取速播资源
fetch('/api/subo/inc/sapi.php')
```

### 使用通用代理端点
```javascript
// 通过通用端点访问
fetch('/api/proxy/heimuer/api/provide/vod/')
fetch('/api/proxy/ikun/api.php/provide/vod/')
fetch('/api/proxy/subo/inc/sapi.php')
```

### 兼容性路由
```javascript
// 旧的路由仍然有效
fetch('/ikun/api.php/provide/vod/')
fetch('/subo/inc/sapi.php')
```

## 配置说明

### vercel.json配置

```json
{
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/heimuer/(.*)", "dest": "/api/heimuer" },
    { "src": "/ikun/(.*)", "dest": "/api/ikun" },
    // ... 其他路由
  ]
}
```

### 环境变量

目前不需要额外的环境变量配置，所有目标URL都硬编码在代码中。

## 性能优化

1. **函数复用**: 使用工具函数减少代码重复
2. **头部过滤**: 只转发必要的请求和响应头
3. **错误处理**: 快速失败和详细日志
4. **CORS缓存**: 设置适当的CORS缓存时间

## 监控和调试

### 日志
所有代理请求都会记录到Vercel函数日志中：
```
Proxying GET https://www.heimuer.tv/api/provide/vod/
```

### 错误响应
```json
{
  "error": "Proxy request failed",
  "message": "详细错误信息"
}
```

## 迁移说明

从路由重写迁移到Serverless Functions的主要变化：

1. **URL变化**: `/api/*` 现在指向黑木耳，而不是通用代理
2. **新端点**: 每个服务都有独立的端点
3. **通用代理**: 新增 `/api/proxy/{service}/*` 端点
4. **向后兼容**: 保持了原有的路由映射

## 故障排除

### 常见问题

1. **CORS错误**: 检查请求头和响应头设置
2. **404错误**: 确认路由配置正确
3. **超时错误**: 检查目标服务器状态
4. **编码问题**: 确认内容类型处理

### 调试步骤

1. 检查Vercel函数日志
2. 验证目标URL可访问性
3. 测试CORS设置
4. 检查请求头过滤
