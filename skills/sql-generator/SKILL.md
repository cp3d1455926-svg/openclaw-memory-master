# 📊 SQL Generator - SQL 生成器

SQL 查询生成、优化建议、常用语句模板。

## 功能列表

- ✅ SELECT 生成
- ✅ INSERT 生成
- ✅ UPDATE 生成
- ✅ DELETE 生成
- ✅ SQL 模板库
- ✅ 优化建议

## 使用示例

```
查看模板：templates 查询
生成 SELECT: select users columns=id,name limit=10
生成 INSERT: insert users name=John age=25
生成 UPDATE: update users name=Jane where=id=1
优化建议：optimize
```

## 模板分类

- 查询 (基础/条件/排序/限制)
- 聚合 (计数/求和/平均/分组)
- 连接 (INNER/LEFT/RIGHT)
- 增删改 (插入/更新/删除)

## 文件结构

```
sql-generator/
├── SKILL.md
└── sql.py
```

## 依赖

无外部依赖，使用 Python 标准库

## 作者

小鬼 👻

## 版本

v1.0
