"""
数据模型和 Pydantic Schema 定义
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class VoiceOption(str, Enum):
    """语音选项枚举"""
    ZH_FEMALE = "zh-CN-XiaoxiaoNeural"
    ZH_MALE = "zh-CN-YunxiNeural"
    EN_FEMALE = "en-US-JennyNeural"
    EN_MALE = "en-US-GuyNeural"


class Resolution(str, Enum):
    """视频分辨率枚举"""
    HD = "720p"
    FULL_HD = "1080p"


class ArtStyle(str, Enum):
    """AI 绘画风格枚举"""
    REALISTIC = "realistic"
    ANIME = "anime"
    WATERCOLOR = "watercolor"


class GenerateRequest(BaseModel):
    """视频生成请求体"""
    text: str = Field(..., min_length=1, max_length=5000, description="输入文字内容")
    voice: VoiceOption = Field(default=VoiceOption.ZH_FEMALE, description="语音选项")
    resolution: Resolution = Field(default=Resolution.HD, description="视频分辨率")
    art_style: ArtStyle = Field(default=ArtStyle.REALISTIC, description="AI 画风")
    duration_per_scene: int = Field(default=5, ge=3, le=15, description="每场景展示时长（秒）")


class TaskStatus(str, Enum):
    """任务状态枚举"""
    PENDING = "pending"
    PARSING = "parsing"
    GENERATING_IMAGES = "generating_images"
    SYNTHESIZING_VOICE = "synthesizing_voice"
    COMPOSING_VIDEO = "composing_video"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskProgress(BaseModel):
    """任务进度模型"""
    task_id: str
    status: TaskStatus
    progress: int = Field(default=0, ge=0, le=100, description="进度百分比")
    message: str = ""
    video_id: Optional[str] = None
    error: Optional[str] = None


class VideoInfo(BaseModel):
    """视频信息模型"""
    video_id: str
    title: str
    created_at: str
    duration: float
    resolution: str
    file_size: int
    download_url: str


class VoiceInfo(BaseModel):
    """语音信息模型"""
    id: str
    name: str
    language: str
    gender: str
