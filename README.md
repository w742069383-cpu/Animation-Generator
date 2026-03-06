# 🎬 AI Text-to-Video Generator

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 🚀 如何启动使用（How to Start）

> **应用已生成完毕，按以下步骤即可打开使用：**

### 第一步：安装 Docker Desktop

Docker 是运行本应用的唯一前置依赖，安装后无需配置 Python 或 Node.js 环境。

| 系统 | 下载地址 |
|------|---------|
| Windows | https://www.docker.com/products/docker-desktop/ |
| macOS | https://www.docker.com/products/docker-desktop/ |
| Linux | https://docs.docker.com/engine/install/ |

安装后**打开 Docker Desktop**，等待左下角状态变为绿色"Running"。

---

### 第二步：启动应用

在项目根目录下运行对应系统的启动脚本（双击或在终端执行）：

**macOS / Linux：**
```bash
# 在终端中进入项目目录后执行：
bash start.sh
```

**Windows：**
```
双击运行 start.bat
```

或者，直接使用 Docker Compose 命令：
```bash
# 复制配置文件（首次运行）
cp .env.example .env

# 构建并启动（首次约需 3-5 分钟下载镜像）
docker compose up --build -d
```

---

### 第三步：打开浏览器访问

启动成功后，在浏览器中打开：

| 地址 | 说明 |
|------|------|
| **http://localhost:3000** | 🎬 应用主界面（在这里使用） |
| http://localhost:8000/docs | 📖 后端 API 文档（可选查看） |

---

### 使用说明

1. **输入文字** — 在文本框中输入任意中文或英文内容
2. **选择设置** — 选择语音、分辨率（720p/1080p）、AI 画风
3. **点击"开始生成视频"** — 系统自动完成 4 个阶段：
   - 📝 解析文字 → 🎨 生成 AI 图片 → 🎤 合成语音 → 🎬 合成视频
4. **下载视频** — 生成完成后可直接在页面预览并下载 MP4

> **无需 OpenAI API Key** — 系统会自动使用渐变背景图片（免费可用）。  
> 如有 OpenAI API Key 可在 `.env` 文件中填写 `OPENAI_API_KEY=sk-...` 以使用 DALL·E 3 生成 AI 图片。

---

### 常用命令

```bash
# 停止应用
docker compose down

# 查看运行日志
docker compose logs -f

# 重新构建（更新代码后）
docker compose up --build -d

# 查看容器状态
docker compose ps
```

---

### 常见问题

**Q: 端口 3000 或 8000 被占用怎么办？**  
编辑 `.env` 文件，修改端口号：
```
FRONTEND_PORT=3001
BACKEND_PORT=8001
```
然后重新运行 `docker compose up --build -d`，访问 `http://localhost:3001`。

**Q: Windows 上运行 `start.bat` 提示找不到 docker？**  
请确保 Docker Desktop 已启动（任务栏中有鲸鱼图标），然后重试。

**Q: 视频生成失败怎么办？**  
运行 `docker compose logs backend` 查看后端日志，确认错误原因。

---

## 项目介绍

**AI 文字转视频生成器** 是一个完整的全栈 Web 应用，用户只需输入文字内容，系统就能自动生成带有 **AI 动画画面、语音旁白和字幕**的精美视频。

### 功能特性

- 🎨 **AI 图片生成** - 使用 OpenAI DALL·E 3 为每个场景生成对应画面（无 API Key 时自动降级为渐变背景）
- 🎤 **语音合成** - 基于 edge-tts 免费高质量语音，支持中英文多种声音
- 🎬 **视频合成** - MoviePy + FFmpeg 自动拼接场景、添加字幕、淡入淡出效果
- 📺 **多分辨率** - 支持 720p / 1080p 输出
- 🖌️ **多画风** - 写实、动漫、水彩三种 AI 绘画风格
- 📱 **响应式设计** - 完美适配桌面和移动端
- 🌙 **深色/浅色主题** - 一键切换
- 📚 **历史记录** - 保存所有生成的视频

