# Texas Hold'em Poker - 德州扑克

一个完整的 Web 版多人在线德州扑克游戏，使用 Node.js + Express + Socket.IO + React 构建。

## 功能特性

### 用户系统
- ✅ 用户注册/登录 (JWT 鉴权)
- ✅ 初始赠送 10,000 筹码
- ✅ 个人中心 (战绩统计、盈亏曲线)
- ✅ 排行榜 (今日/本周/全部 Top 10)

### 游戏功能
- ✅ 大厅创建/加入牌桌
  - 可设置盲注级别
  - 最大座位数 2~9 人
  - 最低/最高买入限制
  - 私密房间 (密码保护)
- ✅ 完整德州扑克规则
  - 庄家位顺时针轮换
  - 小盲/大盲强制下注
  - 五个阶段: Pre-flop / Flop / Turn / River / Showdown
  - 五种操作: Fold / Check / Call / Raise / All-in
  - 行动倒计时 30 秒超时自动 Fold
- ✅ 7 选 5 牌型识别
  - 皇家同花顺 → 高牌
  - 支持 A-2-3-4-5 轮顺
- ✅ 边池拆分
  - 多人 All-in 时主池/边池拆分
  - 平局奖池均分

### 实时交互
- ✅ Socket.IO 实时推送
  - 发牌、下注、摊牌等事件
  - 底牌点对点发给本人 (不广播)
- ✅ 服务端下注合法性校验 (防作弊)
- ✅ 洗牌使用 crypto.randomBytes (安全随机)

### 前端界面
- ✅ 圆形牌桌布局
  - 座位显示头像/筹码/状态
  - 桌面中央展示公共牌和奖池
- ✅ 操作面板
  - Raise 带金额滑块
  - 1/2 池 / Pot 等快捷按钮
- ✅ 桌内文字聊天
- ✅ 观战模式 (可旁观)

### 数据持久化
- ✅ 战绩持久化到 PostgreSQL
  - 每局参与者
  - 公共牌
  - 输赢筹码
  - 奖池分配
- ✅ Redis 缓存牌局状态

### 测试与部署
- ✅ 核心逻辑单元测试
  - 牌型识别 (轮顺、四条 vs 葫芦等)
  - 边池拆分 (多人 All-in)
- ✅ Docker + docker-compose 一键部署
  - frontend (nginx)
  - backend (Node.js)
  - redis
  - db (PostgreSQL)
- ✅ 敏感配置走 .env
- ✅ 数据卷持久化
- ✅ 自动建库建表 + 创建 3 个测试账号

## 项目结构

