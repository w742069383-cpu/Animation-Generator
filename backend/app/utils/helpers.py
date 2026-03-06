"""
工具函数模块
"""
import uuid
import hashlib
from datetime import datetime


def generate_task_id() -> str:
    """生成唯一任务 ID"""
    return str(uuid.uuid4())


def generate_video_id(text: str) -> str:
    """根据文字内容生成视频 ID"""
    hash_val = hashlib.md5(f"{text}{datetime.now().isoformat()}".encode()).hexdigest()[:8]
    return f"video_{hash_val}"


def get_timestamp() -> str:
    """获取当前时间戳字符串"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def split_text_into_sentences(text: str) -> list[str]:
    """将文本按标点符号分割成句子"""
    import re
    # 按中英文句子标点分割
    sentences = re.split(r'[。！？.!?\n]+', text)
    # 过滤空句子，限制最大数量
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences[:20]  # 最多 20 个场景


def truncate_text(text: str, max_length: int = 50) -> str:
    """截断文本用于显示"""
    if len(text) <= max_length:
        return text
    return text[:max_length] + "..."
