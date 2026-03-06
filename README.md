# 🎬 AI Text-to-Video Generator

[English](#english) | [中文](#chinese)

---

<a name="chinese"></a>
## 中文说明

### 项目介绍

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

### 快速开始

#### 方式一：Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/your-username/Animation-Generator.git
cd Animation-Generator

# 2. 配置环境变量（可选）
cp .env.example .env
# 编辑 .env，填入 OPENAI_API_KEY（不填也可以运行）

# 3. 启动服务
docker compose up -d

# 4. 访问应用
# 前端：http://localhost:3000
# 后端 API：http://localhost:8000
# API 文档：http://localhost:8000/docs
```

#### 方式二：本地开发

**后端：**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 设置环境变量（可选）
export OPENAI_API_KEY=your_key_here

# 启动后端
uvicorn app.main:app --reload --port 8000
```

**前端：**
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

### 配置说明

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

### Introduction

**AI Text-to-Video Generator** is a full-stack web application that automatically generates beautiful videos with **AI-generated images, voice narration, and subtitles** from text input.

### Features

- 🎨 **AI Image Generation** - Uses OpenAI DALL·E 3 for each scene (falls back to gradient backgrounds without API key)
- 🎤 **Text-to-Speech** - High-quality voices via edge-tts, supporting Chinese and English
- 🎬 **Video Composition** - MoviePy + FFmpeg with transitions, subtitles, and fade effects
- 📺 **Multiple Resolutions** - 720p / 1080p output
- 🖌️ **Art Styles** - Realistic, Anime, and Watercolor styles
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark/Light Theme** - One-click toggle
- 📚 **History** - All generated videos saved

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + TailwindCSS |
| **Backend** | Python 3.11+ / FastAPI |
| **AI Images** | OpenAI DALL·E 3 (optional) |
| **TTS** | edge-tts |
| **Video** | MoviePy + FFmpeg |
| **Deploy** | Docker + Docker Compose |

### Quick Start

```bash
# Clone the repo
git clone https://github.com/your-username/Animation-Generator.git
cd Animation-Generator

# Optional: Add your OpenAI API key
cp .env.example .env
# Edit .env and set OPENAI_API_KEY (app works without it)

# Start with Docker Compose
docker compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### License

MIT License © 2024
