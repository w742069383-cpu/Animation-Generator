"""
文本解析服务 - 将输入文字分解成场景列表
"""
import re
from app.utils.helpers import split_text_into_sentences


def parse_text_to_scenes(text: str, duration_per_scene: int = 5) -> list[dict]:
    """
    将输入文字解析为场景列表
    
    Args:
        text: 输入的文字内容
        duration_per_scene: 每个场景的展示时长（秒）
    
    Returns:
        场景字典列表，每个场景包含文字和时长
    """
    sentences = split_text_into_sentences(text)
    
    if not sentences:
        sentences = [text[:200]]  # 如果分割失败，取前200字
    
    scenes = []
    for i, sentence in enumerate(sentences):
        scenes.append({
            "index": i,
            "text": sentence,
            "duration": duration_per_scene,
            "image_path": None,
            "audio_path": None,
        })
    
    return scenes


def extract_keywords(text: str) -> list[str]:
    """
    从文本中提取关键词，用于生成图片描述
    
    Args:
        text: 输入文字
    
    Returns:
        关键词列表
    """
    # 简单实现：移除标点，取前几个词
    clean_text = re.sub(r'[^\w\s]', '', text)
    words = clean_text.split()
    return words[:10]


def generate_image_prompt(scene_text: str, art_style: str) -> str:
    """
    根据场景文字和画风生成图片生成提示词
    
    Args:
        scene_text: 场景文字
        art_style: 画风（realistic/anime/watercolor）
    
    Returns:
        图片生成提示词
    """
    style_prompts = {
        "realistic": "photorealistic, high quality, detailed, cinematic lighting",
        "anime": "anime style, vibrant colors, detailed illustration, Studio Ghibli inspired",
        "watercolor": "watercolor painting style, soft colors, artistic, beautiful brushwork",
    }
    
    style_suffix = style_prompts.get(art_style, style_prompts["realistic"])
    
    # 构建英文提示词（DALL-E 对英文效果更好）
    prompt = f"A beautiful scene depicting: {scene_text}. Style: {style_suffix}"
    
    return prompt
