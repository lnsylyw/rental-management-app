@echo off
echo ========================================
echo 准备在线构建包
echo ========================================
echo.

echo 1. 构建React应用...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ React应用构建失败
    pause
    exit /b 1
)
echo ✅ React应用构建完成

echo.
echo 2. 创建在线构建目录...
if exist "online-build" rmdir /s /q "online-build"
mkdir "online-build"

echo.
echo 3. 复制必要文件...
xcopy "dist\*" "online-build\" /s /e /y
copy "config.xml" "online-build\"
copy "capacitor.config.ts" "online-build\"
copy "package.json" "online-build\"

echo.
echo 4. 创建index.html（如果不存在）...
if not exist "online-build\index.html" (
    copy "dist\index.html" "online-build\"
)

echo.
echo 5. 创建压缩包...
powershell -command "Compress-Archive -Path 'online-build\*' -DestinationPath 'rental-management-online-build.zip' -Force"

echo.
echo ✅ 在线构建包已准备完成！
echo 📦 文件位置: rental-management-online-build.zip
echo.
echo 📋 下一步：
echo 1. 访问在线构建服务（如 Ionic Appflow）
echo 2. 上传 rental-management-online-build.zip 文件
echo 3. 配置Android构建设置
echo 4. 开始构建并下载APK
echo.
echo ========================================
pause
