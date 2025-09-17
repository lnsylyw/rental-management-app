#!/bin/bash

# Android 构建脚本 - 确保所有步骤都正确执行

set -e  # 遇到错误立即退出

echo "=== Android 构建开始 ==="

# 1. 检查环境
echo "检查环境..."
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"
echo "当前目录: $(pwd)"

# 2. 安装依赖
echo "安装依赖..."
npm install

# 3. 构建 Web 应用
echo "构建 Web 应用..."
npm run build

# 4. 检查构建结果
if [ ! -d "dist" ]; then
    echo "错误: Web 应用构建失败"
    exit 1
fi

echo "Web 应用构建成功"

# 5. 添加 Android 平台（如果不存在）
if [ ! -d "android" ]; then
    echo "添加 Android 平台..."
    npx cap add android
else
    echo "Android 平台已存在"
fi

# 6. 同步项目
echo "同步项目到 Android..."
npx cap sync android

# 7. 验证关键文件
echo "验证 Android 项目..."
if [ ! -f "android/gradlew" ]; then
    echo "错误: gradlew 文件不存在"
    exit 1
fi

if [ ! -f "android/gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "错误: gradle-wrapper.jar 文件不存在"
    exit 1
fi

# 8. 设置权限
chmod +x android/gradlew

echo "=== Android 项目准备完成 ==="
echo "可以开始构建 APK"
