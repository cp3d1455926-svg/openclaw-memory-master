#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SQL Generator - SQL 生成器
SQL 查询生成、优化建议、常用语句模板
"""

from typing import List, Dict

# SQL 模板库
SQL_TEMPLATES = {
    '查询': [
        {'name': '基础查询', 'sql': 'SELECT * FROM table_name;', 'desc': '查询所有数据'},
        {'name': '条件查询', 'sql': 'SELECT * FROM table_name WHERE condition;', 'desc': '带条件查询'},
        {'name': '排序查询', 'sql': 'SELECT * FROM table_name ORDER BY column DESC;', 'desc': '排序查询'},
        {'name': '限制结果', 'sql': 'SELECT * FROM table_name LIMIT 10;', 'desc': '限制返回数量'},
        {'name': '去重查询', 'sql': 'SELECT DISTINCT column FROM table_name;', 'desc': '去重查询'},
    ],
    '聚合': [
        {'name': '计数', 'sql': 'SELECT COUNT(*) FROM table_name;', 'desc': '统计行数'},
        {'name': '求和', 'sql': 'SELECT SUM(column) FROM table_name;', 'desc': '求和'},
        {'name': '平均值', 'sql': 'SELECT AVG(column) FROM table_name;', 'desc': '平均值'},
        {'name': '最大值', 'sql': 'SELECT MAX(column) FROM table_name;', 'desc': '最大值'},
        {'name': '分组', 'sql': 'SELECT column, COUNT(*) FROM table_name GROUP BY column;', 'desc': '分组统计'},
    ],
    '连接': [
        {'name': 'INNER JOIN', 'sql': 'SELECT * FROM t1 INNER JOIN t2 ON t1.id = t2.t1_id;', 'desc': '内连接'},
        {'name': 'LEFT JOIN', 'sql': 'SELECT * FROM t1 LEFT JOIN t2 ON t1.id = t2.t1_id;', 'desc': '左连接'},
        {'name': 'RIGHT JOIN', 'sql': 'SELECT * FROM t1 RIGHT JOIN t2 ON t1.id = t2.t1_id;', 'desc': '右连接'},
    ],
    '增删改': [
        {'name': '插入', 'sql': 'INSERT INTO table_name (col1, col2) VALUES (val1, val2);', 'desc': '插入数据'},
        {'name': '更新', 'sql': 'UPDATE table_name SET col1 = val1 WHERE condition;', 'desc': '更新数据'},
        {'name': '删除', 'sql': 'DELETE FROM table_name WHERE condition;', 'desc': '删除数据'},
    ],
}

# SQL 优化建议
OPTIMIZATION_TIPS = [
    '使用索引加速查询',
    '避免 SELECT *，只查询需要的列',
    '使用 LIMIT 限制结果数量',
    '避免在 WHERE 子句中使用函数',
    '使用 EXISTS 代替 IN 用于子查询',
    '优化 JOIN 条件，确保使用索引',
    '避免 N+1 查询问题',
    '使用 EXPLAIN 分析查询计划',
]


def get_templates(category: str = None) -> Dict:
    """获取 SQL 模板"""
    if category:
        return {category: SQL_TEMPLATES.get(category, [])}
    return SQL_TEMPLATES


def generate_select(table: str, columns: List[str] = None, 
                    where: str = None, order: str = None, 
                    limit: int = None) -> str:
    """生成 SELECT 语句"""
    cols = ', '.join(columns) if columns else '*'
    sql = f"SELECT {cols} FROM {table}"
    
    if where:
        sql += f" WHERE {where}"
    if order:
        sql += f" ORDER BY {order}"
    if limit:
        sql += f" LIMIT {limit}"
    
    return sql + ";"


def generate_insert(table: str, data: Dict) -> str:
    """生成 INSERT 语句"""
    columns = ', '.join(data.keys())
    values = ', '.join(f"'{v}'" if isinstance(v, str) else str(v) for v in data.values())
    
    return f"INSERT INTO {table} ({columns}) VALUES ({values});"


def generate_update(table: str, data: Dict, where: str) -> str:
    """生成 UPDATE 语句"""
    sets = ', '.join(f"{k} = '{v}'" if isinstance(v, str) else f"{k} = {v}" for k, v in data.items())
    
    return f"UPDATE {table} SET {sets} WHERE {where};"


def generate_delete(table: str, where: str) -> str:
    """生成 DELETE 语句"""
    return f"DELETE FROM {table} WHERE {where};"


def get_tips() -> List[str]:
    """获取优化建议"""
    return OPTIMIZATION_TIPS


def run(command: str = '', args: List[str] = None) -> str:
    """主入口"""
    args = args or []
    
    if command == 'templates' or command == '模板':
        category = args[0] if args else None
        
        if category:
            templates = get_templates(category)
            if not templates:
                return f"❌ 未知分类 '{category}'"
        else:
            templates = get_templates()
        
        lines = ["📊 SQL 模板库:\n"]
        
        for cat, temps in templates.items():
            lines.append(f"📁 {cat}:")
            for t in temps:
                lines.append(f"├─ {t['name']}: {t['desc']}")
                lines.append(f"│  {t['sql']}")
            lines.append("")
        
        return '\n'.join(lines)
    
    elif command == 'select' or command == '查询':
        # 简单解析参数
        table = args[0] if args else 'table_name'
        columns = None
        where = None
        order = None
        limit = None
        
        for arg in args[1:]:
            if arg.startswith('columns='):
                columns = arg.split('=')[1].split(',')
            elif arg.startswith('where='):
                where = arg.split('=')[1]
            elif arg.startswith('order='):
                order = arg.split('=')[1]
            elif arg.startswith('limit='):
                limit = int(arg.split('=')[1])
        
        sql = generate_select(table, columns, where, order, limit)
        
        return f"📊 生成的 SQL:\n\n{sql}"
    
    elif command == 'insert' or command == '插入':
        if len(args) < 2:
            return "❌ 用法：insert [表名] [列=值，列=值...]"
        
        table = args[0]
        data = {}
        
        for arg in args[1:]:
            if '=' in arg:
                key, value = arg.split('=', 1)
                data[key] = value
        
        sql = generate_insert(table, data)
        
        return f"📊 生成的 SQL:\n\n{sql}"
    
    elif command == 'update' or command == '更新':
        if len(args) < 3:
            return "❌ 用法：update [表名] [列=值] [where 条件]"
        
        table = args[0]
        where = args[-1]
        data = {}
        
        for arg in args[1:-1]:
            if '=' in arg:
                key, value = arg.split('=', 1)
                data[key] = value
        
        sql = generate_update(table, data, where)
        
        return f"📊 生成的 SQL:\n\n{sql}"
    
    elif command == 'delete' or command == '删除':
        if len(args) < 2:
            return "❌ 用法：delete [表名] [where 条件]"
        
        table = args[0]
        where = args[1] if len(args) > 1 else '1=1'
        
        sql = generate_delete(table, where)
        
        return f"📊 生成的 SQL:\n\n{sql}"
    
    elif command == 'optimize' or command == '优化':
        tips = get_tips()
        
        lines = ["💡 SQL 优化建议:"]
        for tip in tips:
            lines.append(f"├─ {tip}")
        
        return '\n'.join(lines)
    
    elif command == 'help' or command == '帮助':
        return """
📊 SQL Generator - SQL 生成器

可用命令:
  templates/模板 [分类]        - 查看模板
  select/查询 [表] [参数...]     - 生成 SELECT
  insert/插入 [表] [列=值...]    - 生成 INSERT
  update/更新 [表] [列=值] [where] - 生成 UPDATE
  delete/删除 [表] [where]       - 生成 DELETE
  optimize/优化               - 优化建议
  help/帮助                   - 显示帮助

示例:
  查看模板：templates 查询
  生成 SELECT: select users columns=id,name where=age>18 limit=10
  生成 INSERT: insert users name=John age=25
  生成 UPDATE: update users name=Jane where=id=1
  生成 DELETE: delete users where=id=1
  
模板分类:
- 查询 (基础/条件/排序/限制/去重)
- 聚合 (计数/求和/平均/最大/分组)
- 连接 (INNER/LEFT/RIGHT JOIN)
- 增删改 (插入/更新/删除)
        """.strip()
    
    else:
        return "❌ 未知命令，输入 help 查看帮助"


if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print(run('help'))
    else:
        command = sys.argv[1]
        args = sys.argv[2:]
        print(run(command, args))
