@echo off
echo ========================================
echo 租赁管理应用 - Android APK 构建脚本
echo ========================================
echo.

echo 1. 检查环境...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java 未安装或未配置环境变量
    echo 请先安装 Java JDK 11 或更高版本
    echo 下载地址: https://adoptium.net/
    pause
    exit /b 1
)
echo ✅ Java 环境正常

echo.
echo 2. 构建 React 应用...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ React 应用构建失败
    pause
    exit /b 1
)
echo ✅ React 应用构建完成

echo.
echo 3. 同步到 Android 项目...
call npx cap sync
if %errorlevel% neq 0 (
    echo ❌ Capacitor 同步失败
    pause
    exit /b 1
)
echo ✅ 同步完成

echo.
echo 4. 构建 Android APK...
cd android
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo ❌ Android APK 构建失败
    echo 请确保已安装 Android SDK 并配置环境变量
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ APK 构建完成

echo.
echo 5. 查找生成的 APK 文件...
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo ✅ APK 文件生成成功！
    echo 📱 文件位置: android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo 您可以将此 APK 文件传输到手机进行安装
    echo 安装前请在手机设置中启用"未知来源"应用安装
) else (
    echo ❌ 未找到 APK 文件
    echo 请检查构建过程中是否有错误
)

echo.
echo ========================================
echo 构建完成！
echo ========================================
pause
