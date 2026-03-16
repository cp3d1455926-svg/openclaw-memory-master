#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pollinations.AI 图片生成脚本
"""

import requests
import urllib.parse
import os
from datetime import datetime
from pathlib import Path

def generate_image(prompt, width=1024, height=1024, seed=None, model="flux", output_dir=None):
    """
    生成图片
    
    参数:
        prompt: 文字描述
        width: 宽度（默认 1024）
        height: 高度（默认 1024）
        seed: 随机种子（可选）
        model: 模型（默认 flux）
        output_dir: 输出目录（默认 D:\OneDrive\Desktop\AI 生成图片\)
    
    返回:
        图片保存路径
    """
    
    # 默认保存位置
    if output_dir is None:
        output_dir = "D:\\OneDrive\\Desktop\\AI 生成图片\\"
    
    # 创建目录
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # 构建 URL
    base_url = "https://image.pollinations.ai/prompt/"
    encoded_prompt = urllib.parse.quote(prompt)
    
    url = f"{base_url}{encoded_prompt}"
    params = {
        "width": width,
        "height": height,
        "model": model
    }
    
    if seed:
        params["seed"] = seed
    
    # 添加参数到 URL
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    full_url = f"{url}?{query_string}"
    
    print(f"[OK] Generating image...")
    print(f"Prompt: {prompt}")
    print(f"Size: {width}x{height}")
    
    try:
        # 下载图片
        response = requests.get(full_url, timeout=60)
        response.raise_for_status()
        
        # 生成文件名
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        # 简化提示词作为文件名
        short_prompt = prompt[:30].replace(" ", "_").replace("/", "_")
        filename = f"{timestamp}_{short_prompt}.png"
        output_path = os.path.join(output_dir, filename)
        
        # 保存图片
        with open(output_path, "wb") as f:
            f.write(response.content)
        
        print(f"[OK] Image saved to: {output_path}")
        return output_path
        
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Generation failed: {e}")
        return None
    except Exception as e:
        print(f"[ERROR] Save failed: {e}")
        return None


def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Pollinations.AI 图片生成器")
    parser.add_argument("--prompt", required=True, help="图片描述")
    parser.add_argument("--width", type=int, default=1024, help="宽度")
    parser.add_argument("--height", type=int, default=1024, help="高度")
    parser.add_argument("--seed", type=int, help="随机种子")
    parser.add_argument("--model", default="flux", help="模型名称")
    parser.add_argument("--output", help="输出目录")
    
    args = parser.parse_args()
    
    generate_image(
        prompt=args.prompt,
        width=args.width,
        height=args.height,
        seed=args.seed,
        model=args.model,
        output_dir=args.output
    )


if __name__ == "__main__":
    main()
