# 租赁管理应用 - 手机APP构建指南

## 项目概述
您的租赁管理应用已经成功配置为可以打包成Android手机APP。我们使用了Capacitor框架来实现这个功能。

## 已完成的配置

### 1. Capacitor配置
- ✅ 安装了 @capacitor/core 和 @capacitor/cli
- ✅ 初始化了Capacitor项目
- ✅ 配置了应用ID: `com.rental.management`
- ✅ 配置了应用名称: `租赁管理`
- ✅ 添加了Android平台支持

### 2. 移动端优化
- ✅ 配置了状态栏样式
- ✅ 配置了启动屏幕
- ✅ 添加了移动端插件初始化代码
- ✅ 创建了应用图标

### 3. 构建脚本
已添加以下npm脚本到package.json：
- `npm run build:mobile` - 构建并同步到移动端
- `npm run android:dev` - 开发模式运行Android应用
- `npm run android:build` - 构建Android应用
- `npm run android:open` - 打开Android Studio

## 环境准备（必须完成）

### 1. 安装Java JDK
1. **下载Java JDK 11或17**
   - 访问 https://adoptium.net/
   - 下载并安装适合您系统的JDK版本

2. **设置环境变量**
   - 添加 `JAVA_HOME` 环境变量指向JDK安装目录
   - 将 `%JAVA_HOME%\bin` 添加到PATH环境变量

3. **验证安装**
   ```bash
   java -version
   javac -version
   ```

### 2. 安装Android Studio
1. **下载Android Studio**
   - 访问 https://developer.android.com/studio
   - 下载并安装Android Studio

2. **安装Android SDK**
   - 打开Android Studio
   - 进入 Tools → SDK Manager
   - 安装 Android SDK Platform 33 或更高版本
   - 安装 Android SDK Build-Tools
   - 安装 Android SDK Command-line Tools

3. **设置环境变量**
   - 添加 `ANDROID_HOME` 环境变量指向SDK目录
   - 将以下路径添加到PATH：
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`

## 构建APK的步骤

### 方法一：使用Android Studio（推荐）

1. **打开项目**
   ```bash
   cd rental-management-app
   npm run android:open
   ```

2. **在Android Studio中构建APK**
   - 等待项目加载完成（首次可能需要下载依赖）
   - 点击菜单 Build → Build Bundle(s) / APK(s) → Build APK(s)
   - 等待构建完成
   - APK文件将生成在 `android/app/build/outputs/apk/debug/` 目录

### 方法二：使用命令行

1. **构建APK**
   ```bash
   cd rental-management-app
   npm run build:mobile
   cd android
   gradlew assembleDebug
   ```

2. **查找生成的APK**
   APK文件位置：`android/app/build/outputs/apk/debug/app-debug.apk`

## 安装到手机

### 方法一：直接安装APK
1. 将生成的APK文件传输到手机
2. 在手机上启用"未知来源"安装
3. 点击APK文件进行安装

### 方法二：通过USB调试
1. 在手机上启用开发者选项和USB调试
2. 连接手机到电脑
3. 运行：`npm run android:dev`

## 应用特性

### 移动端优化功能
- 📱 响应式设计，完美适配手机屏幕
- 🎨 自定义启动屏幕
- 📊 状态栏样式配置
- 🔄 自动同步Web资源

### 应用功能
- 🏠 房屋管理
- 👥 租客管理
- 💰 财务管理
- 📊 数据统计
- 📱 移动端友好界面

## 故障排除

### 常见问题

1. **构建失败**
   - 确保已安装Android SDK
   - 检查Java版本是否正确
   - 运行 `npx cap doctor` 检查环境

2. **应用无法启动**
   - 检查网络连接
   - 确保后端API服务正常运行

3. **界面显示异常**
   - 清除应用缓存
   - 重新构建应用

### 环境检查
运行以下命令检查开发环境：
```bash
npx cap doctor
```

## 发布到应用商店

### Google Play Store
1. 创建签名密钥
2. 构建发布版APK
3. 在Google Play Console中上传
4. 填写应用信息和描述

### 其他应用商店
- 华为应用市场
- 小米应用商店
- OPPO软件商店
- vivo应用商店

## 技术栈
- **前端**: React + TypeScript + Tailwind CSS
- **移动端**: Capacitor
- **构建工具**: Vite
- **UI组件**: Radix UI + shadcn/ui

## 联系支持
如果在构建过程中遇到问题，请检查：
1. Capacitor官方文档：https://capacitorjs.com/docs
2. Android开发者文档：https://developer.android.com
