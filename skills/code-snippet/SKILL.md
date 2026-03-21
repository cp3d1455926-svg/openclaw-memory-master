# Code Snippet - 代码片段管理

💻 管理和分享你的代码片段，建立个人代码库！

## 功能

- 保存常用代码片段
- 按语言/标签分类
- 快速搜索和检索
- 代码高亮显示
- 支持多种编程语言
- 一键复制代码

## 使用方法

### 保存代码
```
保存代码 [语言] [标签]
[粘贴代码]
```

### 搜索代码
```
搜索代码 [关键词]
我的代码 [语言]
```

### 管理代码
```
删除代码 [ID]
分享代码 [ID]
```

## 支持的语言

- JavaScript / TypeScript
- Python
- Java
- C++ / C
- Go
- Rust
- SQL
- HTML/CSS
- Shell
- 其他...

## 文件结构

```
code-snippet/
├── SKILL.md          # 技能说明
├── skill.json        # 技能配置
├── main.js           # 主程序
└── snippets/         # 代码片段存储
    └── snippets.json # 片段数据库
```

## 示例

### 保存代码
```
保存代码 python 排序
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)
```

### 搜索代码
```
搜索代码 快速排序
```

### 输出示例
```
💻 代码片段 #42

📝 名称：快速排序
🔖 标签：#排序 #算法 #python
📄 语言：Python

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    ...
```

👍 有用次数：12
📅 创建时间：2024-03-20
```

## 开发者

小鬼 👻

## 版本

v1.0.0
