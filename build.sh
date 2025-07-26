#!/bin/bash

# 显示Node和npm版本
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 安装依赖
echo "Installing dependencies..."
npm install

# 构建项目
echo "Building project..."
npm run build

# 构建完成
echo "Build completed!"