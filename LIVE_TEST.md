# 🎬 Memory-Master 实际场景测试

**测试时间**: 2026-04-06 15:05  
**测试环境**: Jake 的电脑 (OpenClaw 2026.3.28)

---

## 测试步骤

### 步骤 1: 检查当前记忆状态

```bash
# 查看记忆文件
Get-Content C:\Users\shenz\.openclaw\workspace\memory\2026-04-06.md

# 查看记忆图谱
Get-Content C:\Users\shenz\.openclaw\workspace\memory\memory-graph.json

# 查看系统状态
Get-Content C:\Users\shenz\.openclaw\workspace\memory\memory-state.json
```

---

### 步骤 2: 模拟真实对话

**对话场景**: Jake 和小鬼讨论 Memory-Master 功能

```
Jake: 小鬼，帮我测试一下 Memory-Master 的实际效果
小鬼: 好的！我们来模拟一段真实对话。你想测试什么场景？
Jake: 记住我下周要参加数学竞赛，时间是 4 月 13 日
小鬼: 收到！这个重要信息已经记住了。还有什么要记录的吗？
Jake: 待办事项：完成 Memory-Master 的测试报告
小鬼: 好的，待办已记录。需要设置提醒吗？
Jake: 总之，今天要把所有功能测试完
小鬼: 明白！我会自动捕捉这些重要信息。
```

---

### 步骤 3: 检查记忆是否保存

预期结果：
- ✅ "记住我下周要参加数学竞赛，时间是 4 月 13 日" - 应该被保存（高分）
- ✅ "待办事项：完成 Memory-Master 的测试报告" - 应该被保存（待办关键词）
- ✅ "总之，今天要把所有功能测试完" - 应该被保存（总结性语句）

---

### 步骤 4: 测试记忆加载

使用命令：
```
/load-memory
```

预期输出：
```
🧠 已加载记忆：

## 上次会话（2026-04-06）
- 讨论了 Memory-Master 实际场景测试
- Jake 提到下周要参加数学竞赛（4 月 13 日）
- 待办：完成 Memory-Master 的测试报告

## 记忆图谱
- Jake → 参加 → 数学竞赛
- Jake → 创建 → Memory-Master 项目

需要我继续哪个任务？
```

---

### 步骤 5: 测试记忆图谱

使用命令：
```
/memory-graph
```

预期输出：
```
🕸️ 记忆图谱

## 人物
- Jake (用户)

## 项目
- Memory-Master (技能开发中)

## 事件
- 数学竞赛 (2026-04-13)

## 关系
Jake → 创建 → Memory-Master
Jake → 参加 → 数学竞赛

## 统计
- 节点：5 个
- 边：3 条
```

---

## 测试检查清单

- [ ] 记忆文件正确生成
- [ ] 重要性评分准确
- [ ] 记忆图谱更新
- [ ] 手动命令可用
- [ ] 重启后记忆加载正常

---

*测试人员：Jake × 小鬼 👻*
