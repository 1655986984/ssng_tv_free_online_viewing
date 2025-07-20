# Vercel Serverless Functions 迁移说明

## 概述

本次重构将原有的Vercel路由重写代理改为使用Serverless Functions实现，提供更好的性能、错误处理和可维护性。

## 主要变化

### 1. 架构变更

**之前 (路由重写)**:
```json
{
  "src": "/api/(.*)", 
  "dest": "https://www.heimuer.tv/$1"
}
```

**现在 (Serverless Functions)**:
```json
{
  "src": "/api/(.*)", 
  "dest": "/api/proxy?target=heimuer&path=$1"
}
```

### 2. 新增文件

- `api/proxy.js` - 通用代理Serverless Function

### 3. 删除文件

- 删除了之前创建的单独API函数文件（heimuer.js, ikun.js等）
- 使用统一的代理函数处理所有请求

### 4. 代理映射

| 原路径 | 目标域名 | 新路径 |
|--------|----------|--------|
| `/api/*` | `https://www.heimuer.tv` | `/api/proxy?target=heimuer&path=*` |
| `/ikun/*` | `https://ikunzy.net` | `/api/proxy?target=ikun&path=*` |
| `/subo/*` | `https://www.suboziyuan.net` | `/api/proxy?target=subo&path=*` |
| `/huawei/*` | `https://cjhwba.com` | `/api/proxy?target=huawei&path=*` |
| `/jisu/*` | `https://www.jisuzy.com` | `/api/proxy?target=jisu&path=*` |
| `/360/*` | `https://360zy5.com` | `/api/proxy?target=360&path=*` |
| `/wolong/*` | `https://wolongzyw.com` | `/api/proxy?target=wolong&path=*` |

## 技术优势

### 1. 更好的错误处理
- 统一的错误处理逻辑
- 详细的错误日志
- 优雅的错误响应

### 2. CORS支持
- 自动处理CORS预检请求
- 设置适当的CORS头部
- 支持跨域请求

### 3. 请求头处理
- 自动设置目标域名的请求头
- 清理可能导致问题的Vercel特定头部
- 保持原始请求的完整性

### 4. 性能优化
- 使用Node.js 18.x运行时
- 支持所有HTTP方法（GET, POST, PUT, DELETE等）
- 流式处理大文件

## 配置说明

### vercel.json 配置

```json
{
  "functions": {
    "api/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/(.*)", "dest": "/api/proxy?target=heimuer&path=$1" },
    // ... 其他路由
  ]
}
```

### 代理函数特性

- **目标映射**: 通过`target`参数指定目标域名
- **路径转发**: 通过`path`参数转发原始路径
- **请求体支持**: 支持POST/PUT等带请求体的方法
- **响应流**: 直接转发响应内容和头部

## 前端兼容性

前端代码无需修改，所有现有的API调用路径保持不变：

```javascript
// 这些调用方式保持不变
axios.get('/api/api.php/provide/vod/')
axios.get('/ikun/some-path')
axios.get('/subo/some-path')
// ... 等等
```

## 部署说明

1. 确保`api/proxy.js`文件存在
2. 更新后的`vercel.json`配置正确
3. 部署到Vercel后，所有代理功能将自动生效

## 监控和调试

- 在Vercel Dashboard中可以查看函数日志
- 错误会记录在函数日志中
- 支持实时监控和性能分析

## 未来扩展

如需添加新的代理目标：

1. 在`api/proxy.js`的`targetMap`中添加新映射
2. 在`vercel.json`的`routes`中添加新路由规则
3. 重新部署即可

例如添加新的代理：
```javascript
// 在 targetMap 中添加
'newsite': 'https://example.com'
```

```json
// 在 routes 中添加
{ "src": "/newsite/(.*)", "dest": "/api/proxy?target=newsite&path=$1" }
```
