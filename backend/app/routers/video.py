"""
视频生成相关 API 路由
"""
import os
import asyncio
from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.models.schemas import (
    GenerateRequest,
    TaskProgress,
    TaskStatus,
    VideoInfo,
    VoiceInfo,
)
from app.services.text_parser import parse_text_to_scenes
from app.services.image_generator import generate_image
from app.services.tts_service import synthesize_speech, get_audio_duration, get_voices
from app.services.video_composer import compose_video
from app.utils.helpers import generate_task_id, generate_video_id, get_timestamp, truncate_text

router = APIRouter(prefix="/api/v1", tags=["video"])

# 内存中存储任务状态和视频列表（生产环境应使用数据库）
tasks: dict[str, TaskProgress] = {}
video_list: list[VideoInfo] = []


@router.post("/generate", response_model=dict)
async def generate_video(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
):
    """
    提交视频生成任务
    
    接收文字和设置参数，异步生成视频，返回 task_id
    """
    task_id = generate_task_id()
    
    # 初始化任务状态
    tasks[task_id] = TaskProgress(
        task_id=task_id,
        status=TaskStatus.PENDING,
        progress=0,
        message="任务已创建，等待处理...",
    )
    
    # 异步执行生成任务
    background_tasks.add_task(
        _run_generation_pipeline,
        task_id=task_id,
        request=request,
    )
    
    return {"task_id": task_id, "message": "任务已提交"}


@router.get("/status/{task_id}", response_model=TaskProgress)
async def get_task_status(task_id: str):
    """查询任务进度"""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="任务不存在")
    return tasks[task_id]


@router.get("/videos", response_model=list[VideoInfo])
async def list_videos():
    """获取历史视频列表"""
    return sorted(video_list, key=lambda v: v.created_at, reverse=True)


@router.get("/videos/{video_id}/download")
async def download_video(video_id: str):
    """下载视频文件"""
    video = next((v for v in video_list if v.video_id == video_id), None)
    if not video:
        raise HTTPException(status_code=404, detail="视频不存在")
    
    file_path = os.path.join(settings.output_dir, f"{video_id}.mp4")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="视频文件不存在")
    
    return FileResponse(
        path=file_path,
        media_type="video/mp4",
        filename=f"{video_id}.mp4",
    )


@router.get("/voices", response_model=list[VoiceInfo])
async def list_voices():
    """获取可用语音列表"""
    voices = get_voices()
    return [VoiceInfo(**v) for v in voices]


async def _run_generation_pipeline(task_id: str, request: GenerateRequest):
    """
    视频生成完整流程
    
    阶段：
    1. 解析文字 → 场景列表
    2. 生成图片
    3. 合成语音
    4. 合成视频
    """
    try:
        video_id = generate_video_id(request.text)
        width = 1280 if request.resolution == "720p" else 1920
        height = 720 if request.resolution == "720p" else 1080
        
        # ===== 阶段 1: 解析文字 =====
        _update_task(task_id, TaskStatus.PARSING, 5, "正在解析文字内容...")
        await asyncio.sleep(0.1)  # 让状态更新传播
        
        scenes = parse_text_to_scenes(request.text, request.duration_per_scene)
        total_scenes = len(scenes)
        
        _update_task(task_id, TaskStatus.PARSING, 10, f"文字解析完成，共 {total_scenes} 个场景")
        
        # ===== 阶段 2: 生成图片 =====
        _update_task(task_id, TaskStatus.GENERATING_IMAGES, 15, "开始生成 AI 图片...")
        
        for i, scene in enumerate(scenes):
            img_path = os.path.join(settings.temp_dir, f"{video_id}_scene_{i}.png")
            await generate_image(
                scene_text=scene["text"],
                art_style=request.art_style,
                output_path=img_path,
                width=width,
                height=height,
            )
            scene["image_path"] = img_path
            
            progress = 15 + int((i + 1) / total_scenes * 35)
            _update_task(
                task_id,
                TaskStatus.GENERATING_IMAGES,
                progress,
                f"正在生成图片 {i + 1}/{total_scenes}...",
            )
        
        # ===== 阶段 3: 合成语音 =====
        _update_task(task_id, TaskStatus.SYNTHESIZING_VOICE, 52, "开始合成语音...")
        
        for i, scene in enumerate(scenes):
            audio_path = os.path.join(settings.temp_dir, f"{video_id}_audio_{i}.mp3")
            try:
                await synthesize_speech(
                    text=scene["text"],
                    voice=request.voice,
                    output_path=audio_path,
                )
                scene["audio_path"] = audio_path
                # 根据实际音频时长调整场景时长
                actual_duration = await get_audio_duration(audio_path)
                scene["duration"] = max(actual_duration + 0.5, request.duration_per_scene)
            except Exception as e:
                print(f"场景 {i} 语音合成失败: {e}")
                # 语音失败不阻断流程
            
            progress = 52 + int((i + 1) / total_scenes * 20)
            _update_task(
                task_id,
                TaskStatus.SYNTHESIZING_VOICE,
                progress,
                f"正在合成语音 {i + 1}/{total_scenes}...",
            )
        
        # ===== 阶段 4: 合成视频 =====
        _update_task(task_id, TaskStatus.COMPOSING_VIDEO, 74, "开始合成视频...")
        
        output_path = os.path.join(settings.output_dir, f"{video_id}.mp4")
        
        # 在事件循环中运行阻塞的视频合成
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            compose_video,
            scenes,
            output_path,
            request.resolution,
        )
        
        _update_task(task_id, TaskStatus.COMPOSING_VIDEO, 95, "视频合成完成，正在处理...")
        
        # 获取文件信息
        file_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        total_duration = sum(s.get("duration", 5) for s in scenes)
        
        # 保存视频信息
        video_info = VideoInfo(
            video_id=video_id,
            title=truncate_text(request.text, 40),
            created_at=get_timestamp(),
            duration=total_duration,
            resolution=request.resolution,
            file_size=file_size,
            download_url=f"/api/v1/videos/{video_id}/download",
        )
        video_list.append(video_info)
        
        # 清理临时文件
        _cleanup_temp_files(video_id, total_scenes)
        
        # 标记完成
        _update_task(
            task_id,
            TaskStatus.COMPLETED,
            100,
            "视频生成成功！",
            video_id=video_id,
        )
    
    except Exception as e:
        print(f"视频生成失败: {e}")
        import traceback
        traceback.print_exc()
        tasks[task_id] = TaskProgress(
            task_id=task_id,
            status=TaskStatus.FAILED,
            progress=tasks[task_id].progress,
            message="视频生成失败",
            error=str(e),
        )


def _update_task(
    task_id: str,
    status: TaskStatus,
    progress: int,
    message: str,
    video_id: str = None,
):
    """更新任务状态"""
    tasks[task_id] = TaskProgress(
        task_id=task_id,
        status=status,
        progress=progress,
        message=message,
        video_id=video_id,
    )


def _cleanup_temp_files(video_id: str, total_scenes: int):
    """清理临时文件"""
    for i in range(total_scenes):
        for suffix in [f"_scene_{i}.png", f"_audio_{i}.mp3"]:
            path = os.path.join(settings.temp_dir, f"{video_id}{suffix}")
            if os.path.exists(path):
                try:
                    os.remove(path)
                except Exception:
                    pass
