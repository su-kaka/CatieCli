# 🐱 CatieCli-maomao

![Discord](https://img.shields.io/badge/Discord-Bot_支持-5865F2?logo=discord&logoColor=white)
![OpenAI Compatible](https://img.shields.io/badge/OpenAI-兼容接口-412991?logo=openai&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-原生API-4285F4?logo=google&logoColor=white)

**Gemini API 代理服务** - 支持 OpenAI 兼容接口、Gemini 原生接口、凭证池管理、Discord Bot 集成

作者：**Catie猫猫**

<details>
<summary><strong>✨ 功能特性</strong>（点击展开）</summary>

- 🔄 **OpenAI 兼容 API** - 直接替换 OpenAI 端点使用
- 🔶 **Gemini 原生 API** - 支持 generateContent / streamGenerateContent
- 🔀 **反向代理** - 可作为 Gemini API 反代使用
- 🔑 **凭证池管理** - 支持多凭证轮询、自动刷新 Token、失效自动禁用
- 👥 **用户系统** - 注册登录、配额管理、使用统计
- 🤖 **Discord Bot** - 通过 Discord 注册、获取 API Key、贡献凭证
- 📊 **实时监控** - WebSocket 推送、使用日志、统计面板
- 🔐 **OAuth 授权** - 支持 Google OAuth 获取 Gemini 凭证
- 📢 **公告系统** - 支持发布公告，强制阅读倒计时

</details>

<details>
<summary><strong>📡 API 接口</strong>（点击展开）</summary>

### OpenAI 兼容接口

```text
POST /v1/chat/completions
POST /chat/completions
```

### Gemini 原生接口

```text
POST /v1beta/models/{model}:generateContent
POST /v1/models/{model}:generateContent
POST /models/{model}:generateContent

POST /v1beta/models/{model}:streamGenerateContent
POST /v1/models/{model}:streamGenerateContent
POST /models/{model}:streamGenerateContent

GET /v1beta/models
GET /v1/models
GET /models
```

### 支持的模型

- `gemini-2.5-flash`
- `gemini-2.5-pro`
- `gemini-3-pro-preview`

支持后缀：`-maxthinking` / `-nothinking` / `-search`

</details>

<details>
<summary><strong>📝 使用示例</strong>（点击展开）</summary>

> ⚠️ **重要提示：示例中的占位符必须替换成你自己的值！**
>
> | 占位符 | 需要替换成 | 在哪获取 |
> |--------|-----------|---------|
> | `http://localhost:5001` | 你的服务器地址 | 部署时确定（如 `https://api.你的域名.com`） |
> | `cat-your-api-key` | 你的 API Key | 登录后台 → 仪表盘 → 复制 API Key |

**OpenAI 格式：**

```bash
curl https://你部署的域名或IP:端口/v1/chat/completions \
  -H "Authorization: Bearer cat-你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{"model": "gemini-2.5-flash", "messages": [{"role": "user", "content": "Hello!"}]}'
```

**Gemini 格式：**

```bash
curl https://你的地址/v1beta/models/gemini-2.5-flash:generateContent \
  -H "Authorization: Bearer 你的API-Key" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello!"}]}]}'
```

</details>

<details>
<summary><strong>📁 项目结构</strong>（点击展开）</summary>

```text
CatieCli/
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── routers/  # API 路由
│   │   ├── models/   # 数据模型
│   │   ├── services/ # 业务逻辑
│   │   └── config.py # 配置
│   ├── run.py        # 启动入口
│   └── requirements.txt
├── frontend/         # React 前端
│   ├── src/
│   │   ├── pages/    # 页面组件
│   │   └── api.js    # API 客户端
│   └── package.json
└── discord-bot/      # Discord Bot
    ├── bot.py
    └── requirements.txt
```

</details>

## 🚀 部署教程

### ☁️ Zeabur 一键部署（最简单）

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates/54DBZN)

点击按钮 → 登录 Zeabur → 设置管理员密码 → 完成！

---

### 🎯 一键安装（推荐）

SSH 登录服务器，复制粘贴这一行命令：

```bash
curl -sSL https://raw.githubusercontent.com/mzrodyu/CatieCli/main/install.sh | bash
```

自动完成：安装 Docker → 下载代码 → 询问密码 → 启动服务

---

### 🦥 懒人专属（给复制粘贴都嫌累的人）

如果服务器已装好 Docker，一行搞定：

```bash
docker run -d -p 5001:5001 -v catiecli-data:/app/data --name catiecli ghcr.io/mzrodyu/catiecli:latest
```

访问 `http://你的IP:5001`，默认账号 `admin` / `admin123`

> ⚠️ 注意：这个镜像可能不是最新版，建议用上面的一键安装

---

<details>
<summary><strong>📦 方式一：1Panel 面板部署（推荐新手）</strong>（点击展开详细步骤）</summary>

> 💡 1Panel 是一个开源的 Linux 服务器管理面板，官网：<https://1panel.cn>

#### 第一步：安装 1Panel（如已安装跳过）

```bash
curl -sSL https://resource.fit2cloud.com/1panel/package/quick_start.sh -o quick_start.sh && bash quick_start.sh
```

安装完成后，浏览器访问 `http://你的服务器IP:面板端口` 进入 1Panel。

#### 第二步：下载项目代码

在 1Panel 左侧菜单点击 **"终端"**，输入以下命令：

```bash
cd /opt
git clone https://github.com/mzrodyu/CatieCli.git
```

#### 第三步：创建后端运行环境

1. 1Panel 左侧 **"网站"** → **"Python"** → **"创建运行环境"**
2. 填写表单：

| 配置项   | 填什么                                             |
| -------- | -------------------------------------------------- |
| 名称     | `catiecli`（随便起）                               |
| 项目目录 | `/opt/CatieCli/backend`（点文件夹图标选择）        |
| 启动命令 | `pip install -r requirements.txt && python run.py` |
| 应用     | Python 3.10+                                       |
| 容器名称 | `catiecli`                                         |

3. 配置环境变量（**必须修改默认值！**）：

| 变量名           | 值（改成你的！）                    |
| ---------------- | ----------------------------------- |
| `ADMIN_USERNAME` | `admin`（或自定义用户名）           |
| `ADMIN_PASSWORD` | **你的强密码**（❌ 不要用 admin123） |
| `SECRET_KEY`     | **随机字符串**（如 `abc123xyz789`） |

4. 如果用 IP+端口 访问，添加端口映射 `5001:5001` 并开放防火墙

5. 点击确认，等待启动完成（状态变绿）

#### 第四步：测试访问

浏览器访问：`http://你的服务器IP:5001`

看到登录页面就成功了！🎉

用刚才设置的用户名密码登录。

---

#### 第五步：配置域名访问（可选但推荐）

1. 在 1Panel 左侧点击 **"网站"** → **"网站"**
2. 点击 **"创建网站"** → 选择 **"反向代理"**
3. 填写：
   - 主域名：`你的域名`（如 `api.example.com`）
   - 代理地址：`http://127.0.0.1:5001`
4. 点击确认
5. 如需 HTTPS，点击网站列表中你的域名 → **"HTTPS"** → 申请证书

---

#### 第六步：部署 Discord Bot（可选）

如果你需要 Discord Bot 功能：

1. 去 [Discord Developer Portal](https://discord.com/developers/applications) 创建 Bot，获取 Token
2. 在 1Panel 再次进入 **"运行环境"** → **"Python"** → **"创建运行环境"**
3. 填写：

| 配置项   | 填什么                                             |
| -------- | -------------------------------------------------- |
| 名称     | `catiecli-bot`                                     |
| 项目目录 | `/opt/CatieCli/discord-bot`                        |
| 启动命令 | `pip install -r requirements.txt && python bot.py` |
| 应用     | Python 3.10+                                       |
| 容器名称 | `catiecli-bot`                                     |

4. 添加环境变量：

> ⚠️ **这些值必须根据你的实际情况填写！**

| 变量名           | 说明                                    | 示例值（需修改！）                                 |
| ---------------- | --------------------------------------- | -------------------------------------------------- |
| `DISCORD_TOKEN`  | 你在 Discord 开发者后台获取的 Bot Token | `MTIzNDU2Nzg5...`（很长一串）                      |
| `API_BASE_URL`   | 后端内部地址（容器内访问）              | `http://catiecli:5001`（这个一般不用改）           |
| `API_PUBLIC_URL` | 用户实际访问的地址                      | `https://api.example.com` 或 `http://1.2.3.4:5001` |

**示例配置：**

假设你的域名是 `api.mysite.com`：

```text
DISCORD_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.XXXXXX.YYYYYYYYYYYYYYYYYYYYYYYY
API_BASE_URL=http://catiecli:5001
API_PUBLIC_URL=https://api.mysite.com
```

假设你用 IP 访问，IP 是 `123.45.67.89`：

```text
DISCORD_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.XXXXXX.YYYYYYYYYYYYYYYYYYYYYYYY
API_BASE_URL=http://catiecli:5001
API_PUBLIC_URL=http://123.45.67.89:5001
```

5. 点击确认，等待启动

</details>

<details>
<summary><strong>💻 方式二：命令行部署</strong>（点击展开）</summary>

#### 后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 首次启动会自动创建 .env 文件
# 可选：编辑 .env 修改配置

# 启动服务
python run.py
```

#### Discord Bot

```bash
cd discord-bot

# 安装依赖
pip install -r requirements.txt

# 设置环境变量
export DISCORD_TOKEN=your_discord_bot_token
export API_BASE_URL=http://localhost:5001
export API_PUBLIC_URL=https://your-domain.com

# 启动 Bot
python bot.py
```

</details>

<details>
<summary><strong>🐳 方式三：Docker Compose 部署</strong>（点击展开）</summary>

```bash
# 1. 克隆代码
git clone https://github.com/mzrodyu/CatieCli.git
cd CatieCli

# 2. 创建配置文件
cp .env.example .env

# 3. 修改配置（必须改 ADMIN_PASSWORD 和 SECRET_KEY！）
nano .env

# 4. 一键启动
docker-compose up -d

# 5. 查看日志
docker-compose logs -f
```

访问 `http://你的IP:5001` 即可

**启用 Discord Bot**：编辑 `docker-compose.yml`，取消 bot 服务的注释，填入 Token 后重启。

</details>

<details>
<summary><strong>🔄 更新升级</strong>（点击展开）</summary>

**Docker Compose**：

```bash
cd /你的安装目录 && git pull && docker-compose up -d --build
```

**1Panel**：

```bash
cd /opt/CatieCli && git pull
# 然后在 1Panel 面板重启运行环境
```

**一键脚本**：

```bash
cd /opt/catiecli && git pull && docker-compose up -d --build
```

> ⚠️ 更新后请清除浏览器缓存！按 `Ctrl+Shift+R` 强制刷新。

</details>

## ⚠️ 注意事项

- **首次启动**自动创建 `.env` 配置文件和管理员账号
- **环境变量优先级**高于 `.env` 文件配置
- **修改管理员**用户名/密码后重启即生效，旧管理员自动降级
- **前端已构建**，无需手动 npm build
- **默认账号**：`admin` / `admin123`（请立即修改！）
- **默认端口**：`5001`，可通过环境变量 `PORT` 自定义
- **Google OAuth**：已内置 Gemini CLI 官方凭据，无需配置即可使用

### 关于 Google OAuth 凭据

项目已内置 Gemini CLI 官方公开凭据，**无需额外配置**即可获取 Gemini 凭证。

⚠️ **注意**：如果你自己配置了 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`，需要在 [Google Cloud Console](https://console.cloud.google.com/apis/credentials) 添加回调地址 `http://localhost:8080`，否则会报 `redirect_uri_mismatch` 错误。

**建议**：直接使用默认凭据，不要自己配置。

### 端口说明

> ⚠️ **不同部署方式，端口不同！请仔细阅读！**

| 部署方式                 | 默认端口 | 能否修改   | 说明                           |
| ------------------------ | -------- | ---------- | ------------------------------ |
| **Zeabur**               | `8080`   | ❌ 不能改   | Zeabur 平台固定要求 8080       |
| **Docker/1Panel/命令行** | `5001`   | ✅ 可自定义 | 通过 `PORT` 环境变量修改       |
| **域名反向代理**         | 无所谓   | -          | 用户只看到域名，端口由代理处理 |

**简单来说：**

- **Zeabur 部署** → 不用管，自动 8080
- **自己服务器** → 默认 5001，想改就设置 `PORT=你想要的端口`
- **用域名访问** → 不用管端口

### 自定义端口（仅 Docker/1Panel/命令行）

> ⚠️ **Zeabur 用户请忽略此节！Zeabur 必须是 8080！**

**Docker Compose：**

```yaml
environment:
  - PORT=你想要的端口
ports:
  - "你想要的端口:你想要的端口"
```

**1Panel / 命令行：** 设置环境变量

```text
PORT=你想要的端口
```

<details>
<summary><strong>⚙️ 配置说明</strong>（点击展开详细配置）</summary>

### 后端配置 (.env)

> ⚠️ **重要：带有 `改成xxx` 或 `your-xxx` 的值都必须替换！**

```env
# ========================
# 必须配置（不改会有安全风险）
# ========================

# JWT 密钥 - 用于加密 Token，必须是随机字符串！
# ❌ 错误：SECRET_KEY=your-super-secret-key
# ✅ 正确：SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6（随便敲）
SECRET_KEY=改成随机字符串别用这个

# 管理员账号
ADMIN_USERNAME=admin
# ❌ 错误：ADMIN_PASSWORD=admin123（太简单）
# ✅ 正确：ADMIN_PASSWORD=MySecure@Pass2024
ADMIN_PASSWORD=改成你的强密码

# ========================
# 可选配置（有默认值）
# ========================

# 数据库（一般不用改）
DATABASE_URL=sqlite+aiosqlite:///./data/gemini_proxy.db

# 服务端口（使用域名反代可不配置）
# PORT=5001

# 默认用户每日配额
DEFAULT_DAILY_QUOTA=100

# 是否允许注册
ALLOW_REGISTRATION=true

# Google OAuth（已内置默认凭据，无需配置）
# 如需自定义，取消注释并填入你的凭据
# GOOGLE_CLIENT_ID=your-client-id
# GOOGLE_CLIENT_SECRET=your-client-secret

# Discord OAuth 登录（可选）
# 配置后用户可通过 Discord 账号登录/注册
# DISCORD_CLIENT_ID=你的客户端ID
# DISCORD_CLIENT_SECRET=你的客户端密钥
# DISCORD_REDIRECT_URI=https://你的域名/api/auth/discord/callback
```

**完整示例（可直接复制修改）：**

```env
SECRET_KEY=j8k2m5n7p9q1r3s6t8v0w2x4y6z8a1b3
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MySecurePassword2024!
DATABASE_URL=sqlite+aiosqlite:///./data/gemini_proxy.db
DEFAULT_DAILY_QUOTA=100
ALLOW_REGISTRATION=true
```

### Discord OAuth 登录配置（可选）

如果需要用户通过 **Discord 账号登录/注册**（不是 Bot），需要配置：

#### 第一步：创建 Discord 应用

1. 登录 [Discord Developer Portal](https://discord.com/developers/applications)
2. 点击 **"New Application"** 创建应用
3. 进入应用后，点击左侧 **"OAuth2"**
4. 在 **"Redirects"** 部分添加回调地址：

   ```
   https://你的域名/api/auth/discord/callback
   ```

   如果没有域名，使用 IP+端口：

   ```
   http://你的IP:5001/api/auth/discord/callback
   ```

5. 复制 **Client ID** 和 **Client Secret**（点击 Reset Secret 生成）

#### 第二步：配置环境变量

在 `.env` 文件中添加：

```env
DISCORD_CLIENT_ID=你复制的Client_ID
DISCORD_CLIENT_SECRET=你复制的Client_Secret
DISCORD_REDIRECT_URI=https://你的域名/api/auth/discord/callback
```

#### 第三步：重启服务

重启后，登录/注册页面会显示 **"使用 Discord 登录"** 按钮。

#### 第四步：设置"仅允许 Discord 登录注册"（可选）

如果希望只允许通过 Discord 注册（禁用普通注册），在管理后台 **"系统设置"** 中开启 **"仅允许 Discord 登录注册"** 开关。

### Discord Bot 配置

| 环境变量         | 说明                        |
| ---------------- | --------------------------- |
| `DISCORD_TOKEN`  | Discord Bot Token           |
| `API_BASE_URL`   | 后端 API 地址（内部）       |
| `API_PUBLIC_URL` | 后端 API 地址（显示给用户） |
| `ADMIN_ROLE_ID`  | 管理员角色 ID（可选）       |

</details>

<details>
<summary><strong>📡 API 使用 & Discord Bot 命令</strong>（点击展开）</summary>

## API 使用

### OpenAI 兼容接口

> 💡 端口默认 `5001`，可通过环境变量 `PORT` 自定义。如果使用域名反向代理，直接用域名即可。

```bash
# 本地/IP 访问（替换为你的端口）
curl http://localhost:5001/v1/chat/completions \
  -H "Authorization: Bearer cat-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# 域名访问
curl https://your-domain.com/v1/chat/completions \
  -H "Authorization: Bearer cat-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### 支持的模型

- `gemini-2.5-flash` / `gemini-2.5-flash-preview-05-20`
- `gemini-2.5-pro` / `gemini-2.5-pro-preview-05-06`
- `gemini-2.0-flash`
- `gemini-2.0-flash-lite`

## 🤖 Discord Bot 命令

| 命令        | 说明                    |
| ----------- | ----------------------- |
| `/register` | 注册账号                |
| `/key`      | 获取 API Key            |
| `/resetkey` | 重新生成 API Key        |
| `/stats`    | 查看使用统计            |
| `/donate`   | 贡献凭证获取 OAuth 链接 |
| `/callback` | 提交 OAuth 回调 URL     |

</details>

<details>
<summary><strong>🐳 Docker 单独部署</strong>（点击展开）</summary>

## Docker 部署

### 后端

```bash
cd backend
docker build -t catiecli-backend .
docker run -d -p 5001:5001 -v ./data:/app/data --env-file .env catiecli-backend
```

### Discord Bot

```bash
cd discord-bot
docker build -t catiecli-bot .
docker run -d --env-file .env catiecli-bot
```

</details>

<details>
<summary><strong>🔄 详细更新指南</strong>（点击展开）</summary>

## 更新指南

当有新版本发布时，按以下步骤更新你的部署。

### 第一步：拉取最新代码

SSH 连接到你的服务器，进入项目目录：

```bash
cd /opt/CatieCli  # 替换为你的实际安装目录
```

拉取最新代码：

```bash
git pull
```

**如果提示冲突或失败**，使用强制更新：

```bash
git fetch --all
git reset --hard origin/main
```

> ⚠️ 强制更新会覆盖本地修改，但不会影响 `data/` 目录的数据库。

### 第二步：重启服务

根据你的部署方式选择：

**方式一：Docker Compose（推荐）**

```bash
# 停止旧容器
docker-compose down

# 重新构建并启动（会自动使用新代码）
docker-compose up -d --build
```

**方式二：1Panel 运行环境**

1. 打开 1Panel 管理面板
2. 进入「网站」→「运行环境」
3. 找到你的应用（如 `catiecli`）
4. 点击右侧的「重启」按钮
5. 等待状态变为「运行中」

**方式三：直接运行（开发模式）**

```bash
# 如果有正在运行的进程，先停止
pkill -f "uvicorn app.main:app"

# 重新启动
cd backend
pip install -r requirements.txt  # 如果有新依赖
python run.py
```

### 第三步：清除浏览器缓存

**这一步很重要！** 更新后必须清除浏览器缓存，否则可能加载旧的 JS 文件导致报错。

| 系统    | 快捷键                            |
| ------- | --------------------------------- |
| Windows | `Ctrl + Shift + R` 或 `Ctrl + F5` |
| Mac     | `Cmd + Shift + R`                 |
| Linux   | `Ctrl + Shift + R`                |

**或者手动清除：**

1. 按 `F12` 打开开发者工具
2. 右键点击浏览器的刷新按钮
3. 选择「清空缓存并硬性重新加载」

### 一键更新脚本

你也可以创建一个更新脚本 `/opt/CatieCli/update.sh`：

```bash
#!/bin/bash
cd /opt/CatieCli
echo "📥 拉取最新代码..."
git pull
echo "🔄 重启服务..."
docker-compose down
docker-compose up -d --build
echo "✅ 更新完成！请清除浏览器缓存后刷新页面"
```

赋予执行权限后即可使用：

```bash
chmod +x /opt/CatieCli/update.sh
/opt/CatieCli/update.sh
```

</details>

<details>
<summary><strong>❓ 常见问题 FAQ</strong>（点击展开）</summary>

### Q: 页面报错 `xxx is not defined` 或页面空白

**原因**: 浏览器缓存了旧的 JavaScript 文件，与新版本不兼容。

**解决方法**:

1. 按 `Ctrl + Shift + R`（Mac 用 `Cmd + Shift + R`）强制刷新
2. 如果还不行，打开浏览器设置清除所有缓存
3. 或者使用无痕/隐私模式访问测试

### Q: 更新后页面没有变化

**排查步骤**:

1. **确认代码已更新**：

   ```bash
   cd /opt/CatieCli
   git log -1  # 查看最新提交
   ```

2. **确认服务已重启**：

   ```bash
   docker-compose ps  # 查看容器状态
   ```

3. **确认浏览器缓存已清除**：按 `Ctrl + Shift + R`

### Q: 数据库数据会丢失吗？

**不会！** 数据库文件存储在 `data/` 目录，该目录已被 `.gitignore` 忽略，更新代码不会影响你的数据。

包括以下数据都会保留：

- 用户账号
- API Key
- 凭证信息
- 使用记录
- 系统设置

### Q: OAuth 获取凭证时提示 `redirect_uri_mismatch`

**原因**: Google OAuth 的回调地址必须是 `http://localhost:8080`

**解决方法**: 这是正常的！按照 OAuth 页面的教程操作，复制完整的回调 URL 粘贴到系统中即可。

### Q: 凭证显示"无效"或"已禁用"

**可能原因**:

1. Google 账号被封禁
2. Refresh Token 已过期
3. 账号未开通 Gemini API

**解决方法**: 删除该凭证，重新通过 OAuth 授权获取新凭证。

### Q: 如何备份数据？

只需要备份 `data/` 目录即可：

```bash
cp -r /opt/CatieCli/data /backup/catiecli-data-$(date +%Y%m%d)
```

### Q: 如何完全重置系统？

```bash
cd /opt/CatieCli
rm -rf data/  # 删除所有数据（谨慎操作！）
docker-compose down
docker-compose up -d --build
```

重启后会自动创建新的数据库和默认管理员账号。

</details>

## 📄 开源协议

MIT License

## 🙏 致谢

本项目参考了 **sukaka 大佬** 的 [gcli2api](https://github.com/sukaka7878/gcli2api) 和 **GG 大佬** 的站点

感谢二位佬！
