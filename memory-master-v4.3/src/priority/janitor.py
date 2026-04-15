"""
MemoryJanitor - 记忆自动归档脚本
"""

from typing import List, Tuple
from datetime import datetime
from pathlib import Path


class MemoryJanitor:
    """记忆管理员 - 自动归档过期记忆"""
    
    def __init__(self, workspace: str):
        self.workspace = Path(workspace).expanduser()
        self.memory_dir = self.workspace / "memory"
        self.archive_dir = self.memory_dir / "archive"
        self.priority_manager = None  # 延迟导入
        
    def run(self, dry_run: bool = False, verbose: bool = False) -> Tuple[int, int, int]:
        """
        运行归档任务
        
        Args:
            dry_run: 只预览，不执行
            verbose: 详细输出
            
        Returns:
            (已归档数量，已删除数量，错误数量)
        """
        import re
        
        # 确保归档目录存在
        if not dry_run:
            self.archive_dir.mkdir(parents=True, exist_ok=True)
        
        # 延迟导入 PriorityManager
        if self.priority_manager is None:
            from .manager import PriorityManager
            self.priority_manager = PriorityManager()
        
        archived_count = 0
        deleted_count = 0
        error_count = 0
        
        # 查找 MEMORY.md
        memory_file = self.memory_dir / "MEMORY.md"
        if not memory_file.exists():
            if verbose:
                print(f"⚠️ MEMORY.md 不存在：{memory_file}")
            return 0, 0, 0
        
        # 读取 MEMORY.md
        with open(memory_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # 分析每一行
        new_lines = []
        pattern = r'-\s*\[(P[0-2])\]\s*\[(\d{4}-\d{2}-\d{2})\]'
        
        for line in lines:
            match = re.match(pattern, line)
            if match:
                priority = match.group(1)
                date_str = match.group(2)
                
                # 检查是否过期
                if self.priority_manager.is_expired(priority, date_str):
                    # 检查是否应该自动归档
                    if self.priority_manager.should_auto_archive(priority):
                        if not dry_run:
                            # 移动到归档文件
                            archive_file = self.archive_dir / f"{datetime.now().strftime('%Y-%m')}-archived.md"
                            with open(archive_file, 'a', encoding='utf-8') as f:
                                f.write(line)
                        archived_count += 1
                        if verbose:
                            print(f"📦 归档：{line.strip()[:50]}...")
                        continue  # 不添加到新文件
                    else:
                        # P0 不过期，保留
                        new_lines.append(line)
                else:
                    # 未过期，保留
                    new_lines.append(line)
            else:
                # 非记忆行（标题、空行等），保留
                new_lines.append(line)
        
        # 写回 MEMORY.md
        if not dry_run and archived_count > 0:
            with open(memory_file, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            if verbose:
                print(f"✅ 已更新 MEMORY.md")
        
        # 清理老旧归档（超过 365 天）
        deleted_count = self.clean_archive(days=365)
        
        return archived_count, deleted_count, error_count
        
    def find_expired(self) -> List[str]:
        """查找过期记忆"""
        import re
        
        if self.priority_manager is None:
            from .manager import PriorityManager
            self.priority_manager = PriorityManager()
        
        expired = []
        memory_file = self.memory_dir / "MEMORY.md"
        
        if not memory_file.exists():
            return expired
        
        with open(memory_file, 'r', encoding='utf-8') as f:
            for line in f:
                pattern = r'-\s*\[(P[0-2])\]\s*\[(\d{4}-\d{2}-\d{2})\]'
                match = re.match(pattern, line)
                if match:
                    priority = match.group(1)
                    date_str = match.group(2)
                    if self.priority_manager.is_expired(priority, date_str):
                        expired.append(line.strip())
        
        return expired
        
    def archive_memory(self, memory_id: str, dry_run: bool = False) -> bool:
        """归档单个记忆"""
        # 这个方法是留给未来扩展的
        # 目前实现的是批量归档
        return False
        
    def clean_archive(self, days: int = 365) -> int:
        """清理老旧归档"""
        deleted_count = 0
        cutoff_date = datetime.now() - timedelta(days=days)
        
        if not self.archive_dir.exists():
            return 0
        
        for archive_file in self.archive_dir.glob("*.md"):
            # 从文件名解析日期
            try:
                file_date_str = archive_file.stem[:10]  # YYYY-MM-DD
                file_date = datetime.strptime(file_date_str, '%Y-%m-%d')
                
                if file_date < cutoff_date:
                    archive_file.unlink()
                    deleted_count += 1
            except (ValueError, IndexError):
                # 无法解析日期，保留文件
                pass
        
        return deleted_count
        
    def generate_report(self) -> str:
        """生成归档报告"""
        expired = self.find_expired()
        
        report = []
        report.append("=" * 50)
        report.append("Memory Janitor 归档报告")
        report.append("=" * 50)
        report.append(f"生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"工作目录：{self.workspace}")
        report.append("")
        report.append(f"过期记忆数量：{len(expired)}")
        report.append("")
        
        if expired:
            report.append("过期记忆列表:")
            for item in expired[:10]:  # 只显示前 10 条
                report.append(f"  - {item[:80]}...")
            if len(expired) > 10:
                report.append(f"  ... 还有 {len(expired) - 10} 条")
        else:
            report.append("✅ 没有过期记忆")
        
        report.append("")
        report.append("=" * 50)
        
        return "\n".join(report)


def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Memory Janitor - 自动归档过期记忆")
    parser.add_argument("--workspace", default="~/.openclaw/workspace", help="工作目录")
    parser.add_argument("--dry-run", action="store_true", help="只预览，不执行")
    parser.add_argument("--verbose", action="store_true", help="详细输出")
    
    args = parser.parse_args()
    
    janitor = MemoryJanitor(args.workspace)
    archived, deleted, errors = janitor.run(dry_run=args.dry_run)
    
    print(f"✅ 已归档：{archived} 条")
    print(f"🗑️  已删除：{deleted} 条")
    print(f"❌ 错误：{errors} 条")


if __name__ == "__main__":
    main()
