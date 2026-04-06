# GitHub 经验

**最后更新**: 2026-04-06  
**使用次数**: 50+  
**作者**: Jake × 小鬼 👻

---

## URL 模式

- **首页**: https://github.com
- **仓库页**: https://github.com/{owner}/{repo}
- **PR 页**: https://github.com/{owner}/{repo}/pull/{number}
- **Issue 页**: https://github.com/{owner}/{repo}/issues/{number}
- **Gitee 首页**: https://gitee.com
- **Gitee 仓库**: https://gitee.com/{owner}/{repo}

---

## 平台特征

| 特征 | GitHub | Gitee |
|------|--------|-------|
| **认证方式** | Token (PAT/OAuth) | Token/Password |
| **API 限流** | 60 次/小时（未认证）<br>5000 次/小时（认证） | 5000 次/小时 |
| **登录态保持** | Token 有效期（可自定义） | Token 有效期 |
| **反爬策略** | 中等 | 较严格 |

---

## 操作流程

### 流程 1: 创建 PR

```bash
# 1. Fork 目标仓库
# 在 GitHub 页面点击 Fork 按钮

# 2. 克隆到本地
git clone https://github.com/{your_username}/{repo}.git

# 3. 创建新分支
git checkout -b feature/your-feature-name

# 4. 提交更改
git add .
git commit -m "feat: add your feature description"

# 5. 推送到远程
git push origin feature/your-feature-name

# 6. 在 GitHub 页面创建 PR
# - 点击 "Compare & pull request"
# - 填写 PR 标题和描述
# - 关联 Issue（如有）
# - 选择 Reviewer

# 7. 等待 CI 通过

# 8. 合并 PR
```

**注意事项**:
- PR 标题遵循约定式提交（feat/fix/docs/style/refactor/test/chore）
- 描述要清晰说明变更内容和原因
- 关联相关 Issue（使用 `#issue_number`）

---

### 流程 2: 发布 Skill 到 ClawHub

```bash
# 1. 确保 skill 目录结构正确
skills/your-skill/
├── SKILL.md
├── index.js
├── package.json
└── README.md

# 2. 初始化 git 仓库
cd skills/your-skill
git init

# 3. 添加所有文件
git add .

# 4. 首次提交
git commit -m "feat: initial commit - your-skill"

# 5. 添加 Gitee 远程仓库
git remote add origin https://gitee.com/{your_username}/{skill_name}.git

# 6. 推送到 Gitee
git branch -M main
git push -u origin main

# 7. 在 ClawHub 提交收录申请
# 访问 https://clawhub.ai
# 提交你的 Gitee 仓库链接
```

**注意事项**:
- SKILL.md 必须包含完整的技能描述
- package.json 要有正确的元数据
- README.md 要有使用说明
- 确保没有敏感信息（API Key 等）

---

### 流程 3: 更新已有 Skill

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 进行修改
# ... 编辑文件 ...

# 3. 提交更改
git add .
git commit -m "feat: add new feature"

# 4. 推送更新
git push origin main

# 5. ClawHub 会自动同步（或手动触发）
```

---

## 已知陷阱

### 陷阱 1: Token 权限不足

**现象**: API 返回 403 Forbidden

**原因**: Token 缺少必要的 scope

**解决**:
```
1. 访问 https://github.com/settings/tokens
2. 生成新的 Token
3. 勾选必要的权限：
   - repo (完整控制私有仓库)
   - workflow (管理 GitHub Actions)
   - admin:org (如果需要管理组织)
4. 使用新 Token 替换旧的
```

---

### 陷阱 2: Git 推送冲突

**现象**: 
```
rejected master -> master (fetch first)
error: failed to push some refs to ...
```

**原因**: 远程有本地没有的提交

**解决**:
```bash
# 方法 1: 合并远程更改
git pull --rebase
git push origin main

# 方法 2: 强制推送（慎用！）
git push --force origin main
```

---

### 陷阱 3: CI 检查失败

**现象**: PR 显示 CI 失败，无法合并

**原因**: 
- 代码质量检查未通过
- 测试失败
- 构建错误

**解决**:
```
1. 点击 CI 检查查看详情
2. 查看失败日志
3. 根据错误修复代码
4. 重新推送触发 CI
```

---

### 陷阱 4: 大文件推送失败

**现象**: 
```
remote: Files larger than 100MB are not allowed
```

**原因**: GitHub 限制单文件最大 100MB

**解决**:
```bash
# 方法 1: 使用 Git LFS
git lfs install
git lfs track "*.psd"  # 跟踪大文件类型
git add .gitattributes
git add your-large-file.psd
git commit -m "add large file with LFS"

# 方法 2: 从历史中移除大文件
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/large-file' \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 技术事实

### 事实 1: GitHub API 认证

```http
# 使用 Bearer Token 认证
Authorization: token YOUR_TOKEN

# 或
Authorization: Bearer YOUR_TOKEN
```

**示例**:
```javascript
const response = await fetch('https://api.github.com/user', {
  headers: {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  }
});
```

---

### 事实 2: Git 钩子

**常用钩子**:
- `pre-commit`: 提交前检查（代码质量、格式化）
- `pre-push`: 推送前检查（测试、构建）
- `post-merge`: 合并后操作（安装依赖）

**示例** (`.git/hooks/pre-commit`):
```bash
#!/bin/bash
# 检查代码格式
npm run lint
if [ $? -ne 0 ]; then
  echo "Lint failed!"
  exit 1
fi

# 运行测试
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi
```

---

### 事实 3: GitHub Actions

**配置文件**: `.github/workflows/*.yml`

**示例**:
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
```

**支持的事件**:
- `push`: 推送时触发
- `pull_request`: PR 时触发
- `schedule`: 定时触发（Cron）
- `workflow_dispatch`: 手动触发

---

### 事实 4: Gitee API

**基础 URL**: `https://gitee.com/api/v5`

**认证**:
```http
# 方式 1: URL 参数
GET /user?access_token=YOUR_TOKEN

# 方式 2: Header
Authorization: token YOUR_TOKEN
```

**示例**:
```javascript
const response = await fetch(
  'https://gitee.com/api/v5/user?access_token=' + process.env.GITEE_TOKEN
);
```

---

## 相关记忆

- [[2026-04-06 发布 Memory-Master 到 Gitee]]
- [[OpenClaw skill 目录结构]]
- [[Git 常用命令]]
- [[ClawHub 发布流程]]

---

## 快速参考

### 常用 Git 命令

```bash
# 初始化
git init
git clone <url>

# 分支
git branch
git checkout -b <branch>
git merge <branch>

# 提交
git add .
git commit -m "message"

# 远程
git remote add origin <url>
git push -u origin main
git pull

# 查看
git log
git status
git diff
```

### 常用 GitHub API

```javascript
// 获取用户信息
GET /user

// 获取仓库列表
GET /user/repos

// 创建仓库
POST /user/repos
{ "name": "repo-name" }

// 创建 Issue
POST /repos/{owner}/{repo}/issues
{ "title": "Issue title", "body": "Description" }

// 创建 PR
POST /repos/{owner}/{repo}/pulls
{ "title": "PR title", "head": "branch", "base": "main" }
```

---

*最后更新：2026-04-06 19:50*  
*作者：小鬼 👻 × Jake*
