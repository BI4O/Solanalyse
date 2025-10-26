# CustomOpenAI 插件 API 响应解析错误

## 问题描述

在使用 CustomOpenAI 插件时，出现 `TypeError: undefined is not an object (evaluating 'data.choices[0]')` 错误，导致 TokenView Agent 崩溃。

## 错误详情

```
Error: 1707 |       });
1708 |       if (!response.ok) {
1709 |         throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
1710 |       }
1711 |       const data = await response.json();
1712 |       const openaiResponse = data.choices[0]?.message?.content || "";
                                         ^
TypeError: undefined is not an object (evaluating 'data.choices[0]')
```

## 根本原因

CustomOpenAI 插件中的 API 响应处理逻辑不够健壮，当 API 返回的响应格式不符合预期时（缺少 `choices` 数组或 `choices[0]` 为空），代码会直接崩溃。

## 具体问题位置

1. `generateObjectByModelType` 函数（第 86 行）
2. `ModelType.TEXT_SMALL` 模型处理（第 186 行）
3. `ModelType.TEXT_LARGE` 模型处理（第 238 行）
4. `ModelType.TEXT_EMBEDDING` 模型处理（第 298 行）

## 解决方案

在所有 API 响应处理位置添加详细的响应格式检查：

### 1. 对话完成模型（TEXT_SMALL/LARGE）
```typescript
// 检查响应数据格式
if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
  logger.error(`[CustomOpenAI] Invalid API response: missing or empty choices array. Response: ${JSON.stringify(data)}`);
  throw new Error(`Invalid API response: missing or empty choices array. Response: ${JSON.stringify(data)}`);
}

if (!data.choices[0].message || !data.choices[0].message.content) {
  logger.error(`[CustomOpenAI] Invalid API response: missing message content in choice[0]. Response: ${JSON.stringify(data)}`);
  throw new Error(`Invalid API response: missing message content in choice[0]. Response: ${JSON.stringify(data)}`);
}
```

### 2. 嵌入模型（TEXT_EMBEDDING）
```typescript
// 检查嵌入响应数据格式
if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
  logger.warn(`[CustomOpenAI] Invalid embedding response: missing or empty data array. Response: ${JSON.stringify(data)}`);
  // 返回一个模拟的嵌入向量
  return new Array(1536).fill(0);
}

if (!data.data[0].embedding) {
  logger.warn(`[CustomOpenAI] Invalid embedding response: missing embedding in data[0]. Response: ${JSON.stringify(data)}`);
  // 返回一个模拟的嵌入向量
  return new Array(1536).fill(0);
}
```

## 预防措施

1. **API 响应验证**：所有 API 调用后都应该验证响应格式
2. **详细错误日志**：记录完整的响应数据以便调试
3. **优雅降级**：对于非关键功能（如嵌入），在出错时提供默认值
4. **错误边界**：在更高层级捕获和处理 API 错误

## 测试验证

- ✅ 测试 iFlow API 响应格式正常
- ✅ 添加了所有模型的响应格式检查
- ✅ 重新构建项目成功

## 相关文件

- `src/plugins/custom-openai.ts` - 主要修复文件
- `.env` - API 配置文件

## 修复日期

2025-01-25

## 修复人

Claude Code