@echo off
REM 租房管理系统 Android 项目设置脚本

echo 开始设置 Android 项目...

REM 1. 安装依赖
echo 安装 npm 依赖...
call npm install

REM 2. 构建 Web 应用
echo 构建 Web 应用...
call npm run build

REM 3. 删除现有的 android 目录（如果存在）
if exist "android" (
    echo 删除现有的 android 目录...
    rmdir /s /q android
)

REM 4. 添加 Android 平台
echo 添加 Android 平台...
call npx cap add android

REM 5. 同步项目
echo 同步项目到 Android...
call npx cap sync

REM 6. 创建网络安全配置目录
echo 配置网络安全设置...
mkdir android\app\src\main\res\xml 2>nul

REM 7. 创建网络安全配置文件
echo ^<?xml version="1.0" encoding="utf-8"?^> > android\app\src\main\res\xml\network_security_config.xml
echo ^<network-security-config^> >> android\app\src\main\res\xml\network_security_config.xml
echo     ^<domain-config cleartextTrafficPermitted="true"^> >> android\app\src\main\res\xml\network_security_config.xml
echo         ^<domain includeSubdomains="true"^>localhost^</domain^> >> android\app\src\main\res\xml\network_security_config.xml
echo         ^<domain includeSubdomains="true"^>127.0.0.1^</domain^> >> android\app\src\main\res\xml\network_security_config.xml
echo         ^<domain includeSubdomains="true"^>192.168.79.13^</domain^> >> android\app\src\main\res\xml\network_security_config.xml
echo         ^<domain includeSubdomains="true"^>192.168.79.15^</domain^> >> android\app\src\main\res\xml\network_security_config.xml
echo     ^</domain-config^> >> android\app\src\main\res\xml\network_security_config.xml
echo ^</network-security-config^> >> android\app\src\main\res\xml\network_security_config.xml

echo Android 项目设置完成！
echo 现在可以运行以下命令构建 APK：
echo cd android ^&^& gradlew assembleDebug

pause
