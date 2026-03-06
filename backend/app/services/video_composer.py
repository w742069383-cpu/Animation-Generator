"""
视频合成服务 - 使用 MoviePy 将图片、音频和字幕合成视频
"""
import os
from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
    CompositeVideoClip,
    TextClip,
    ColorClip,
)
from app.config import settings


# 分辨率配置
RESOLUTIONS = {
    "720p": (1280, 720),
    "1080p": (1920, 1080),
}


def compose_video(
    scenes: list[dict],
    output_path: str,
    resolution: str = "720p",
) -> str:
    """
    合成视频
    
    Args:
        scenes: 场景列表，每个场景包含 image_path, audio_path, text, duration
        output_path: 输出视频路径
        resolution: 分辨率（720p/1080p）
    
    Returns:
        生成的视频文件路径
    """
    width, height = RESOLUTIONS.get(resolution, RESOLUTIONS["720p"])
    clips = []
    
    for scene in scenes:
        clip = _create_scene_clip(scene, width, height)
        if clip is not None:
            clips.append(clip)
    
    if not clips:
        raise ValueError("没有可用的场景片段")
    
    # 拼接所有场景
    final_video = concatenate_videoclips(clips, method="compose")
    
    # 导出 MP4
    final_video.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile=os.path.join(settings.temp_dir, "temp_audio.m4a"),
        remove_temp=True,
        verbose=False,
        logger=None,
    )
    
    # 清理
    final_video.close()
    for clip in clips:
        clip.close()
    
    return output_path


def _create_scene_clip(scene: dict, width: int, height: int):
    """
    创建单个场景的视频片段
    
    Args:
        scene: 场景字典
        width, height: 视频尺寸
    
    Returns:
        MoviePy 视频片段
    """
    image_path = scene.get("image_path")
    audio_path = scene.get("audio_path")
    text = scene.get("text", "")
    duration = scene.get("duration", 5)
    
    if not image_path or not os.path.exists(image_path):
        return None
    
    # 创建图片片段
    img_clip = ImageClip(image_path).set_duration(duration)
    img_clip = img_clip.resize((width, height))
    
    # 添加淡入淡出效果
    img_clip = img_clip.fadein(0.5).fadeout(0.5)
    
    layers = [img_clip]
    
    # 添加字幕
    if text:
        subtitle_clip = _create_subtitle(text, width, height, duration)
        if subtitle_clip is not None:
            layers.append(subtitle_clip)
    
    # 合成图片层和字幕层
    scene_clip = CompositeVideoClip(layers, size=(width, height))
    
    # 添加音频
    if audio_path and os.path.exists(audio_path):
        try:
            audio = AudioFileClip(audio_path)
            # 确保音频不超过视频时长
            audio_duration = min(audio.duration, duration)
            audio = audio.subclip(0, audio_duration)
            scene_clip = scene_clip.set_audio(audio)
        except Exception as e:
            print(f"添加音频失败: {e}")
    
    return scene_clip


def _create_subtitle(text: str, width: int, height: int, duration: float):
    """
    创建字幕片段
    
    Args:
        text: 字幕文字
        width, height: 视频尺寸
        duration: 时长
    
    Returns:
        字幕视频片段
    """
    try:
        # 字幕背景
        subtitle_height = 80
        subtitle_bg = ColorClip(
            size=(width, subtitle_height),
            color=[0, 0, 0],
        ).set_opacity(0.6).set_duration(duration)
        subtitle_bg = subtitle_bg.set_position(("center", height - subtitle_height))
        
        # 字幕文字（截断过长文字）
        display_text = text if len(text) <= 40 else text[:40] + "..."
        
        # 尝试用 ImageMagick/Pillow 创建文字图片
        txt_clip = _create_text_image_clip(display_text, width, subtitle_height, duration)
        
        if txt_clip:
            txt_clip = txt_clip.set_position(("center", height - subtitle_height))
            return CompositeVideoClip(
                [subtitle_bg, txt_clip],
                size=(width, height)
            ).set_duration(duration)
        
        return subtitle_bg
    
    except Exception as e:
        print(f"创建字幕失败: {e}")
        return None


def _create_text_image_clip(text: str, width: int, height: int, duration: float):
    """使用 Pillow 创建文字图片片段"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        import numpy as np
        
        img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        font_size = 28
        font = None
        font_paths = [
            "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
            "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
            "/System/Library/Fonts/PingFang.ttc",
            "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        ]
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    font = ImageFont.truetype(font_path, font_size)
                    break
                except Exception:
                    continue
        
        if font is None:
            font = ImageFont.load_default()
        
        try:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except Exception:
            text_width = len(text) * (font_size // 2)
            text_height = font_size
        
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        # 阴影
        draw.text((x + 1, y + 1), text, font=font, fill=(0, 0, 0, 200))
        # 主体
        draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
        
        img_array = np.array(img)
        return ImageClip(img_array, ismask=False).set_duration(duration)
    
    except Exception as e:
        print(f"创建文字图片失败: {e}")
        return None
