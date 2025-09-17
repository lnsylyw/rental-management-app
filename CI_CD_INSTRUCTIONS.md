# CI/CD 构建说明

## 问题分析

您的构建失败是因为在执行 `npx cap sync android` 之前，Android 平台还没有被添加到项目中。

## 解决方案

### 方法一：修改 CI/CD 构建流程

在您的 CI/CD 配置中，确保在 `cap sync` 之前先执行 `cap add android`：

```bash
# 1. 安装依赖
npm install

# 2. 构建 Web 应用
npm run build

# 3. 添加 Android 平台（关键步骤）
npx cap add android

# 4. 同步项目
npx cap sync android

# 5. 构建 APK
cd android && ./gradlew assembleDebug
```

### 方法二：使用项目提供的脚本

运行我们提供的自动化脚本：

```bash
# 使用构建脚本
npm run android:setup

# 或者直接运行
chmod +x build-android.sh && ./build-android.sh
```

### 方法三：修改 package.json 脚本

项目的 `build:mobile` 脚本已经更新为：

```json
"build:mobile": "vite build && npx cap add android && npx cap sync"
```

所以您也可以直接运行：

```bash
npm run build:mobile
```

## 关键要点

1. **必须先添加平台**：在同步之前必须先运行 `npx cap add android`
2. **构建顺序很重要**：
   - npm install
   - npm run build
   - npx cap add android
   - npx cap sync android
3. **验证文件存在**：确保 `android/gradlew` 和 `android/gradle/wrapper/gradle-wrapper.jar` 存在

## 在 Ionic AppFlow 中的配置

如果您使用 Ionic AppFlow，请确保构建配置包含以下步骤：

1. **Pre-build 脚本**：
   ```bash
   npm install
   npm run build
   npx cap add android
   ```

2. **Build 脚本**：
   ```bash
   npx cap sync android
   cd android && ./gradlew assembleDebug
   ```

## 验证

构建成功后，您应该看到：
- `android/` 目录存在
- `android/gradlew` 文件存在且可执行
- `android/gradle/wrapper/gradle-wrapper.jar` 文件存在
- APK 文件在 `android/app/build/outputs/apk/debug/` 目录中
