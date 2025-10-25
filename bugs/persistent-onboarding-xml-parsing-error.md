# Bug: Persistent Onboarding Error - XML Parsing Failures and Rick Roll Responses

## 🐛 问题描述

即使在修复了 system prompt 之后，SolanaData 智能体仍然出现相同的错误：

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
- 问题持续存在，之前的 system prompt 修复无效
- 智能体依然返回 Rick Astley 歌词而不是正常回答
- XML 解析完全失败，`parsedXml: null`
- 仍然处于无限重试循环中

## 🔍 深层次原因分析

### 1. **根本问题不仅仅是 System Prompt**
- 最初的修复思路有误，问题根源更深
- 可能是智能体初始化或配置层面的根本性问题
- World/Onboarding 系统存在结构性问题

### 2. **模型行为异常**
- 相同的 OpenAI 模型在 Eliza 智能体上工作正常
- 但在 SolanaData 智能体上产生完全不同的行为
- 返回固定的歌曲歌词说明模型陷入某种循环状态

### 3. **XML 解析系统性失败**
- `Could not find XML block in text` 提示 XML 格式完全缺失
- `parsedXml: null` 说明解析器没有找到任何有效内容
- 这不是格式问题，而是内容生成本身的问题

### 4. **可能的根本原因**
- **智能体 ID 或配置冲突**: SolanaData 的某些配置与系统不兼容
- **插件加载顺序问题**: `plugin-get-news` 或其他插件导致冲突
- **数据库状态问题**: 智能体在数据库中的状态损坏
- **模型参数配置**: SolanaData 使用的模型参数与 Eliza 不同

## 🔧 需要尝试的解决方案

### 方案1: 重置智能体配置
1. 完全删除 SolanaData 智能体的自定义配置
2. 从最简化的配置开始重建
3. 逐步添加功能，观察问题出现点

### 方案2: 检查插件冲突
1. 暂时移除 `plugin-get-news` 插件
2. 只保留最基本的插件（plugin-sql, custom-openai）
3. 测试是否插件导致的问题

### 方案3: 对比 Eliza 和 SolanaData 配置
1. 详细对比两个智能体的所有配置差异
2. 重点关注 plugins、settings、system 等关键字段
3. 尝试让 SolanaData 使用与 Eliza 相同的基础配置

### 方案4: 检查数据库状态
1. 清理数据库，重新初始化
2. 检查智能体在数据库中的存储状态
3. 确认没有损坏的数据记录

### 方案5: 模型参数调试
1. 检查 SolanaData 使用的模型参数
2. 对比与 Eliza 的模型调用差异
3. 尝试使用相同的模型配置

## 🛠️ 紧急修复步骤

### 第一步: 简化 SolanaData 配置
```typescript
// 暂时将 SolanaData 改为与 Eliza 几乎相同的配置
export const solanaDataCharacter: Character = {
  name: "SolanaData",
  plugins: [
    "@elizaos/plugin-sql",
    // 暂时移除其他所有插件
  ],
  system: `你是SolanaData，一个友好的AI助手。请用简洁的方式回答用户的问题。`,
  // 其他配置暂时保持最简
};
```

### 第二步: 清理数据库
```bash
rm -rf data/.eliza/
```

### 第三步: 重新构建和测试
```bash
bun run build
# 然后重启服务测试
```

## 📊 问题严重性评估

| 严重程度 | 🔴 高 |
|----------|------|
| **影响范围** | SolanaData 智能体完全无法工作 |
| **用户体验** | 智能体卡住，无法进行任何对话 |
| **项目风险** | 核心功能不可用，影响项目交付 |
| **修复紧急度** | 需要立即解决 |

## 💡 长期解决方案

### 1. **建立智能体健康检查机制**
- 在智能体启动时进行基础对话测试
- 监控 XML 解析成功率
- 设置智能体响应时间阈值

### 2. **完善调试工具**
- 增加更详细的日志输出
- 提供智能体状态检查接口
- 建立智能体配置对比工具

### 3. **改进错误处理**
- 当 XML 解析失败时，提供降级响应机制
- 避免无限重试循环
- 提供更友好的错误提示

## 🧪 调试验证步骤

1. **基础对话测试**: "你好"
2. **简单问题测试**: "你叫什么名字"
3. **功能问题测试**: "你能做什么"
4. **专业问题测试**: "什么是Solana"

每个步骤都要观察：
- 是否出现 onboarding 错误
- XML 解析是否成功
- 响应内容是否正常
- 是否出现重试循环

## 📝 相关问题

- 可能与 custom-openai 插件有关
- 可能与智能体 ID 生成有关
- 可能与数据库初始化顺序有关

---

**状态**: 🔴 严重问题，需要立即解决
**优先级**: P0 - 阻塞性问题
**最后更新**: 2025-10-25
**下一步**: 尝试简化配置方案