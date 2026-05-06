# CargoNight Desktop

在线桌游平台桌面客户端，基于 **Tauri 2 + React 19 + TypeScript** 构建。

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
- 游戏大厅与观战

## 开发

### 前置条件

- Node.js 18+
- Rust 1.80+
- 后端服务运行中 (CargoNightServer)

### 安装与运行

```bash
npm install
npm run tauri:dev
```

### 构建生产版本

```bash
npm run tauri:build
```

## 项目结构

```
src/
├── api/           # API 客户端
├── components/    # React 组件
│   └── avalon/    # 阿瓦隆游戏组件
├── hooks/         # 自定义 Hooks
├── pages/         # 页面组件
├── store/         # Zustand 状态管理
└── types/         # TypeScript 类型定义
src-tauri/
├── src/
│   ├── commands/  # Tauri 命令处理
│   ├── models/    # 数据模型
│   └── state/     # 应用状态
```

## 许可

MIT
