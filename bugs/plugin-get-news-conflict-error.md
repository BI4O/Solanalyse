# Bug: plugin-get-news Causes SolanaData Agent to Fail with XML Parsing Errors

## 🐛 问题描述

即使在完全重写了 system prompt 之后，SolanaData 智能体仍然持续出现相同的错误：

```
Error      No world found for user during onboarding
Error      Critical error in settings provider: Error: No server ownership found for onboarding
Warn       Could not find XML block in text
Warn       #SolanaData  [MessageService] *** Missing required fields (thought or actions), retrying... ***
{
  response: "Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...",
  parsedXml: null,
  responseContent: null,
}
```

**表现症状：**
- 问题持续存在，不受 system prompt 改变影响
- 智能体总是返回 Rick Astley 歌词
- XML 解析完全失败，进入无限重试循环
- Eliza 智能体工作正常，只有 SolanaData 受影响

## 🔍 根本原因发现

### 关键发现：插件冲突

通过对比 Eliza 和 SolanaData 的配置，发现关键差异：

**Eliza 的 plugins（工作正常）：**
```typescript
plugins: [
  "@elizaos/plugin-sql",
  // 其他条件性插件...
]
```

**SolanaData 的 plugins（出现问题）：**
```typescript
plugins: [
  "@elizaos/plugin-sql",
  "plugin-get-news",  // ← 这个插件导致问题！
  // 其他插件...
]
```

### 🎯 真正的根本原因

**`plugin-get-news` 插件与 SolanaData 智能体存在冲突**，导致：
1. 智能体初始化失败
2. onboarding 过程中断
3. 模型响应机制异常
4. XML 解析系统崩溃

## ✅ 解决方案

### 立即修复：移除冲突插件

从 SolanaData 的 plugins 配置中移除 `"plugin-get-news"`：

```typescript
// 修改前
plugins: [
  "@elizaos/plugin-sql",
  "plugin-get-news",  // ← 移除这个
  // ...
],

// 修改后
plugins: [
  "@elizaos/plugin-sql",
  // 移除了 "plugin-get-news"
  // ...
],
```

## 🛠️ 修复步骤

1. **编辑 `src/characters/SolanaData.ts`**
   - 从 plugins 数组中移除 `"plugin-get-news"`
   - 保持其他插件不变

2. **重新构建项目**
   ```bash
   bun run build
   ```

3. **重启服务测试**
   ```bash
   elizaos dev
   ```

4. **验证修复效果**
   - 测试基本对话："你好"
   - 测试功能问题："你能做什么"
   - 检查是否还有 onboarding 错误

## 📊 问题分析总结

| 方面 | 问题根源 | 解决方案 |
|------|----------|----------|
| **System Prompt** | ❌ 不是根本原因 | ✅ 已优化但无效 |
| **插件配置** | 🎯 真正的根本原因 | ✅ 移除冲突插件 |
| **XML 格式** | ❌ 症状，不是原因 | ✅ 随插件修复而解决 |
| **Onboarding 错误** | ❌ 症状，不是原因 | ✅ 随插件修复而解决 |

## 🔧 插件冲突的技术分析

### 可能的冲突机制

1. **初始化顺序冲突**
   - `plugin-get-news` 可能在智能体完全初始化前就尝试执行
   - 导致后续的 onboarding 过程失败

2. **API 调用冲突**
   - 插件可能在模型调用过程中干扰响应生成
   - 导致返回异常内容（Rick Astley 歌词）

3. **内存/状态冲突**
   - 插件可能占用了智能体所需的关键状态
   - 导致 XML 解析器无法正常工作

4. **依赖冲突**
   - `plugin-get-news` 的依赖可能与核心框架冲突
   - 特别是在消息处理和响应生成环节

## 💡 预防措施

### 1. **插件兼容性测试**
- 在添加新插件前，先在独立环境中测试
- 确保插件与现有智能体配置兼容
- 建立插件冲突检测机制

### 2. **渐进式插件加载**
- 先用最小插件集确保智能体正常工作
- 逐个添加插件，观察是否有冲突
- 建立插件加载顺序的文档

### 3. **插件隔离机制**
- 为不同类型的功能使用独立的插件
- 避免插件之间的功能重叠
- 建立插件依赖关系图

## 🧪 验证步骤

移除插件后，测试以下场景：

1. **基础功能测试**
   - "你好" → 应该正常回复
   - "你叫什么名字" → 应该回复 "SolanaData"

2. **专业功能测试**
   - "什么是Solana" → 应该给出技术解释
   - "查询代币信息" → 应该展示专业能力

3. **错误处理测试**
   - 检查是否还有 onboarding 错误
   - 确认 XML 解析正常工作
   - 验证没有无限重试循环

## 📝 相关问题

- `plugin-get-news` 插件本身可能存在 bug
- 插件与特定智能体角色的兼容性问题
- ElizaOS 框架的插件加载机制可能需要改进

---

**状态**: 🔴 根本原因已找到，正在验证修复
**优先级**: P0 - 阻塞性问题
**根本原因**: plugin-get-news 插件冲突
**最后更新**: 2025-10-25
**下一步**: 测试移除插件后的效果