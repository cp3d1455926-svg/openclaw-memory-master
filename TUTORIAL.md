# 👻 Ghost Skills 使用教程

> 📚 **从入门到精通** | 🚀 **快速上手指南** | 💡 **常见问题解答**

本教程由 **小鬼** 👻 编写，帮助你快速上手 Ghost Skills 技能合集！

---

## 📖 目录

1. [快速开始](#快速开始)
2. [安装指南](#安装指南)
3. [使用技巧](#使用技巧)
4. [技能分类详解](#技能分类详解)
5. [常见问题](#常见问题)
6. [进阶使用](#进阶使用)

---

## 🚀 快速开始

### 30 秒上手

如果你已经安装了 OpenClaw，只需 3 步：

```bash
# 1. 克隆仓库
git clone https://github.com/cp3d1455926-svg/OpenClaw-good-skills.git

# 2. 创建 symlink（Windows 管理员 PowerShell）
New-Item -ItemType SymbolicLink -Path "C:\Users\你的用户名\.openclaw\workspace\skills\ghost-skills" -Target "D:\path\to\OpenClaw-good-skills"

# 3. 在 OpenClaw 中测试
「推荐电影」
```

### 第一个技能体验

试试这些常用技能：

```
# 电影推荐
「今天有点累，推荐电影」

# 音乐推荐
「学习的时候听什么」

# 价格监控
「比价 iPhone 15 Pro」

# 小红书文案
「用小红书风格写一篇好物分享」
```

---

## 📦 安装指南

### 前置条件

- ✅ 已安装 [OpenClaw](https://github.com/openclaw/openclaw)
- ✅ Node.js 18+
- ✅ Python 3.8+（部分技能需要）

### 安装方式

#### 方式 1：Symlink（推荐开发者）

**优点**：
- ✅ 代码修改即时生效
- ✅ 方便调试和开发
- ✅ 不占用额外空间

**Windows 安装步骤**：

```powershell
# 1. 克隆仓库
cd D:\Projects
git clone https://github.com/cp3d1455926-svg/OpenClaw-good-skills.git

# 2. 以管理员身份打开 PowerShell
# 3. 创建 symlink
New-Item -ItemType SymbolicLink -Path "C:\Users\你的用户名\.openclaw\workspace\skills\ghost-skills" -Target "D:\Projects\OpenClaw-good-skills"

# 4. 验证
Test-Path "C:\Users\你的用户名\.openclaw\workspace\skills\ghost-skills"
```

**macOS/Linux 安装步骤**：

```bash
# 1. 克隆仓库
cd ~/Projects
git clone https://github.com/cp3d1455926-svg/OpenClaw-good-skills.git

# 2. 创建 symlink
ln -s ~/Projects/OpenClaw-good-skills ~/.openclaw/workspace/skills/ghost-skills

# 3. 验证
ls -la ~/.openclaw/workspace/skills/ghost-skills
```

#### 方式 2：手动复制

**优点**：
- ✅ 简单直接
- ✅ 不需要管理员权限

**缺点**：
- ❌ 代码修改需要重新复制
- ❌ 占用额外空间

```bash
# 复制整个技能包
cp -r OpenClaw-good-skills ~/.openclaw/workspace/skills/

# 或复制单个技能
cp -r OpenClaw-good-skills/movie-recommender ~/.openclaw/workspace/skills/
```

#### 方式 3：ClawHub 安装（待发布）

```bash
# 等发布后使用
clawhub install ghost-skills
```

---

## 💡 使用技巧

### 1. 技能触发方式

#### 直接触发
```
「推荐电影」
「查一下晴天的歌词」
「比价 iPhone」
```

#### 场景触发
```
「今天心情不好，有什么推荐」
「学习的时候适合听什么」
「我要买 iPhone，帮我看看价格」
```

#### 组合触发
```
「用小红书风格写一篇 iPhone 测评」
「根据我的观影记录推荐电影」
```

### 2. 高效使用技巧

#### 📌 收藏常用技能

在 OpenClaw 中设置快捷指令：

```
# 设置快捷指令
「设置快捷指令：电影 → 推荐电影」
「设置快捷指令：音乐 → 学习的时候听什么」
```

#### 🔄 批量查询

```
# 一次性比价多个商品
「比价 iPhone 15 Pro 和 MacBook Pro」

# 多平台对比
「京东和拼多多哪个买 iPhone 便宜」
```

#### 📊 获取详细信息

```
# 获取电影详情
「查一下星际穿越的详细信息」

# 获取歌词
「显示晴天的完整歌词」

# 查看历史价格
「显示 iPhone 的 90 天价格走势图」
```

### 3. 参数定制

#### 设置目标价格
```
「监控 https://item.jd.com/100012345.html 目标价 7000 元」
```

#### 指定风格
```
「用 professional 风格写文案」
「用 story 风格写分享」
「用知乎风格写评测」
```

#### 指定类型
```
「推荐科幻电影」
「推荐摇滚音乐」
「推荐治愈系电影」
```

---

## 🎯 技能分类详解

### 🎨 内容创作类

#### 公众号助手
```
「写一篇关于 AI 的公众号文章」
「生成 5 个爆款标题」
「给文章配图」
```

**最佳实践**：
1. 先确定主题和风格
2. 生成多个标题备选
3. 使用 AI 降味功能
4. 手动润色关键段落

#### 小红书助手
```
「用小红书风格写一篇好物分享」
「生成 10 个吸引人的标题」
「推荐话题标签」
```

**最佳实践**：
1. 选择合适风格（casual/professional/story）
2. 添加 emoji 增加生动性
3. 使用热门话题标签
4. 配上精美图片

### 🎮 娱乐生活类

#### 电影推荐
```
「今天有点累，推荐电影」
「推荐科幻电影」
「查一下星际穿越的评分」
```

**使用场景**：
- 😊 心情不好时找治愈电影
- 🎭 特定类型爱好者
- ⭐ 查询豆瓣评分
- 📝 记录观影历史

#### 音乐助手
```
「学习的时候听什么」
「推荐摇滚音乐」
「查一下晴天的歌词」
```

**使用场景**：
- 📚 学习/工作时找背景音乐
- 😊 根据心情选歌
- 📝 查询歌词
- 🔥 发现热门新歌

### 🛒 电商工具类

#### 价格监控
```
「监控 https://item.jd.com/100012345.html」
「查历史价格」
「比价 iPhone 15 Pro」
```

**省钱技巧**：
1. 提前 1-2 周添加到监控
2. 设置合理的目标价格（建议当前价 90%）
3. 关注大促节点（618/双 11）
4. 多平台比价后再入手

**最佳时机**：
- 📅 618 大促（6 月）
- 📅 双 11（11 月）
- 📅 年货节（1 月）
- 📅 新品发布后（旧款降价）

---

## ❓ 常见问题

### Q1: 技能不工作怎么办？

**检查清单**：
- [ ] OpenClaw 是否正常运行
- [ ] 技能是否正确安装到 `workspace/skills/`
- [ ] Python 依赖是否安装（`pip install requests beautifulsoup4`）
- [ ] 网络连接是否正常

**解决步骤**：
```bash
# 1. 检查技能目录
ls ~/.openclaw/workspace/skills/

# 2. 安装依赖
pip install requests beautifulsoup4

# 3. 重启 OpenClaw
openclaw restart

# 4. 查看日志
openclaw logs
```

### Q2: API 请求失败怎么办？

**原因**：
- 网络连接问题
- API 服务暂时不可用
- 触发反爬机制

**解决方案**：
1. 等待几分钟后重试
2. 检查网络连接
3. 技能会自动切换到备用数据

### Q3: 价格数据不准确？

**说明**：
- 价格数据有 30 分钟缓存
- 电商平台可能临时调价
- 优惠券/活动价可能未计入

**建议**：
- 以实际下单价格为准
- 多平台对比
- 关注大促节点

### Q4: 如何更新技能？

```bash
# 进入技能目录
cd OpenClaw-good-skills

# 拉取最新代码
git pull origin master

# 重启 OpenClaw
openclaw restart
```

### Q5: 可以离线使用吗？

**部分支持**：
- ✅ 本地功能（文档处理、文件管理）可离线
- ❌ API 功能（电影/音乐/价格）需要网络
- ✅ 备用数据可在 API 失败时使用

---

## 🚀 进阶使用

### 自定义技能配置

#### 修改缓存时间

编辑对应技能的 API 文件：

```python
# 例如 price_crawler.py
CACHE_EXPIRY = 1800  # 30 分钟
# 改为 1 小时
CACHE_EXPIRY = 3600
```

#### 添加备用数据

```python
# 在对应的 API 文件中添加
FALLBACK_PRODUCTS = {
    "jd:新产品 ID": {
        "name": "产品名称",
        "price": 9999,
        # ...
    }
}
```

### 组合技能使用

#### 工作流示例 1：内容创作

```
1. 「用小红书风格写一篇 iPhone 测评」
2. 「生成 5 个吸引人的标题」
3. 「推荐话题标签」
4. 手动配图发布
```

#### 工作流示例 2：购物决策

```
1. 「比价 iPhone 15 Pro」
2. 「查历史价格」
3. 「监控 https://item.jd.com/xxx 目标价 7000 元」
4. 等待降价提醒
5. 入手！
```

#### 工作流示例 3：娱乐时光

```
1. 「今天心情不好，推荐治愈电影」
2. 「推荐适合一个人看的电影」
3. 观看后：「我看了 XXX，评分 5 分」
4. 「根据观影记录推荐类似电影」
```

---

## 📞 获取帮助

### 遇到问题？

1. **查看文档**：每个技能的 README.md
2. **查看日志**：`openclaw logs`
3. **提交 Issue**：https://github.com/cp3d1455926-svg/OpenClaw-good-skills/issues
4. **联系作者**：通过 GitHub Issues

### 贡献代码

```bash
# 1. Fork 仓库
# 2. 创建分支
git checkout -b feature/your-skill

# 3. 提交更改
git add .
git commit -m "feat: add your-skill"

# 4. 推送
git push origin feature/your-skill

# 5. 创建 Pull Request
```

---

## 📝 更新日志

### v1.3.0 (2026-03-18)
- ✨ 添加详细使用教程
- ✨ 完善技能示例输出
- ✨ 添加常见问题解答
- ✨ 添加进阶使用指南

---

<div align="center">

**Made with 👻 by 小鬼**

[⬆ 返回顶部](#-ghost-skills-使用教程)

</div>
