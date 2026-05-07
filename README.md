# CargoNight Desktop

在线桌游平台客户端，基于 **Tauri 2 + React 19 + TypeScript** 构建，支持 Windows 桌面端和 Android 移动端。

## 技术栈

- **框架**: Tauri 2 (Rust backend) + React 19
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand 5
- **路由**: React Router DOM 7
- **实时通信**: WebSocket + WebRTC
- **构建工具**: Vite 6

## 功能

- 用户注册/登录
- 好友系统
- 游戏房间创建与匹配
- 实时语音/视频通话 (WebRTC)
- 桌游阿瓦隆 (Avalon) 完整玩法
  - 身份揭示、队伍选择、投票表决、任务执行
  - 发言阶段实时倒计时
  - 任务结果弹出式通知动画
  - 响应式三栏布局，自适应窗口大小
- AI 玩家托管
- 游戏大厅与观战

## 网络配置

修改 `src/config.ts` 即可统一修改所有网络连接地址：

```ts
export const SERVER_IP = "172.29.11.177"; // 后端服务器 IP
export const SERVER_PORT = 8080;           // 后端端口
```

此文件控制：
- REST API 地址 (`client.ts`)
- WebSocket 地址 (`useWebSocket.ts`)

## 开发

### 前置条件

- Node.js 18+
- Rust 1.80+
- 后端服务运行中 (CargoNightServer)

### 桌面端

```bash
npm install
npm run tauri:dev       # 开发模式
npm run tauri:build     # 生产构建
```

### Android 端

#### 环境准备

1. 安装 Java JDK 17+
2. 安装 Android SDK (Platform 34, Build-tools 34, NDK 27)
3. 添加 Rust Android 目标：

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android
```

4. 初始化 Android 项目：

```bash
npx tauri android init
```

#### 构建 APK

```bash
# 1. 构建前端
npm run build

# 2. 编译 Rust 库 (4 个架构)
cd src-tauri
cargo build --release --target aarch64-linux-android --features "tauri/custom-protocol" --lib
cargo build --release --target armv7-linux-androideabi --features "tauri/custom-protocol" --lib
cargo build --release --target x86_64-linux-android --features "tauri/custom-protocol" --lib
cargo build --release --target i686-linux-android --features "tauri/custom-protocol" --lib

# 3. 复制 .so 到 jniLibs
cp target/aarch64-linux-android/release/libcargo_night_lib.so gen/android/app/src/main/jniLibs/arm64-v8a/
cp target/armv7-linux-androideabi/release/libcargo_night_lib.so gen/android/app/src/main/jniLibs/armeabi-v7a/
cp target/x86_64-linux-android/release/libcargo_night_lib.so gen/android/app/src/main/jniLibs/x86_64/
cp target/i686-linux-android/release/libcargo_night_lib.so gen/android/app/src/main/jniLibs/x86/

# 4. 打包 APK
cd gen/android
./gradlew assembleRelease -x rustBuildArm64Release -x rustBuildArmRelease -x rustBuildX86Release -x rustBuildX86_64Release

# 5. 签名 (需要先生成 keystore)
apksigner sign --ks ~/cargonight-release.keystore --out CargoNight-arm64-signed.apk app/build/outputs/apk/arm64/release/app-arm64-release-unsigned.apk
```

> **重要**: 每次修改前端代码后需要清理 Rust 缓存 (`cargo clean --target aarch64-linux-android`)，否则内嵌的前端资源不会更新。

## 项目结构

```
src/
├── api/           # API 客户端
├── components/    # React 组件
│   └── avalon/    # 阿瓦隆游戏组件
│       ├── MissionHistory.tsx     # 轮次历史
│       ├── MissionResultToast.tsx # 任务结果弹窗
│       ├── PhaseStepper.tsx       # 阶段指示器
│       ├── RoleAvatar.tsx         # 角色头像
│       ├── RoleConfig.tsx         # 角色配置
│       └── SpeakingPanel.tsx      # 发言面板
├── hooks/         # 自定义 Hooks
│   └── useWebSocket.ts  # WebSocket 连接
├── pages/         # 页面组件
│   ├── AvalonGame.tsx   # 阿瓦隆游戏主界面
│   ├── GameRoomPage.tsx # 游戏房间
│   ├── LoginPage.tsx    # 登录
│   └── ProfilePage.tsx  # 个人资料
├── store/         # Zustand 状态管理
├── types/         # TypeScript 类型定义
└── config.ts      # 网络配置 (IP/端口)
src-tauri/
├── Cargo.toml     # Rust 依赖
├── tauri.conf.json # Tauri 配置
├── .cargo/config.toml  # Android NDK 链接器配置
├── icons/         # 应用图标
├── gen/android/   # Android 项目 (Gradle)
└── src/
    ├── main.rs    # 桌面入口
    ├── lib.rs     # 核心逻辑 + Android 入口
    ├── commands/  # Tauri 命令处理
    ├── models/    # 数据模型
    └── state/     # 应用状态
```

## 许可

MIT
