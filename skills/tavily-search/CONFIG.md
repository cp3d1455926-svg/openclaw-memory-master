# Tavily Search - 配置说明

## 📋 前置条件

需要 Tavily API 密钥才能使用此技能。

## 🔑 获取 API 密钥

1. 访问：https://tavily.com/
2. 注册账号
3. 进入 Dashboard → API Keys
4. 复制 API Key

## ⚙️ 配置方法

### 方法 1：修改 config.json

编辑 `skills/tavily-search/skill.json`:

```json
{
  "config": {
    "apiKey": "你的 API 密钥"
  }
}
```

### 方法 2：设置环境变量

**Windows PowerShell:**
```powershell
$env:TAVILY_API_KEY="你的 API 密钥"
```

**永久设置（推荐）:**
```powershell
[System.Environment]::SetEnvironmentVariable('TAVILY_API_KEY', '你的 API 密钥', 'User')
```

**Linux/Mac:**
```bash
export TAVILY_API_KEY="你的 API 密钥"
```

或在 `~/.bashrc` 或 `~/.zshrc` 中添加：
```bash
export TAVILY_API_KEY="你的 API 密钥"
```

### 方法 3：OpenClaw 配置

```bash
openclaw configure --section web
```

## ✅ 测试

配置完成后，测试：

```bash
cd skills/tavily-search
python tavily_search.py 人工智能
```

## 💡 使用示例

```
Tavily 搜索 2026 年科技趋势
搜索 机器学习教程
深度搜索 人工智能 2026
新闻搜索 AI 大模型
```

## 📊 API 限制

- **免费版**: 每月 1000 次搜索
- **付费版**: 根据套餐不同

## 🔒 安全提示

- ⚠️ 不要将 API 密钥提交到 Git
- ⚠️ 不要公开分享 API 密钥
- ⚠️ 定期检查使用量

---

**开发者**: 小鬼 👻  
**版本**: v1.0.0
