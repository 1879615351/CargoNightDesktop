# CargoNight Desktop

在线桌游平台客户端，基于 **Tauri 2 + React 19 + TypeScript** 构建，支持 Windows 桌面端和 Android 移动端。

## 技术栈

- **框架**: Tauri 2 (Rust backend) + React 19
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand 5
- **路由**: React Router DOM 7
- **实时通信**: WebSocket + WebRTC
- **构建工具**: Vite 6
- **移动端**: Tauri Android (Gradle + NDK)

## 功能

### 平台
- 用户注册/登录 (JWT 认证)
- 好友系统 (搜索/添加/删除/在线状态)
- 游戏大厅与房间匹配
- 实时语音通话 (WebRTC)

### 阿瓦隆 (Avalon)
- 完整游戏流程：身份揭示 → 队长选人 → 讨论发言 → 投票表决 → 任务执行 → 结果揭晓 → 刺杀阶段
- **圆形桌游布局** — 玩家环绕中央圆桌排列，模拟线下围坐体验
- 发言阶段实时倒计时 (本地秒级更新)
- 任务结果弹出式通知动画 (自动消失)
- AI 玩家托管与自动决策
- 轮次历史查看
- 角色配置 (自定义角色组合)

### 跨平台适配
- **桌面端**: 顶部导航栏 + 三栏/双栏布局
- **移动端**: 底部 Tab 栏导航 + 单栏堆叠布局 + 聊天/玩家面板切换
- 禁止页面缩放 (viewport + touch-action)
- 响应式组件尺寸 (sm/md/lg 断点)
- 下拉刷新 (首页 + 游戏大厅)

## 网络配置

修改 `src/config.ts` 即可统一修改所有网络连接地址：

```ts
export const SERVER_IP = "172.29.11.177"; // 后端服务器 IP
export const SERVER_PORT = 8080;           // 后端端口
```

此文件控制 REST API 和 WebSocket 地址，构建前修改即可切换服务器。

## 快速开始

### 前置条件

- Node.js 18+
- Rust 1.80+
- 后端服务运行中 (CargoNightServer)

### 桌面端开发

```bash
npm install
npm run tauri:dev       # 开发模式 (Vite HMR)
npm run tauri:build     # 生产构建
```

### 一键脚本

根目录提供以下脚本：

| 脚本 | 说明 |
|------|------|
| `build_server.bat` | 编译后端 (Release) |
| `build_desktop.bat` | 编译桌面端 (Release) |
| `build_android.bat` | 编译 + 签名 Android APK |
| `build_all.bat` | 一键构建全部平台 |
| `start_all.bat` | 启动 PostgreSQL + Server + Desktop |

## Android 构建

### 环境准备

1. 安装 Java JDK 17+
2. 安装 Android SDK (Platform 34, Build-tools 34/35, NDK 27)
3. 添加 Rust Android 目标：

```bash
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android i686-linux-android
```

4. 初始化 Android 项目：

```bash
npx tauri android init
```

### 构建步骤

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

# 5. 签名
apksigner sign --ks ~/cargonight-release.keystore --out CargoNight-arm64-signed.apk app/build/outputs/apk/arm64/release/app-arm64-release-unsigned.apk
```

> **重要**: 每次修改前端代码后需要清理 Rust 缓存 (`cargo clean --target aarch64-linux-android`)，否则内嵌的前端资源不会更新。

### Android 权限

`AndroidManifest.xml` 配置：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

Release 构建需启用明文流量 (`usesCleartextTraffic = "true"`)，允许 HTTP 连接后端。

### Android 关键配置

- **入口点**: `#[tauri::mobile_entry_point]` (lib.rs)
- **NDK 链接器**: `.cargo/config.toml` (4 个架构的 clang 路径)
- **直接依赖**: `tao = "0.35.0"` 和 `wry = "0.55.0"` 确保 JNI proc macro 可用

## 项目结构

```
src/
├── api/           # API 客户端 (HTTP fetch)
├── components/    # React 组件
│   ├── Layout.tsx            # 全局布局 (桌面导航 + 移动 Tab 栏)
│   ├── FriendsSidebar.tsx     # 好友侧边栏
│   ├── ChatArea.tsx           # 聊天区域
│   ├── GameCard.tsx           # 游戏卡片
│   ├── RoomCard.tsx           # 房间卡片
│   └── avalon/                # 阿瓦隆游戏组件
│       ├── MissionHistory.tsx     # 轮次历史弹窗
│       ├── MissionResultToast.tsx # 任务结果通知
│       ├── PhaseStepper.tsx       # 阶段进度指示器
│       ├── RoleAvatar.tsx         # 角色头像 (含光环/皇冠)
│       ├── RoleConfig.tsx         # 角色配置面板
│       └── SpeakingPanel.tsx      # 发言面板 (倒计时 + 队列)
├── hooks/         # 自定义 Hooks
│   ├── useWebSocket.ts     # WebSocket 连接管理
│   ├── useMediaDevice.ts   # 麦克风设备控制
│   └── useWebRTC.ts        # WebRTC 实时通信
├── pages/         # 页面组件
│   ├── AvalonGame.tsx      # 阿瓦隆游戏 (圆形桌游 + 操作面板)
│   ├── GameRoomPage.tsx    # 游戏房间 (玩家列表 + 聊天)
│   ├── GameLobbyPage.tsx   # 游戏大厅 (房间搜索 + 下拉刷新)
│   ├── GameSelectionPage.tsx # 游戏选择
│   ├── HomePage.tsx        # 首页 (热门游戏/房间 + 好友)
│   ├── LoginPage.tsx       # 登录/注册
│   └── ProfilePage.tsx     # 个人资料 + 游戏记录
├── store/         # Zustand 状态管理
│   ├── authStore.ts   # 认证状态
│   ├── homeStore.ts   # 首页数据 + 游戏列表
│   ├── lobbyStore.ts  # 大厅房间数据
│   ├── roomStore.ts   # 房间 + 聊天状态
│   └── friendStore.ts # 好友数据
├── types/         # TypeScript 类型定义
│   ├── index.ts    # 通用类型
│   └── avalon.ts   # 阿瓦隆类型 (GamePhase, Role, PlayerGameView...)
└── config.ts      # 网络配置 (统一管理 IP/端口)
src-tauri/
├── Cargo.toml         # Rust 依赖 (tauri, tao, wry, serde...)
├── tauri.conf.json    # Tauri 应用配置
├── .cargo/config.toml # Android NDK 链接器配置
├── icons/             # 应用图标 (RGBA PNG)
├── gen/android/       # Android Gradle 项目
└── src/
    ├── main.rs        # 桌面入口
    ├── lib.rs         # 核心逻辑 + Android mobile_entry_point
    ├── commands/      # Tauri IPC 命令处理
    ├── models/        # Rust 数据模型
    └── state/         # 应用内存状态
```

## 许可

MIT
