#!/bin/bash

# CI/CD 环境 Android 项目设置脚本
# 适用于 Ionic AppFlow 等自动化构建环境

echo "=== CI/CD Android 项目设置开始 ==="

# 显示当前环境信息
echo "当前工作目录: $(pwd)"
echo "Node.js 版本: $(node --version)"
echo "npm 版本: $(npm --version)"

# 检查必要的文件
echo "检查项目文件..."
if [ ! -f "package.json" ]; then
    echo "错误: package.json 不存在"
    exit 1
fi

if [ ! -f "capacitor.config.ts" ]; then
    echo "错误: capacitor.config.ts 不存在"
    exit 1
fi

# 安装依赖
echo "安装 npm 依赖..."
npm ci

# 检查 Capacitor CLI
echo "检查 Capacitor CLI..."
if ! command -v cap &> /dev/null; then
    echo "安装 Capacitor CLI..."
    npm install -g @capacitor/cli
fi

# 构建 Web 应用
echo "构建 Web 应用..."
npm run build

# 检查构建输出
if [ ! -d "dist" ]; then
    echo "错误: Web 应用构建失败，dist 目录不存在"
    exit 1
fi

echo "Web 应用构建成功，dist 目录内容:"
ls -la dist/

# 删除现有的 android 目录（如果存在）
if [ -d "android" ]; then
    echo "删除现有的 android 目录..."
    rm -rf android
fi

# 添加 Android 平台
echo "添加 Android 平台..."
npx cap add android

# 检查 Android 平台是否添加成功
if [ ! -d "android" ]; then
    echo "错误: Android 平台添加失败"
    exit 1
fi

echo "Android 平台添加成功，检查关键文件:"
ls -la android/
ls -la android/app/

# 同步项目
echo "同步项目到 Android..."
npx cap sync android

# 验证同步结果
echo "验证 Android 项目结构..."
if [ ! -f "android/gradlew" ]; then
    echo "错误: gradlew 文件不存在"
    exit 1
fi

if [ ! -f "android/gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "错误: gradle-wrapper.jar 文件不存在"
    exit 1
fi

# 设置 gradlew 权限
chmod +x android/gradlew

# 创建网络安全配置
echo "配置网络安全设置..."
mkdir -p android/app/src/main/res/xml

cat > android/app/src/main/res/xml/network_security_config.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">192.168.79.13</domain>
        <domain includeSubdomains="true">192.168.79.15</domain>
        <domain includeSubdomains="true">192.168.1.0/24</domain>
        <domain includeSubdomains="true">192.168.0.0/24</domain>
        <domain includeSubdomains="true">10.0.0.0/8</domain>
    </domain-config>
</network-security-config>
EOF

# 更新 AndroidManifest.xml 以包含网络安全配置
echo "更新 AndroidManifest.xml..."
if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
    # 备份原文件
    cp android/app/src/main/AndroidManifest.xml android/app/src/main/AndroidManifest.xml.backup
    
    # 添加网络安全配置
    sed -i 's/android:theme="@style\/AppTheme"/android:theme="@style\/AppTheme"\n        android:usesCleartextTraffic="true"\n        android:networkSecurityConfig="@xml\/network_security_config"/' android/app/src/main/AndroidManifest.xml
fi

echo "=== CI/CD Android 项目设置完成 ==="
echo "项目已准备好进行构建"
echo "可以运行: cd android && ./gradlew assembleDebug"
