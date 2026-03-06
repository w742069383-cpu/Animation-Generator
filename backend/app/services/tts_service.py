"""
TTS 语音合成服务 - 使用 edge-tts
"""
import asyncio
import edge_tts


# 可用语音列表
AVAILABLE_VOICES = [
    {
        "id": "zh-CN-XiaoxiaoNeural",
        "name": "晓晓（普通话女声）",
        "language": "zh-CN",
        "gender": "female",
    },
    {
        "id": "zh-CN-YunxiNeural",
        "name": "云希（普通话男声）",
        "language": "zh-CN",
        "gender": "male",
    },
    {
        "id": "en-US-JennyNeural",
        "name": "Jenny (English Female)",
        "language": "en-US",
        "gender": "female",
    },
    {
        "id": "en-US-GuyNeural",
        "name": "Guy (English Male)",
        "language": "en-US",
        "gender": "male",
    },
]


async def synthesize_speech(text: str, voice: str, output_path: str) -> str:
    """
    合成语音
    
    Args:
        text: 要合成的文字
        voice: 语音 ID（如 zh-CN-XiaoxiaoNeural）
        output_path: 输出音频路径（.mp3）
    
    Returns:
        生成的音频文件路径
    """
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)
    return output_path


async def get_audio_duration(audio_path: str) -> float:
    """
    获取音频时长（秒）
    
    Args:
        audio_path: 音频文件路径
    
    Returns:
        音频时长（秒）
    """
    try:
        from moviepy.editor import AudioFileClip
        clip = AudioFileClip(audio_path)
        duration = clip.duration
        clip.close()
        return duration
    except Exception:
        return 3.0  # 默认 3 秒


def get_voices() -> list[dict]:
    """获取可用语音列表"""
    return AVAILABLE_VOICES
