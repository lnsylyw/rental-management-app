#!/usr/bin/env node

// 确保 Android 平台存在的脚本

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('检查 Android 平台状态...');

const androidDir = path.join(__dirname, 'android');
const gradlewPath = path.join(androidDir, 'gradlew');

// 检查 android 目录是否存在且包含必要文件
if (!fs.existsSync(androidDir) || !fs.existsSync(gradlewPath)) {
    console.log('Android 平台不存在或不完整，正在添加...');
    
    try {
        // 删除不完整的 android 目录
        if (fs.existsSync(androidDir)) {
            console.log('删除不完整的 android 目录...');
            fs.rmSync(androidDir, { recursive: true, force: true });
        }
        
        // 添加 Android 平台
        console.log('添加 Android 平台...');
        execSync('npx cap add android', { stdio: 'inherit' });
        
        console.log('Android 平台添加成功！');
    } catch (error) {
        console.error('添加 Android 平台失败:', error.message);
        process.exit(1);
    }
} else {
    console.log('Android 平台已存在');
}

console.log('Android 平台检查完成');