### 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 18 + Vite + TailwindCSS |
| **后端** | Python 3.11+ / FastAPI |
| **AI 图片生成** | OpenAI DALL·E 3 API（可选）|
| **语音合成** | edge-tts |
| **视频合成** | MoviePy + FFmpeg |
| **部署** | Docker + Docker Compose |

### 本地开发模式（不使用 Docker）

如需在本地直接开发调试：

**后端：**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 安装系统依赖（macOS）
brew install ffmpeg

# 启动后端（开发模式，支持热重载）
uvicorn app.main:app --reload --port 8000
```

**前端（另开一个终端）：**
```bash
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

### API 文档

| 方法 | 路径 | 描述 |
|------|------|------|
| `POST` | `/api/v1/generate` | 提交视频生成任务 |
| `GET` | `/api/v1/status/{task_id}` | 查询任务进度 |
| `GET` | `/api/v1/videos` | 历史视频列表 |
| `GET` | `/api/v1/videos/{video_id}/download` | 下载视频 |
| `GET` | `/api/v1/voices` | 可用语音列表 |

交互式 API 文档：`http://localhost:8000/docs`

### 配置说明（.env 文件）

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `OPENAI_API_KEY` | _(空)_ | OpenAI API 密钥（可选，无密钥自动降级）|
| `BACKEND_PORT` | `8000` | 后端服务端口 |
| `FRONTEND_PORT` | `3000` | 前端服务端口 |
| `OUTPUT_DIR` | `./outputs` | 视频输出目录 |
| `TEMP_DIR` | `./temp` | 临时文件目录 |

---

<a name="english"></a>
## English

### How to Start

> **The app is ready. Follow these 3 steps:**

**Step 1 — Install Docker Desktop**

Download from https://www.docker.com/products/docker-desktop/ and start it. Wait for the green "Running" status.

**Step 2 — Launch the app**

```bash
# macOS / Linux
bash start.sh

# Windows — double-click start.bat
```

Or manually:
```bash
cp .env.example .env          # first time only
docker compose up --build -d  # takes ~3-5 min on first run
```

**Step 3 — Open in browser**

| URL | Description |
|-----|-------------|
| **http://localhost:3000** | 🎬 Main app (use this) |
| http://localhost:8000/docs | 📖 API docs |

### Usage

1. Enter any text (Chinese or English) in the text box
2. Choose voice, resolution (720p/1080p), and AI art style
3. Click **"Start Generating"** — the system runs 4 stages automatically:  
   📝 Parse → 🎨 Generate images → 🎤 Synthesize voice → 🎬 Compose video
4. Preview and download the finished MP4

> **No OpenAI API Key required** — gradient backgrounds are used automatically (free).  
> Set `OPENAI_API_KEY=sk-...` in `.env` to enable DALL·E 3 AI images.

### Common Commands

```bash
docker compose down          # stop
docker compose logs -f       # view logs
docker compose up --build -d # rebuild after code changes
docker compose ps            # check status
```

### Features

- 🎨 **AI Image Generation** — DALL·E 3 API (falls back to gradient backgrounds without key)
- 🎤 **Text-to-Speech** — edge-tts, Chinese and English voices
- 🎬 **Video Composition** — MoviePy + FFmpeg, fade transitions, subtitles
- 📺 **Multiple Resolutions** — 720p / 1080p
- 🖌️ **Art Styles** — Realistic, Anime, Watercolor
- 📱 **Responsive** — desktop and mobile
- 🌙 **Dark / Light Theme**
- 📚 **History** — all generated videos saved

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Backend** | Python 3.11+ / FastAPI |
| **AI Images** | OpenAI DALL·E 3 (optional) |
| **TTS** | edge-tts |
| **Video** | MoviePy + FFmpeg |
| **Deploy** | Docker + Docker Compose |

### License

MIT License © 2024
