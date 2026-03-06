"""
应用配置模块 - 从环境变量读取配置
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    # OpenAI API 密钥（可选，无密钥时降级运行）
    openai_api_key: str = ""

    # 输出和临时目录
    output_dir: str = "./outputs"
    temp_dir: str = "./temp"

    # 服务器配置
    backend_port: int = 8000
    frontend_port: int = 3000

    # 跨域配置
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# 确保目录存在
os.makedirs(settings.output_dir, exist_ok=True)
os.makedirs(settings.temp_dir, exist_ok=True)
