#!/bin/bash

# 租房管理系统 Android 项目设置脚本

echo "开始设置 Android 项目..."

# 1. 安装依赖
echo "安装 npm 依赖..."
npm install

# 2. 构建 Web 应用
echo "构建 Web 应用..."
npm run build

# 3. 删除现有的 android 目录（如果存在）
if [ -d "android" ]; then
    echo "删除现有的 android 目录..."
    rm -rf android
fi

# 4. 添加 Android 平台
echo "添加 Android 平台..."
npx cap add android

# 5. 同步项目
echo "同步项目到 Android..."
npx cap sync

# 6. 复制网络安全配置
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

# 7. 更新 AndroidManifest.xml
echo "更新 AndroidManifest.xml..."
# 这里需要手动编辑 AndroidManifest.xml 添加网络权限和配置

echo "Android 项目设置完成！"
echo "现在可以运行以下命令构建 APK："
echo "cd android && ./gradlew assembleDebug"
