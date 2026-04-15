#!/usr/bin/env python3
"""
Memory Janitor - 自动归档过期记忆

使用方法：
    python scripts/archive_expired.py --workspace ~/.openclaw/workspace --dry-run
"""

import sys
import os

# 添加 src 到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from priority.janitor import MemoryJanitor


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Memory Janitor - 自动归档过期记忆")
    parser.add_argument(
        "--workspace",
        default="~/.openclaw/workspace",
        help="工作目录"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="只预览，不执行"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="详细输出"
    )
    
    args = parser.parse_args()
    
    janitor = MemoryJanitor(args.workspace)
    archived, deleted, errors = janitor.run(dry_run=args.dry_run)
    
    print(f"\n{'='*50}")
    print(f"📊 Memory Janitor 归档报告")
    print(f"{'='*50}")
    print(f"✅ 已归档：{archived} 条")
    print(f"🗑️  已删除：{deleted} 条")
    print(f"❌ 错误：{errors} 条")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    main()
