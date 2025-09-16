# Android开发环境完整设置指南

## 🎯 目标
设置完整的Android开发环境，以便构建APK文件

## ❌ 当前问题
```
[error] Unable to launch Android Studio. Is it installed?
```
这表示系统找不到Android Studio。

## 🚀 解决方案

### 方案1：完整安装Android开发环境（推荐）

#### 步骤1：安装Java JDK
1. **下载Java JDK 11或17**
   - 访问：https://adoptium.net/
   - 选择 "Temurin 17 (LTS)" 
   - 下载Windows x64版本的MSI安装包

2. **安装Java**
   - 运行下载的MSI文件
   - 按默认设置安装
   - 记住安装路径（通常是 `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot\`）

3. **设置Java环境变量**
   - 按 `Win + R`，输入 `sysdm.cpl`，回车
   - 点击"高级"选项卡 → "环境变量"
   - 在"系统变量"中点击"新建"：
     - 变量名：`JAVA_HOME`
     - 变量值：Java安装路径（如：`C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot`）
   - 编辑"Path"变量，添加：`%JAVA_HOME%\bin`

#### 步骤2：安装Android Studio
1. **下载Android Studio**
   - 访问：https://developer.android.com/studio
   - 下载Windows版本（约1GB）

2. **安装Android Studio**
   - 运行安装程序
   - 选择"Standard"安装类型
   - 等待下载Android SDK组件

3. **配置Android SDK**
   - 启动Android Studio
   - 进入 Tools → SDK Manager
   - 确保安装以下组件：
     - Android SDK Platform 33 (API Level 33)
     - Android SDK Build-Tools 33.0.0
     - Android SDK Command-line Tools

4. **设置Android环境变量**
   - 找到Android SDK路径（通常在 `C:\Users\用户名\AppData\Local\Android\Sdk`）
   - 添加系统环境变量：
     - 变量名：`ANDROID_HOME`
     - 变量值：SDK路径
   - 编辑"Path"变量，添加：
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%ANDROID_HOME%\tools\bin`

#### 步骤3：验证环境
打开新的命令提示符，运行：
```bash
java -version
javac -version
adb version
```

### 方案2：使用便携版工具（快速方案）

如果您不想安装完整的Android Studio，可以：

1. **下载Android命令行工具**
   - 访问：https://developer.android.com/studio#command-tools
   - 下载"Command line tools only"

2. **设置最小环境**
   - 解压到 `C:\android-sdk`
   - 设置环境变量 `ANDROID_HOME=C:\android-sdk`
   - 运行 `sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"`

### 方案3：使用在线构建服务

#### 使用Capacitor Live Updates
```bash
npm install -g @capacitor/cli
npx cap login
npx cap build android --cloud
```

#### 使用GitHub Actions
我可以帮您设置GitHub Actions自动构建APK。

## 🔧 环境设置完成后

### 重新构建APK
```bash
cd rental-management-app
npm run build:mobile
npx cap open android
```

### 在Android Studio中构建
1. 等待项目加载完成
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. 等待构建完成

## 📱 替代方案：使用现有工具

### 如果您有Visual Studio
可以安装"Mobile development with .NET"工作负载，它包含Android SDK。

### 如果您有其他IDE
- IntelliJ IDEA Ultimate版本支持Android开发
- Eclipse with ADT插件

## 🆘 快速解决方案

如果您急需APK文件，我建议：

1. **最快方案**：安装Android Studio（约30分钟）
2. **中等方案**：使用命令行工具（约15分钟）
3. **云端方案**：使用在线构建服务（约5分钟）

## 📞 需要帮助？

如果在设置过程中遇到问题：
1. 确保以管理员身份运行安装程序
2. 检查防火墙设置
3. 确保有足够的磁盘空间（至少5GB）
4. 重启计算机后重新尝试

## ✅ 成功标志

环境设置成功后，您应该能够：
- 运行 `java -version` 看到Java版本信息
- 运行 `npx cap open android` 打开Android Studio
- 在Android Studio中成功构建APK
