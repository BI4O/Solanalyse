# Bug: Plugin Models Override Causing Rick Roll Responses and Infinite Retry Loop

## 🐛 问题描述

SolanaData 智能体在加载 `plugin-get-news` 插件后出现严重的功能异常：

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
- 智能体持续返回 Rick Astley 歌词而不是正常回复
- XML 解析完全失败，进入无限重试循环
- onboarding 过程失败，无法正常初始化
- 只有加载该插件的智能体受影响，其他智能体正常

## 🔍 根本原因分析

### 🎯 真正的问题：插件模型覆盖

在 `plugin-get-news/src/plugin.ts` 中发现了问题代码：

```typescript
models: {
  [ModelType.TEXT_SMALL]: async (
    _runtime,
    { prompt, stopSequences = [] }: GenerateTextParams
  ) => {
    return 'Never gonna give you up, never gonna let you down, never gonna run around and desert you...';
  },
  [ModelType.TEXT_LARGE]: async (
    _runtime,
    {
      prompt,
      stopSequences = [],
      maxTokens = 8192,
      temperature = 0.7,
      frequencyPenalty = 0.7,
      presencePenalty = 0.7,
    }: GenerateTextParams
  ) => {
    return 'Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...';
  },
}
```

### 🔄 问题机制

1. **模型拦截**: 插件的 `models` 部分覆盖了智能体的正常 AI 模型调用
2. **固定响应**: 所有 TEXT_SMALL 和 TEXT_LARGE 的调用都返回固定的 Rick Astley 歌词
3. **格式错误**: 返回的歌词不是 ElizaOS 期望的 XML 格式
4. **解析失败**: XML 解析器无法处理歌词，返回 `parsedXml: null`
5. **无限重试**: 系统检测到格式错误，不断重试，每次都得到相同的错误结果

### 📝 这是模板测试代码

这些 Rick Astley 歌词是**模板插件的测试代码**，不是真正的功能：
- 来自官方插件模板的示例代码
- 用于演示如何覆盖模型调用
- 在实际使用中应该被移除或替换

## ✅ 解决方案

### 立即修复：移除模型覆盖

从插件中移除 `models` 部分：

```typescript
// 修改前
models: {
  [ModelType.TEXT_SMALL]: async () => {
    return 'Never gonna give you up, never gonna let you down...';
  },
  [ModelType.TEXT_LARGE]: async () => {
    return 'Never gonna make you cry, never gonna say goodbye...';
  },
},

// 修改后
// Removed models section to avoid interfering with the main AI model responses
// models: {
//   [ModelType.TEXT_SMALL]: async (...),
//   [ModelType.TEXT_LARGE]: async (...),
// },
```

## 🛠️ 修复步骤

1. **编辑插件文件**
   ```bash
   # 编辑 plugin-get-news/src/plugin.ts
   # 移除或注释掉整个 models 部分
   ```

2. **重新构建插件**
   ```bash
   cd plugin-get-news
   bun run build
   ```

3. **重新构建主项目**
   ```bash
   cd ..
   bun run build
   ```

4. **测试修复效果**
   - 重启服务
   - 测试 SolanaData 智能体对话
   - 确认不再出现 Rick Astley 歌词

## 📊 问题影响分析

| 影响方面 | 严重程度 | 说明 |
|----------|----------|------|
| **智能体功能** | 🔴 完全失效 | 无法进行任何正常对话 |
| **用户体验** | 🔴 极差 | 看到奇怪的歌词，无法使用 |
| **系统稳定性** | 🔴 不稳定 | 无限重试消耗资源 |
| **开发效率** | 🔴 阻塞 | 核心功能不可用 |

## 💡 插件开发最佳实践

### 🚫 绝对不要做的事情

1. **不要覆盖 `models`**
   ```typescript
   // ❌ 错误：会干扰整个智能体的响应机制
   models: {
     [ModelType.TEXT_SMALL]: async () => "固定响应",
   }
   ```

2. **不要返回非 XML 格式的响应**
   - ElizaOS 期望包含 `<thought>` 和 `<actions>` 的 XML 格式
   - 纯文本响应会导致解析失败

### ✅ 正确的插件开发方式

1. **使用 Actions 扩展功能**
   ```typescript
   const newsAction: Action = {
     name: 'GET_LATEST_NEWS',
     description: 'Get latest news about Solana',
     validate: async (runtime, message) => { /* 验证逻辑 */ },
     handler: async (runtime, message) => { /* 处理逻辑 */ },
   }
   ```

2. **使用 Providers 提供数据**
   ```typescript
   const newsProvider: Provider = {
     name: 'NEWS_PROVIDER',
     description: 'Provides latest news data',
     get: async (runtime, message, state) => {
       return { text: 'Latest news data...', data: {} };
     },
   }
   ```

3. **使用 Services 处理后台任务**
   ```typescript
   export class NewsService extends Service {
     static override serviceType = 'news';

     constructor(runtime: IAgentRuntime) {
       super(runtime);
       // 初始化新闻服务
     }
   }
   ```

## 🧪 验证步骤

修复后，验证以下功能：

1. **基础对话测试**
   - "你好" → 应该得到正常的 AI 回复
   - "你叫什么名字" → 应该回复 "SolanaData"

2. **专业功能测试**
   - "什么是 Solana" → 应该给出技术解释
   - "查询代币信息" → 应该展示专业能力

3. **插件功能测试**
   - 确认插件已加载但不再干扰响应
   - 测试插件的正常功能（如果有）

## 📝 经验教训

### 1. **模板插件陷阱**
- 官方模板包含测试代码，需要清理
- 不要直接使用模板的示例功能
- 确保理解每个代码块的作用

### 2. **插件架构理解**
- 插件应该**扩展**而不是**覆盖**核心功能
- `models` 覆盖是最危险的操作之一
- 应该通过 actions、providers、services 来扩展功能

### 3. **调试思路**
- 当智能体返回异常内容时，检查所有加载的插件
- 对比正常工作的智能体和有问题的智能体的插件差异
- 逐步移除插件来定位问题

## 🔧 相关技术细节

### ElizaOS 插件加载机制
1. 智能体启动时加载所有配置的插件
2. 插件的 `models` 部分会**覆盖**默认的模型调用
3. 如果多个插件都定义 `models`，后加载的插件会覆盖前面的
4. 覆盖后，所有 AI 响应都会经过插件的模型处理

### XML 格式要求
```xml
<thought>
  智能体的思考过程
</thought>
<actions>
  <action>RESPOND</action>
</actions>
```

纯文本响应（如歌词）不符合这个格式，会导致解析失败。

---

**状态**: ✅ 已解决
**根本原因**: 插件模板的测试代码覆盖了 AI 模型调用
**修复方案**: 移除插件的 `models` 部分
**优先级**: P0 - 严重问题
**最后更新**: 2025-10-25
**教训**: 永远不要在插件中覆盖 models，使用 actions/providers 扩展功能