#!/usr/bin/env bash
# =============================================================
# AI 文字转视频生成器 — 一键启动脚本 (Linux / macOS)
# AI Text-to-Video Generator — One-command startup (Linux/macOS)
# =============================================================
set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}${CYAN}🎬  AI 文字转视频生成器${RESET}"
echo -e "${CYAN}    AI Text-to-Video Generator${RESET}"
echo ""

# ── 1. 检查 Docker ──────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  echo -e "${RED}✗ 未检测到 Docker。请先安装 Docker Desktop：${RESET}"
  echo -e "  ${YELLOW}https://www.docker.com/products/docker-desktop/${RESET}"
  exit 1
fi

# 检查 Docker 守护进程是否运行
if ! docker info &>/dev/null 2>&1; then
  echo -e "${RED}✗ Docker 守护进程未启动。${RESET}"
  echo -e "  请先启动 Docker Desktop，然后重新运行此脚本。"
  exit 1
fi

echo -e "${GREEN}✓ Docker 已就绪${RESET}"

# ── 2. 创建 .env（如不存在）─────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ 已从 .env.example 创建 .env 配置文件${RESET}"
  echo -e "${YELLOW}  提示：如需使用 DALL·E AI 图片生成，请编辑 .env 并填入 OPENAI_API_KEY${RESET}"
  echo -e "${YELLOW}  （不填也可以正常使用，系统会自动使用渐变背景图片）${RESET}"
else
  echo -e "${GREEN}✓ 使用已有的 .env 配置文件${RESET}"
fi

echo ""

# ── 3. 构建并启动服务 ──────────────────────────────────────
echo -e "${BOLD}正在构建并启动服务（首次运行需要几分钟下载镜像）...${RESET}"
echo ""

docker compose up --build -d

echo ""

# ── 4. 读取端口配置（用于健康检查和访问地址）─────────────
FRONTEND_PORT=$(grep -E '^FRONTEND_PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]')
BACKEND_PORT=$(grep -E '^BACKEND_PORT=' .env 2>/dev/null | cut -d= -f2 | tr -d '[:space:]')
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-8000}

# ── 5. 等待后端健康检查通过 ────────────────────────────────
echo -e "等待后端服务启动..."
MAX_WAIT=60
ELAPSED=0
until curl -sf "http://localhost:${BACKEND_PORT}/health" &>/dev/null; do
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo -e "${YELLOW}⚠ 后端启动超时，请运行 'docker compose logs backend' 查看日志${RESET}"
    break
  fi
  printf "."
done
echo ""

# ── 6. 打印访问地址 ────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}🎉 启动成功！${RESET}"
echo ""
echo -e "  ${BOLD}📺 打开应用：${RESET}  ${CYAN}http://localhost:${FRONTEND_PORT}${RESET}"
echo -e "  ${BOLD}📖 API 文档：${RESET}  ${CYAN}http://localhost:${BACKEND_PORT}/docs${RESET}"
echo ""
echo -e "  常用命令："
echo -e "    停止服务：  ${YELLOW}docker compose down${RESET}"
echo -e "    查看日志：  ${YELLOW}docker compose logs -f${RESET}"
echo -e "    重新构建：  ${YELLOW}docker compose up --build -d${RESET}"
echo ""
