"""
图片生成服务 - 使用 OpenAI DALL-E API 或降级方案
"""
import os
import asyncio
import httpx
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from app.config import settings
from app.services.text_parser import generate_image_prompt


# 画风对应的渐变色方案（降级方案使用）
STYLE_COLORS = {
    "realistic": [(44, 62, 80), (52, 73, 94)],
    "anime": [(155, 89, 182), (52, 152, 219)],
    "watercolor": [(46, 204, 113), (22, 160, 133)],
}


async def generate_image(
    scene_text: str,
    art_style: str,
    output_path: str,
    width: int = 1280,
    height: int = 720,
) -> str:
    """
    生成场景图片
    
    Args:
        scene_text: 场景文字
        art_style: 画风
        output_path: 输出路径
        width: 图片宽度
        height: 图片高度
    
    Returns:
        生成的图片路径
    """
    # 如果有 OpenAI API Key，使用 DALL-E 生成
    if settings.openai_api_key:
        try:
            return await _generate_with_dalle(scene_text, art_style, output_path, width, height)
        except Exception as e:
            print(f"DALL-E 生成失败，使用降级方案: {e}")
    
    # 降级方案：生成渐变背景 + 文字图片
    return _generate_fallback_image(scene_text, art_style, output_path, width, height)


async def _generate_with_dalle(
    scene_text: str,
    art_style: str,
    output_path: str,
    width: int,
    height: int,
) -> str:
    """使用 DALL-E 3 API 生成图片"""
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    prompt = generate_image_prompt(scene_text, art_style)
    
    # DALL-E 3 支持 1024x1024, 1792x1024, 1024x1792
    response = await client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1792x1024",
        quality="standard",
        n=1,
    )
    
    image_url = response.data[0].url
    
    # 下载图片
    async with httpx.AsyncClient() as http_client:
        img_response = await http_client.get(image_url, timeout=60.0)
        img_response.raise_for_status()
    
    # 保存并调整尺寸
    with open(output_path, "wb") as f:
        f.write(img_response.content)
    
    # 调整到目标尺寸
    img = Image.open(output_path)
    img = img.resize((width, height), Image.LANCZOS)
    img.save(output_path, "PNG")
    
    return output_path


def _generate_fallback_image(
    scene_text: str,
    art_style: str,
    output_path: str,
    width: int,
    height: int,
) -> str:
    """
    降级方案：生成渐变色背景 + 文字的图片
    """
    colors = STYLE_COLORS.get(art_style, STYLE_COLORS["realistic"])
    color1 = np.array(colors[0], dtype=np.float32)
    color2 = np.array(colors[1], dtype=np.float32)
    
    # 生成渐变背景
    img_array = np.zeros((height, width, 3), dtype=np.uint8)
    for y in range(height):
        ratio = y / height
        pixel_color = (color1 * (1 - ratio) + color2 * ratio).astype(np.uint8)
        img_array[y, :] = pixel_color
    
    img = Image.fromarray(img_array, "RGB")
    draw = ImageDraw.Draw(img)
    
    # 绘制半透明覆盖层
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 80))
    img = img.convert("RGBA")
    img = Image.alpha_composite(img, overlay)
    img = img.convert("RGB")
    draw = ImageDraw.Draw(img)
    
    # 添加装饰圆圈
    for cx, cy, r, alpha in [
        (width // 4, height // 3, 120, 30),
        (3 * width // 4, 2 * height // 3, 180, 20),
        (width // 2, height // 2, 80, 40),
    ]:
        circle_overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        circle_draw = ImageDraw.Draw(circle_overlay)
        circle_draw.ellipse(
            [cx - r, cy - r, cx + r, cy + r],
            fill=(255, 255, 255, alpha)
        )
        img = img.convert("RGBA")
        img = Image.alpha_composite(img, circle_overlay)
        img = img.convert("RGB")
        draw = ImageDraw.Draw(img)
    
    # 绘制文字
    _draw_wrapped_text(draw, scene_text, width, height)
    
    img.save(output_path, "PNG")
    return output_path


def _draw_wrapped_text(draw: ImageDraw.Draw, text: str, width: int, height: int):
    """在图片上绘制自动换行的文字"""
    # 尝试加载字体，失败时使用默认字体
    font = None
    font_size = 36
    font_paths = [
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",  # Linux CJK 字体
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/System/Library/Fonts/PingFang.ttc",  # macOS
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
    
    # 文字自动换行
    max_chars_per_line = width // (font_size // 2) - 2
    lines = []
    if len(text) > max_chars_per_line:
        words = list(text)
        current_line = ""
        for char in words:
            if len(current_line) >= max_chars_per_line:
                lines.append(current_line)
                current_line = char
            else:
                current_line += char
        if current_line:
            lines.append(current_line)
    else:
        lines = [text]
    
    # 计算文字总高度
    line_height = font_size + 8
    total_text_height = len(lines) * line_height
    start_y = (height - total_text_height) // 2
    
    # 绘制文字阴影和主体
    for i, line in enumerate(lines):
        y = start_y + i * line_height
        try:
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]
        except Exception:
            text_width = len(line) * (font_size // 2)
        
        x = (width - text_width) // 2
        
        # 阴影
        draw.text((x + 2, y + 2), line, font=font, fill=(0, 0, 0, 180))
        # 主体文字
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))
