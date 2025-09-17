# 移动端构建指南

## 前置要求

### Android 构建
1. 安装 Android Studio
2. 安装 Android SDK (API 33 或更高)
3. 配置 ANDROID_HOME 环境变量
4. 安装 Java 17 或更高版本

### iOS 构建 (仅限 macOS)
1. 安装 Xcode 14 或更高版本
2. 安装 Xcode Command Line Tools

## 快速设置（推荐）

### 使用自动化脚本
```bash
# Linux/macOS
chmod +x setup-android.sh
./setup-android.sh

# Windows
setup-android.bat
```

## 手动安装依赖

```bash
# 安装 npm 依赖
npm install

# 安装 Capacitor CLI (如果还没有全局安装)
npm install -g @capacitor/cli

# 构建 Web 应用
npm run build

# 删除现有 android 目录（如果存在问题）
rm -rf android

# 重新添加 Android 平台
npx cap add android

# 同步项目
npx cap sync
```

## 构建步骤

### 1. 构建 Web 应用
```bash
npm run build
```

### 2. 同步到移动平台
```bash
npx cap sync
```

### 3. 构建 Android APK

#### 开发版本
```bash
# 在 Android Studio 中打开项目
npx cap open android

# 或者使用命令行构建
npm run android:build
```

#### 发布版本
1. 在 Android Studio 中打开项目
2. 选择 Build > Generate Signed Bundle / APK
3. 选择 APK
4. 创建或选择密钥库
5. 选择 release 构建类型
6. 点击 Finish

### 4. 构建 iOS 应用 (仅限 macOS)
```bash
# 在 Xcode 中打开项目
npx cap open ios

# 或者使用命令行
npm run ios:build
```

## 调试

### Android 调试
```bash
# 在设备上运行并调试
npm run android:dev

# 查看日志
npx cap run android --livereload --external
```

### iOS 调试
```bash
# 在设备上运行并调试
npm run ios:dev
```

## 网络配置

### API 地址配置
应用会自动检测运行环境：
- 在移动端：使用 `http://192.168.79.13:8000`
- 在浏览器：使用环境变量或动态检测

### 修改后端地址
如需修改后端地址，请编辑：
1. `src/config/api.ts` 文件中的 Capacitor 环境配置
2. `capacitor.config.ts` 文件中的 allowNavigation 配置
3. `android/app/src/main/res/xml/network_security_config.xml` 中的域名配置

## 常见问题

### 1. 网络请求失败
- 确保后端服务正在运行
- 检查防火墙设置
- 确认 IP 地址配置正确

### 2. APK 构建失败
- 检查 Android SDK 版本
- 确保 Java 17 已安装并配置
- 删除并重新创建 Android 项目：
  ```bash
  rm -rf android
  npx cap add android
  npx cap sync
  ```
- 检查 gradlew 文件权限：`chmod +x android/gradlew`
- 如果 gradle-wrapper.jar 缺失，重新运行 `npx cap add android`

### 3. 权限问题
- 检查 AndroidManifest.xml 中的权限配置
- 确保网络安全配置正确

## 发布准备

### Android
1. 生成签名密钥
2. 配置 ProGuard (可选)
3. 测试发布版本
4. 上传到 Google Play Store

### iOS
1. 配置开发者证书
2. 配置 App Store Connect
3. 测试发布版本
4. 提交审核
