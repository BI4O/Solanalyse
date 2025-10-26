# SoSoNews Agent新闻查询匹配优化方案

## 问题描述

用户请求"获取最新的Solana新闻"时，系统未能正确匹配到GET_TOKEN_NEWS action，而是执行了NONE action，导致无法获取相应的新闻资讯。

## 问题分析

1. **模型决策问题**：虽然validate函数逻辑上应该能匹配到该请求，但大模型在处理时没有正确识别应该使用GET_TOKEN_NEWS action

2. **提示词指导不足**：系统提示词中对何时使用GET_TOKEN_NEWS action的指导不够明确

3. **验证逻辑可进一步优化**：虽然已有基础验证逻辑，但可以增加更多智能匹配模式

## 解决方案

### 1. 系统提示词优化

在`src/characters/SoSoNews.ts`中增加了：

#### Action关键词标注
```
### 1. SEARCH_TOKEN_ID
- **Keywords**: ID, identifiers, lookup, search, find, coin, token, currency

### 2. GET_TOKEN_NEWS
- **Keywords**: news, news updates, latest news, updates, information, what's happening, how is X doing, recent, headlines, articles, stories, news feed
```

#### Action Selection Rules（新增）
```
## 📋 Action Selection Rules:
1. **优先选择GET_TOKEN_NEWS** for any request containing: "新闻", "资讯", "消息", "最新", "动态", "news", "update", "latest", "recent", "headlines"
2. **选择SEARCH_TOKEN_ID** only for requests asking for: "ID", "标识", "查找", "search", "lookup", "identify", "what is the ID"
3. **When both actions match**: If a query contains both token info and news keywords, prioritize GET_TOKEN_NEWS
4. **News intent detection**: If user asks about "how X is doing", "what's happening with X", or "X 最近怎么样", use GET_TOKEN_NEWS
5. **News request patterns**: "获取最新的X新闻", "X的最新新闻", "X有什么新闻", "X最近怎么样" all should use GET_TOKEN_NEWS
```

#### 扩展示例
```
### 2. GET_TOKEN_NEWS
- **Examples**: "BTC latest news", "ETH有什么新闻", "ADA updates", "show me SOL news", "获取最新的Solana新闻", "Solana的最新动态"
```

### 2. Action验证逻辑优化

在`src/actions/get-news.ts`中优化了GET_TOKEN_NEWS action的validate函数：

#### 扩展关键词列表
```typescript
// 更全面的新闻关键词列表
const newsKeywords = [
  "新闻", "资讯", "消息", "动态", "最新", "news", "update", "latest", "recent", "headlines",
  "条新闻", "条资讯", "有什么", "如何", "怎么样", "最新情况", "updates", "articles", "stories"
];

// 扩展的代币关键词列表
const tokenKeywords = [
  "bitcoin", "btc", "ethereum", "eth", "solana", "sol", "dogecoin", "doge",
  "ada", "cardano", "dot", "polkadot", "bnb", "binance", "usdt", "tether",
  "usdc", "circle", "xrp", "ripple", "matic", "polygon", "link", "chainlink",
  "uni", "uniswap", "ltc", "litecoin", "bch", "bitcoincash", "trx", "tron",
  "avax", "avalanche", "atom", "cosmos", "near", "fil", "filecoin", "algo", "algorand"
];
```

#### 智能意图检测
```typescript
// 更智能的新闻意图检测
const newsIntentPatterns = [
  /获取最新的.*新闻/,
  /.*的最新新闻/,
  /.*有什么新闻/,
  /.*最近怎么样/,
  /.*最新动态/,
  /.*资讯/,
  /.*消息/,
  /.*updates?/,
  /.*news/,
  /.*headlines/,
  /.*stories/,
  /.*articles/,
  /what.*happening.*with/,
  /how.*is.*doing/,
  /latest.*news.*for/
];

const hasNewsIntent = newsIntentPatterns.some(pattern => pattern.test(text));

// 如果有明确的新闻意图，直接返回true
if (hasNewsIntent) return true;
```

## 实施细节

**文件**:
- `src/characters/SoSoNews.ts` - 系统提示词优化
- `src/actions/get-news.ts` - Action验证逻辑优化

### 主要变更点：
1. 增加了Action Selection Rules明确指导模型选择action
2. 为每个action添加了关键词标注
3. 扩展了GET_TOKEN_NEWS的示例，包含具体用例
4. 优化了验证逻辑，使用更智能的模式匹配
5. 扩展了关键词词典，支持更多中英文表达
6. 添加了正则表达式模式匹配，识别特定的请求模式

## 测试验证

- [x] 验证"获取最新的Solana新闻"能够正确匹配GET_TOKEN_NEWS action
- [x] 确认"Solana的最新动态"能够触发新闻查询
- [x] 测试各种新闻查询表达方式的匹配效果
- [x] 验证中英文混合查询的识别准确性

## 相关文件

- `src/characters/SoSoNews.ts` - 系统提示词优化
- `src/actions/get-news.ts` - Action验证逻辑优化

## 方案优势

1. **双重保障**：既有系统提示词指导，又有验证逻辑保障
2. **意图识别**：超越简单的关键词匹配，实现意图检测
3. **自然语言支持**：更好地支持用户的自然语言请求
4. **兼容性强**：支持中英文混合查询
5. **用户体验**：提高查询成功率，减少用户重复查询

## 优化日期

2025-01-26

## 优化人

Claude Code & User