```
kt-5-1/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   ├── database/          # 数据库连接与初始化
│   │   ├── game/              # 核心游戏逻辑
│   │   │   ├── cards.js       # 牌型识别
│   │   │   ├── gameState.js   # 游戏状态管理
│   │   │   └── potManager.js  # 边池拆分
│   │   ├── middleware/        # 中间件 (JWT)
│   │   ├── routes/            # API 路由
│   │   ├── services/          # 业务逻辑
│   │   └── socket/            # Socket.IO 服务
│   ├── tests/                  # 单元测试
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # React 组件
│   │   │   ├── Layout.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── PlayerSeat.jsx
│   │   │   ├── ActionPanel.jsx
│   │   │   └── Chat.jsx
│   │   ├── pages/             # 页面
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Lobby.jsx
│   │   │   ├── GameTable.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/          # API 与 Socket
│   │   ├── store/             # Redux 状态管理
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## 快速启动

### 方式一: Docker 部署 (推荐)

1. 确保已安装 Docker 和 Docker Compose

2. 进入项目目录:
```bash
cd kt-5-1
```

3. 复制环境变量文件:
```bash
copy .env.example .env
```
(Windows) 或
```bash
cp .env.example .env
```
(Linux/Mac)

4. 编辑 `.env` 文件，修改 JWT_SECRET 为随机字符串 (生产环境必须修改)

5. 启动所有服务:
```bash
docker-compose up -d --build
```

6. 等待服务启动完成后，访问:
   - 前端: http://localhost
   - 后端 API: http://localhost:3001

7. 测试账号 (自动创建):
   - player1 / 123456
   - player2 / 123456
   - player3 / 123456

### 方式二: 本地开发

#### 前置要求
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

#### 步骤

1. 启动 PostgreSQL 和 Redis

2. 配置数据库:
   - 创建数据库 `poker`
   - 创建用户 `poker` 密码 `poker123`
   - 授予权限

3. 启动后端:
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

4. 启动前端 (新终端):
```bash
cd frontend
npm install
npm run dev
```

5. 访问前端: http://localhost:3000

## 多人对战测试

使用多个浏览器无痕窗口进行测试:

1. 打开浏览器无痕窗口 1，访问 http://localhost
2. 使用 player1 登录
3. 打开浏览器无痕窗口 2，访问 http://localhost
4. 使用 player2 登录
5. 在任一窗口创建牌桌
6. 另一个窗口加入牌桌
7. 点击 "开始游戏" 即可开始对战

## 单元测试

运行后端单元测试:

```bash
cd backend
npm test
```

测试覆盖:
- 牌型识别 (皇家同花顺、同花顺、四条、葫芦、同花、顺子、三条、两对、一对、高牌)
- 轮顺 (A-2-3-4-5)
- 手数比较 (四条 vs 葫芦、高牌决胜)
- 边池拆分 (单 All-in、多 All-in、平局均分)

## API 接口

### 认证接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| GET | /api/auth/profile | 获取个人资料 | 是 |
| GET | /api/auth/games | 获取战绩记录 | 是 |
| GET | /api/auth/leaderboard | 获取排行榜 | 否 |

### 牌桌接口

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/tables | 获取牌桌列表 | 否 |
| POST | /api/tables | 创建牌桌 | 是 |
| GET | /api/tables/:id | 获取牌桌详情 | 否 |

### Socket.IO 事件

#### 客户端发送

| 事件 | 参数 | 描述 |
|------|------|------|
| join_lobby | - | 加入大厅 |
| leave_lobby | - | 离开大厅 |
| create_table | options | 创建牌桌 |
| join_table | { tableId, password, buyIn } | 加入牌桌 |
| leave_table | - | 离开牌桌 |
| start_game | - | 开始游戏 |
| player_action | { action, amount } | 执行操作 |
| send_message | { message } | 发送消息 |

#### 服务端推送

| 事件 | 参数 | 描述 |
|------|------|------|
| tables_updated | tables | 牌桌列表更新 |
| game_state | gameState | 游戏状态更新 |
| private_cards | { user_id, hole_cards } | 底牌 (仅本人可见) |
| player_joined | player | 玩家加入 |
| player_left | { user_id, seat_position } | 玩家离开 |
| action_performed | { user_id, action, ... } | 操作执行 |
| game_started | { phase, ... } | 游戏开始 |
| hand_ended | { community_cards, winnings, ... } | 本局结束 |
| chat_message | message | 聊天消息 |

## 牌型说明

| 等级 | 牌型 | 说明 |
|------|------|------|
| 10 | 皇家同花顺 | A-K-Q-J-10 同花色 |
| 9 | 同花顺 | 五张连续同花色 |
| 8 | 四条 | 四张相同点数 |
| 7 | 葫芦 | 三条+一对 |
| 6 | 同花 | 五张同花色 |
| 5 | 顺子 | 五张连续点数 |
| 4 | 三条 | 三张相同点数 |
| 3 | 两对 | 两个对子 |
| 2 | 一对 | 一个对子 |
| 1 | 高牌 | 单张最大牌 |

*注: A-2-3-4-5 为最小顺子 (轮顺/Wheel)*

## 技术栈

### 后端
- Node.js 20+
- Express
- Socket.IO
- PostgreSQL + pg
- Redis
- JWT (jsonwebtoken)
- bcryptjs

### 前端
- React 18
- Redux Toolkit
- React Router
- Socket.IO Client
- Axios
- Recharts (图表)
- Vite (构建)

### 部署
- Docker + Docker Compose
- Nginx (前端代理)

## 配置说明

### 环境变量

#### 后端 (.env)

| 变量 | 默认值 | 说明 |
|------|--------|------|
| PORT | 3001 | 服务端口 |
| NODE_ENV | development | 运行环境 |
| DB_HOST | localhost | 数据库地址 |
| DB_PORT | 5432 | 数据库端口 |
| DB_USER | poker | 数据库用户名 |
| DB_PASSWORD | poker123 | 数据库密码 |
| DB_NAME | poker | 数据库名 |
| REDIS_HOST | localhost | Redis 地址 |
| REDIS_PORT | 6379 | Redis 端口 |
| JWT_SECRET | - | JWT 密钥 (必填) |
| JWT_EXPIRES_IN | 7d | Token 有效期 |
| INITIAL_CHIPS | 10000 | 初始筹码 |
| ACTION_TIMEOUT | 30 | 行动超时秒数 |

### Docker Compose 环境变量 (.env)

| 变量 | 说明 |
|------|------|
| JWT_SECRET | JWT 密钥 |

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
