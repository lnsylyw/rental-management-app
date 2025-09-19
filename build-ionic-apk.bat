@echo off
echo ========================================
echo Ionic APK 构建脚本
echo ========================================

echo 步骤 1: 清理之前的构建
if exist dist rmdir /s /q dist
if exist android\app\build rmdir /s /q android\app\build

echo 步骤 2: 安装依赖
call npm install

echo 步骤 3: 构建Web应用
call npm run build

echo 步骤 4: 同步到Android
call npx cap sync android

echo 步骤 5: 检查Android项目结构
if not exist android\gradlew (
    echo 错误: gradlew 文件不存在
    echo 尝试重新添加Android平台...
    call npx cap add android
    call npx cap sync android
)

echo 步骤 6: 设置JAVA_HOME（如果需要）
if "%JAVA_HOME%"=="" (
    echo 警告: JAVA_HOME 未设置
    echo 请确保已安装Java JDK并设置JAVA_HOME环境变量
    echo 常见路径: C:\Program Files\Java\jdk-11.0.x
    pause
)

echo 步骤 7: 构建APK
cd android
call gradlew assembleDebug
cd ..

echo 步骤 8: 检查构建结果
if exist android\app\build\outputs\apk\debug\app-debug.apk (
    echo ========================================
    echo ✅ APK构建成功！
    echo 文件位置: android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================
) else (
    echo ========================================
    echo ❌ APK构建失败
    echo 请检查上面的错误信息
    echo ========================================
)

pause
