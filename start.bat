@echo off
:: =============================================================
:: AI 文字转视频生成器 — 一键启动脚本 (Windows)
:: AI Text-to-Video Generator — One-command startup (Windows)
:: =============================================================
setlocal EnableDelayedExpansion
title AI Text-to-Video Generator

echo.
echo  ============================================
echo   🎬  AI 文字转视频生成器
echo       AI Text-to-Video Generator
echo  ============================================
echo.

:: ── 1. 检查 Docker ─────────────────────────────────────────
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Docker。请先安装 Docker Desktop：
    echo        https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker 守护进程未启动。
    echo        请先启动 Docker Desktop，然后重新运行此脚本。
    echo.
    pause
    exit /b 1
)

echo [OK] Docker 已就绪

:: ── 2. 创建 .env（如不存在）────────────────────────────────
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo [OK] 已从 .env.example 创建 .env 配置文件
    echo [提示] 如需使用 DALL·E AI 图片生成，请编辑 .env 并填入 OPENAI_API_KEY
    echo        不填也可以正常使用，系统会自动使用渐变背景图片
) else (
    echo [OK] 使用已有的 .env 配置文件
)

echo.

:: ── 3. 读取端口配置 ──────────────────────────────────────
set FRONTEND_PORT=3000
set BACKEND_PORT=8000
for /f "usebackq tokens=1,2 delims==" %%A in (".env") do (
    if "%%A"=="FRONTEND_PORT" set FRONTEND_PORT=%%B
    if "%%A"=="BACKEND_PORT"  set BACKEND_PORT=%%B
)

:: ── 4. 构建并启动服务 ─────────────────────────────────────
echo 正在构建并启动服务（首次运行需要几分钟下载镜像）...
echo.

docker compose up --build -d
if %errorlevel% neq 0 (
    echo.
    echo [错误] 启动失败，请运行 "docker compose logs" 查看详情
    pause
    exit /b 1
)

:: ── 5. 等待后端就绪 ───────────────────────────────────────
echo.
echo 等待后端服务启动...
set ELAPSED=0
:WAIT_LOOP
timeout /t 2 /nobreak >nul
curl -sf http://localhost:%BACKEND_PORT%/health >nul 2>&1
if %errorlevel% equ 0 goto READY
set /a ELAPSED+=2
if %ELAPSED% geq 60 (
    echo [警告] 后端启动超时，请运行 "docker compose logs backend" 查看日志
    goto SHOW_URLS
)
goto WAIT_LOOP

:READY
:SHOW_URLS
:: ── 6. 打印访问地址 ───────────────────────────────────────
echo.
echo  ============================================
echo   🎉 启动成功！
echo  ============================================
echo.
echo   📺 打开应用：  http://localhost:%FRONTEND_PORT%
echo   📖 API 文档：  http://localhost:%BACKEND_PORT%/docs
echo.
echo   常用命令：
echo     停止服务：  docker compose down
echo     查看日志：  docker compose logs -f
echo     重新构建：  docker compose up --build -d
echo.

:: 自动用浏览器打开
start "" http://localhost:%FRONTEND_PORT%

pause
