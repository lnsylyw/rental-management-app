#!/bin/bash

# 预构建脚本 - 确保 Android 平台正确设置

echo "开始预构建设置..."

# 1. 安装依赖
echo "安装依赖..."
npm install

# 2. 构建 Web 应用
echo "构建 Web 应用..."
npm run build

# 3. 确保 Android 平台存在
if [ ! -d "android" ]; then
    echo "添加 Android 平台..."
    npx cap add android
else
    echo "Android 平台已存在"
fi

# 4. 同步项目
echo "同步项目..."
npx cap sync android

# 5. 设置权限
if [ -f "android/gradlew" ]; then
    chmod +x android/gradlew
    echo "gradlew 权限设置完成"
else
    echo "警告: gradlew 文件不存在"
fi

echo "预构建设置完成"
