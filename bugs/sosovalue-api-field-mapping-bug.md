# SoSoValue API 字段映射 Bug

## 🐛 Bug 描述

**发现日期**: 2025-10-25
**影响组件**: `src/actions/get-news.ts`
**严重程度**: P0 - 阻塞性问题

### 问题现象

1. **所有代币ID都相同**: 无论搜索什么代币（Bitcoin、Ethereum、Solana），都返回相同的代币ID
2. **新闻内容重复**: 无论查询哪个代币的新闻，都返回相同的几条新闻
3. **数量限制失效**: 用户要求限制新闻数量，但返回的新闻数量不符合预期

### 根本原因

**API 参数配置错误**：代码中使用了 `categoryList=1,2,3,4,5,6,7,9,10`（所有新闻类别），导致：
1. API 返回与目标代币相关的**所有类别**新闻
2. 热门综合新闻（如ETF流量报告）同时涉及多个主流代币（BTC、ETH、SOL等）
3. 造成"不同代币返回相同新闻"的假象

**正确的配置**：使用 `categoryList=1`（仅新闻类别）可以实现有效的代币筛选。

**次要问题**：代币搜索逻辑缺乏调试日志，难以定位搜索失败的具体原因。

### 具体错误位置

文件: `src/actions/get-news.ts:144-167`

```typescript
// ❌ 错误的搜索逻辑
let match = currencies.find(
  (currency) =>
    currency.currencyName.toLowerCase() === lowerQuery ||  // 可能的字段名错误
    currency.fullName.toLowerCase() === lowerQuery          // 可能的字段名错误
);
```

### API 响应格式分析

根据代码注释中的接口定义：

```typescript
interface SosoCurrency {
  currencyId: string;  // ✅ 正确：API 返回的是 currencyId
  fullName: string;    // ✅ 正确
  currencyName: string; // ✅ 正确：API 返回的是 currencyName
}
```

但实际搜索逻辑可能使用了错误的字段名进行比较。

### 问题链条

1. **代币搜索失败** → `searchCurrency()` 总是返回 `null`
2. **回退逻辑错误** → 可能使用了缓存或默认的第一个代币ID
3. **新闻查询错误** → 总是查询相同代币ID的新闻
4. **用户体验差** → 感觉代理在"糊弄"用户

## 🔧 修复方案

### 1. 验证 API 实际响应

首先验证 SoSoValue API 实际返回的数据结构：

```bash
curl --proxy "http://127.0.0.1:7897" -i -s -X POST "https://openapi.sosovalue.com/openapi/v1/data/default/coin/list" \
  -H "x-soso-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{}"
```

### 2. 更新搜索逻辑

根据实际 API 响应更正字段名映射：

```typescript
// ✅ 修复后的搜索逻辑
async searchCurrency(query: string): Promise<SosoCurrency | null> {
  const currencies = await this.getAllCurrencies();
  const lowerQuery = query.toLowerCase();

  // 精确匹配优先
  let match = currencies.find(
    (currency) =>
      currency.currencyName?.toLowerCase() === lowerQuery ||  // 使用可选链
      currency.fullName?.toLowerCase() === lowerQuery
  );

  // 模糊匹配
  if (!match) {
    match = currencies.find(
      (currency) =>
        currency.currencyName?.toLowerCase().includes(lowerQuery) ||
        currency.fullName?.toLowerCase().includes(lowerQuery) ||
        lowerQuery.includes(currency.currencyName?.toLowerCase()) ||
        lowerQuery.includes(currency.fullName?.toLowerCase())
    );
  }

  return match || null;
}
```

### 3. 添加调试日志

```typescript
logger.info(`Available currencies: ${currencies.slice(0, 3).map(c => c.fullName).join(', ')}`);
logger.info(`Searching for: ${searchQuery}`);
logger.info(`Found match: ${match ? `${match.fullName} (${match.currencyId})` : 'None'}`);
```

### 4. 验证新闻查询

确保 `getCurrencyNews()` 正确使用代币ID：

```typescript
async getCurrencyNews(
  currencyId: string,  // 确保使用正确的代币ID
  pageNum: number = 1,
  pageSize: number = 10,
  categoryList: string = "1,2,3,4,5,6,7,9,10"
): Promise<SosoNewsItem[]> {
  logger.info(`Fetching news for currencyId: ${currencyId}`);

  const url = `${this.baseUrl}/api/v1/news/featured/currency?currencyId=${currencyId}&pageNum=${pageNum}&pageSize=${pageSize}&categoryList=${categoryList}`;

  const response = await this.makeRequest<SosoNewsResponse>(url);
  // ... 其余逻辑
}
```

## 🧪 测试验证

修复后需要测试以下场景：

1. **代币搜索测试**:
   - 搜索 "BTC" → 应返回 Bitcoin (1673723677362319866)
   - 搜索 "ETH" → 应返回 Ethereum (不同的ID)
   - 搜索 "SOL" → 应返回 Solana (不同的ID)

2. **新闻查询测试**:
   - Bitcoin 新闻 → 应包含比特币相关新闻
   - Ethereum 新闻 → 应包含以太坊相关新闻
   - 数量限制 → 应遵守用户指定的数量

3. **错误处理测试**:
   - 搜索不存在的代币 → 应返回友好的错误信息
   - API 调用失败 → 应有适当的错误处理

## 📊 影响评估

- **用户影响**: 严重 - 用户无法获得正确的代币信息和新闻
- **功能影响**: 阻塞性 - 核心功能完全失效
- **数据准确性**: 完全错误 - 所有返回数据都是错误的

## 🚀 预防措施

1. **API 响应验证**: 添加 API 响应格式的运行时验证
2. **单元测试**: 为代币搜索和新闻查询功能添加单元测试
3. **集成测试**: 添加端到端的 API 集成测试
4. **文档同步**: 确保 API 文档与实际实现保持同步
5. **错误日志**: 增强调试日志，便于快速定位类似问题

## 📝 备注

这个 Bug 暴露了 API 集成中的几个关键问题：
- 缺乏 API 响应验证
- 错误处理不够完善
- 调试信息不足
- 测试覆盖率不够

建议在未来开发中：
1. 总是验证 API 响应格式
2. 添加充分的调试日志
3. 编写全面的单元测试和集成测试
4. 保持 API 文档的及时更新

---

**修复负责人**: Claude Code
**修复状态**: 待修复
**预计修复时间**: 30分钟
**验证方式**: 手动测试 + 自动化测试