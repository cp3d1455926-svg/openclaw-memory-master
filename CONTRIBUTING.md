# 贡献指南

欢迎为 Ghost Skills 贡献代码！👻

## 🚀 快速开始

### 1. Fork 仓库

点击 GitHub 右上角的 "Fork" 按钮

### 2. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/ghost-skills.git
cd ghost-skills
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

## 📝 提交规范

### Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具/配置

### 示例

```bash
# 新功能
git commit -m "feat(news): 添加新闻来源过滤功能"

# Bug 修复
git commit -m "fix(weather): 修复街道级天气查询超时问题"

# 文档更新
git commit -m "docs(readme): 更新安装说明"
```

## 🛡️ 技能开发规范

### 必需文件

每个技能必须包含：

- `SKILL.md` - 技能描述和触发规则
- 至少一个执行文件（`.js` / `.py` / `.sh`）

### 推荐结构

```
your-skill/
├── SKILL.md              # 必需
├── index.js              # 或 script.py
├── _meta.json            # 元数据
├── scripts/              # 辅助脚本
├── references/           # 参考资料
└── README.md             # 使用说明
```

### SKILL.md 模板

```markdown
# 技能名称

## 触发规则

- 关键词：xxx, yyy, zzz
- 场景：当用户...

## 功能描述

...

## 权限需求

- [ ] 文件读写
- [ ] 网络访问
- [ ] 外部 API
```

## ✅ 提交前检查

- [ ] 代码已测试
- [ ] 无敏感信息（API 密钥、密码等）
- [ ] 更新了 README（如需要）
- [ ] Commit message 符合规范

## 🔒 安全要求

**禁止提交：**

- ❌ 硬编码的 API 密钥或凭证
- ❌ 恶意代码或后门
- ❌ 未授权的数据收集
- ❌ 破坏性命令（无确认的 rm -rf 等）

**必须审查：**

- ✅ 所有网络请求
- ✅ 所有文件操作
- ✅ 所有外部命令执行

## 📤 提交 PR

1. Push 到你的分支：
   ```bash
   git push origin feature/your-feature-name
   ```

2. 在 GitHub 创建 Pull Request

3. 填写 PR 描述：
   - 这个 PR 做了什么？
   - 为什么需要这个改动？
   - 如何测试？

## 🎯 技能创意

不知道贡献什么？看看这些想法：

- [ ] 更多生活服务工具（机票查询、酒店比价）
- [ ] 社交媒体管理（微博、抖音）
- [ ] 学习工具（单词记忆、题库）
- [ ] 效率工具（番茄钟、待办事项）
- [ ] 娱乐技能（笑话、谜语、星座）

## ❓ 需要帮助？

- 开 Issue 描述你的想法
- 在 Discussion 中提问
- 联系维护者

---

感谢你的贡献！👻
