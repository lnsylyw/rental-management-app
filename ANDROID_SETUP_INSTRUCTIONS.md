# Android 项目设置说明

## 问题诊断

您遇到的错误是因为 Gradle 包装器文件缺失或损坏。这通常发生在手动创建 Android 项目结构时。

## 解决方案

### 方法一：使用自动化脚本（推荐）

1. **Windows 用户**：
   ```cmd
   setup-android.bat
   ```

2. **Linux/macOS 用户**：
   ```bash
   chmod +x setup-android.sh
   ./setup-android.sh
   ```

### 方法二：手动重新创建

1. **删除现有 android 目录**：
   ```bash
   rm -rf android
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **构建 Web 应用**：
   ```bash
   npm run build
   ```

4. **让 Capacitor 自动创建 Android 项目**：
   ```bash
   npx cap add android
   ```

5. **同步项目**：
   ```bash
   npx cap sync
   ```

6. **构建 APK**：
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

## 重要说明

- **不要手动创建 Android 项目文件**，让 Capacitor CLI 自动生成
- **确保已安装 Android SDK 和 Java 17**
- **Gradle 包装器文件会由 Capacitor 自动下载和配置**

## 网络配置

项目已配置为支持 HTTP 连接到后端服务器：
- `192.168.79.13:8000`
- `localhost:8000`
- 其他局域网地址

## 验证设置

设置完成后，检查以下文件是否存在：
- `android/gradlew`
- `android/gradle/wrapper/gradle-wrapper.jar`
- `android/app/build.gradle`

如果这些文件存在，说明设置成功。
