# Android Studio 构建APK详细指南

## 🎯 目标
使用Android Studio将租赁管理应用构建为可安装的APK文件

## 📋 前提条件
- ✅ Java已安装
- ✅ Android Studio已安装
- ✅ 项目已通过 `npx cap sync` 同步

## 🚀 详细步骤

### 1. 打开Android Studio项目
1. 启动Android Studio
2. 选择 "Open an Existing Project"
3. 导航到项目目录：`rental-management-app/android`
4. 点击 "OK" 打开项目

### 2. 等待项目加载
- Android Studio会自动下载必要的依赖
- 等待 "Gradle sync" 完成
- 如果提示安装SDK组件，点击 "Install" 安装

### 3. 构建APK
有两种方法构建APK：

#### 方法A：使用菜单构建
1. 点击菜单栏 `Build`
2. 选择 `Build Bundle(s) / APK(s)`
3. 选择 `Build APK(s)`
4. 等待构建完成

#### 方法B：使用Gradle面板
1. 在右侧打开 "Gradle" 面板
2. 展开 `app` → `Tasks` → `build`
3. 双击 `assembleDebug`
4. 等待构建完成

### 4. 查找生成的APK
构建成功后：
1. 在底部会显示 "BUILD SUCCESSFUL" 消息
2. 点击 "locate" 链接直接打开APK所在文件夹
3. 或手动导航到：`android/app/build/outputs/apk/debug/`
4. 找到文件：`app-debug.apk`

## 📱 安装APK到手机

### 方法1：直接安装
1. 将 `app-debug.apk` 文件传输到手机
2. 在手机上找到APK文件
3. 点击安装（可能需要启用"未知来源"）

### 方法2：USB调试安装
1. 在手机上启用开发者选项
2. 启用USB调试
3. 连接手机到电脑
4. 在Android Studio中点击绿色的"运行"按钮
5. 选择您的设备进行安装

## 🔧 常见问题解决

### 问题1：Gradle同步失败
**解决方案：**
- 检查网络连接
- 在Android Studio中：File → Invalidate Caches and Restart
- 删除 `.gradle` 文件夹后重新打开项目

### 问题2：SDK版本问题
**解决方案：**
- 打开 Tools → SDK Manager
- 安装推荐的SDK版本（API 33或更高）
- 安装Android SDK Build-Tools

### 问题3：构建失败
**解决方案：**
- 查看 "Build" 面板中的错误信息
- 确保所有依赖都已下载
- 尝试 Build → Clean Project，然后重新构建

### 问题4：找不到APK文件
**解决方案：**
- 确保构建成功完成
- 检查路径：`android/app/build/outputs/apk/debug/`
- 如果目录不存在，说明构建失败，检查错误日志

## 📊 构建信息
- **应用名称**: 租赁管理
- **包名**: com.rental.management
- **构建类型**: Debug（开发版本）
- **目标平台**: Android

## 🎉 成功标志
当您看到以下内容时，说明构建成功：
- Android Studio底部显示 "BUILD SUCCESSFUL"
- 在 `android/app/build/outputs/apk/debug/` 目录中找到 `app-debug.apk` 文件
- APK文件大小约为 20-50MB

## 📞 需要帮助？
如果遇到问题：
1. 查看Android Studio的 "Build" 面板获取详细错误信息
2. 确保所有环境变量正确配置
3. 尝试重启Android Studio
4. 检查磁盘空间是否充足

## 🚀 下一步
APK构建成功后，您就可以：
- 安装到自己的手机进行测试
- 分享给其他用户安装
- 准备发布到应用商店（需要签名版本）
