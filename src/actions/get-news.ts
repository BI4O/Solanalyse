import {
  type Action,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
  logger,
} from "@elizaos/core";
import { z } from "zod";

// SoSoValue API 数据模型
interface SosoCurrency {
  currencyId: string;  // 注意：API 返回的是 currencyId，不是 id
  fullName: string;
  currencyName: string;  // 注意：API 返回的是 currencyName，不是 name
}

interface SosoNewsItem {
  id: string;
  sourceLink: string;
  releaseTime: number;
  author: string;
  category: number;
  featureImage: string;
  matchedCurrencies: Array<{
    id: string;
    fullName: string;
    name: string;
  }>;
  tags: string[];
  multilanguageContent: Array<{
    language: string;
    title: string;
    content: string;
  }>;
}

interface SosoListResponse {
  code: number;
  msg: string | null;
  data: SosoCurrency[];
}

interface SosoNewsResponse {
  code: number;
  msg: string | null;
  data: {
    pageNum: string;
    pageSize: string;
    totalPages: string;
    total: string;
    list: SosoNewsItem[];
  };
}

// SoSoValue API 客户端
class SosoValueClient {
  private apiKey: string;
  private baseUrl: string;
  private agent: any;
  private proxyUrl: string | null;

  constructor(apiKey: string, baseUrl: string = "https://openapi.sosovalue.com") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;

    // 检查代理配置
    this.proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy || null;
    if (this.proxyUrl) {
      logger.info(`Proxy configured: ${this.proxyUrl}`);
    }
  }

  private async ensureProxyAgent(): Promise<void> {
    if (this.proxyUrl && !this.agent) {
      try {
        const proxyAgentModule = await import("https-proxy-agent");
        const HttpsProxyAgent = proxyAgentModule.HttpsProxyAgent || proxyAgentModule.default;
        if (HttpsProxyAgent) {
          this.agent = new HttpsProxyAgent(this.proxyUrl);
          logger.info(`HttpsProxyAgent initialized: ${this.proxyUrl}`);
        } else {
          logger.warn(`HttpsProxyAgent not available, requests will proceed without proxy`);
          this.agent = null;
        }
      } catch (importError) {
        logger.warn(`ProxyAgent not available, requests will proceed without proxy: ${importError.message}`);
        this.agent = null;
      }
    }
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    // 确保代理 Agent 已初始化
    await this.ensureProxyAgent();

    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "x-soso-api-key": this.apiKey,
        ...options.headers,
      },
    };

    // 如果配置了代理，使用代理 agent
    if (this.agent) {
      fetchOptions.agent = this.agent;
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`SoSoValue API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 获取所有支持的代币列表
   */
  async getAllCurrencies(): Promise<SosoCurrency[]> {
    const url = `${this.baseUrl}/openapi/v1/data/default/coin/list`;

    const response = await this.makeRequest<SosoListResponse>(url, {
      method: "POST",
      body: "{}",
    });

    if (response.code !== 0) {
      throw new Error(`SoSoValue API error: ${response.msg || "Unknown error"}`);
    }

    return response.data;
  }

  /**
   * 根据名称或符号搜索代币
   */
  async searchCurrency(query: string): Promise<SosoCurrency | null> {
    const currencies = await this.getAllCurrencies();
    const lowerQuery = query.toLowerCase();

    // 精确匹配优先
    let match = currencies.find(
      (currency) =>
        currency.currencyName.toLowerCase() === lowerQuery ||
        currency.fullName.toLowerCase() === lowerQuery
    );

    // 模糊匹配
    if (!match) {
      match = currencies.find(
        (currency) =>
          currency.currencyName.toLowerCase().includes(lowerQuery) ||
          currency.fullName.toLowerCase().includes(lowerQuery) ||
          lowerQuery.includes(currency.currencyName.toLowerCase()) ||
          lowerQuery.includes(currency.fullName.toLowerCase())
      );
    }

    return match || null;
  }

  /**
   * 获取指定代币的新闻
   */
  async getCurrencyNews(
    currencyId: string,
    pageNum: number = 1,
    pageSize: number = 10,
    categoryList: string = "1,2,3,4,5,6,7,9,10"
  ): Promise<SosoNewsItem[]> {
    // 根据 API 文档，使用正确的 URL 路径
    const url = `${this.baseUrl}/api/v1/news/featured/currency?currencyId=${currencyId}&pageNum=${pageNum}&pageSize=${pageSize}&categoryList=${categoryList}`;

    const response = await this.makeRequest<SosoNewsResponse>(url);

    if (response.code !== 0) {
      throw new Error(`SoSoValue API error: ${response.msg || "Unknown error"}`);
    }

    return response.data.list;
  }
}

// 工具函数：格式化新闻输出（Markdown表格形式）
function formatNewsOutput(news: SosoNewsItem[], currency: SosoCurrency): string {
  if (news.length === 0) {
    return `📰 暂时没有找到 ${currency.fullName} (${currency.currencyName}) 的相关新闻。`;
  }

  let output = `## 📈 ${currency.fullName} (${currency.currencyName.toUpperCase()}) 最新资讯\n\n`;

  // 创建表格头部
  output += `| 序号 | 标题 | 日期 | 类型 | 作者 | 标签 |\n`;
  output += `|------|------|------|------|------|------|\n`;

  news.forEach((item, index) => {
    const englishContent = item.multilanguageContent.find(
      (content) => content.language === "en"
    );

    if (englishContent) {
      const publishDate = new Date(item.releaseTime).toLocaleDateString("zh-CN");
      const categoryNames = {
        1: "新闻",
        2: "研究报告",
        3: "机构动态",
        4: "市场洞察",
        5: "宏观新闻",
        6: "宏观研究",
        7: "官方推文",
        9: "价格预警",
        10: "链上数据",
      };

      const categoryName = categoryNames[item.category] || "其他";

      // 处理标题为空的情况，使用内容的前50个字符作为标题
      let title = englishContent.title;
      if (!title && englishContent.content) {
        title = englishContent.content.substring(0, 50) + "...";
      }
      if (!title) {
        title = "无标题";
      }

      // 限制标题长度以保持表格整洁
      if (title.length > 30) {
        title = title.substring(0, 30) + "...";
      }

      // 处理作者信息
      let author = item.author || "—";

      // 处理标签信息
      let tags = item.tags && item.tags.length > 0 ? item.tags.join(", ") : "—";

      // 转义Markdown特殊字符
      title = title.replace(/\|/g, "\\|").replace(/\n/g, " ");
      author = author.replace(/\|/g, "\\|").replace(/\n/g, " ");
      tags = tags.replace(/\|/g, "\\|").replace(/\n/g, " ");

      output += `| ${index + 1} | [${title}](${item.sourceLink}) | ${publishDate} | ${categoryName} | ${author} | ${tags} |\n`;
    }
  });

  return output;
}

// 工具函数：格式化代币信息
function formatTokenOutput(token: SosoCurrency): string {
  return `💎 代币信息：\n**${token.fullName}** (${token.currencyName.toUpperCase()})\n🆔 ID: ${token.currencyId}`;
}

/**
 * Action 1: 搜索代币ID
 */
const searchTokenIdAction: Action = {
  name: "SEARCH_TOKEN_ID",
  similes: ["FIND_TOKEN", "TOKEN_SEARCH", "LOOKUP_TOKEN", "SEARCH_COIN", "查询代币", "代币ID"],
  description: "Search for cryptocurrency ID by name or symbol using SoSoValue API",

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined
  ): Promise<boolean> => {
    // 检查是否配置了 SoSoValue API
    const apiKey = runtime.getSetting("SOSO_API_KEY");
    if (!apiKey) {
      logger.warn("SOSO_API_KEY not configured");
      return false;
    }

    // 验证是否包含代币查询意图
    const text = message.content.text.toLowerCase();
    const searchKeywords = [
      "id", "标识", "查询", "搜索", "找", "lookup", "search", "find",
      "bitcoin", "btc", "ethereum", "eth", "solana", "sol", "dogecoin", "doge"
    ];

    return searchKeywords.some(keyword => text.includes(keyword)) ||
           /[a-z]{2,10}/i.test(text); // 匹配可能的代币符号
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown> = {},
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      const apiKey = runtime.getSetting("SOSO_API_KEY");
      const baseUrl = runtime.getSetting("SOSO_BASE_URL") || "https://openapi.sosovalue.com";

      const client = new SosoValueClient(apiKey, baseUrl);
      const text = message.content.text || "";

      // 提取代币名称
      const tokenPatterns = [
        /\b(btc|bitcoin|eth|ethereum|sol|solana|doge|dogecoin|ada|cardano|dot|polkadot|bnb|binance|usdt|tether|usdc|circle|xrp|ripple)\b/gi,
        /\b([A-Z]{2,10})\s*(代币|token|coin)?\b/gi,
      ];

      let searchQuery = "";
      for (const pattern of tokenPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          searchQuery = matches[0];
          break;
        }
      }

      // 如果没有匹配到特定模式，尝试提取关键词
      if (!searchQuery) {
        const words = text.split(/\s+/).filter(word => word.length > 1);
        searchQuery = words[words.length - 1]; // 取最后一个词作为查询
      }

      if (!searchQuery) {
        throw new Error("无法识别要查询的代币名称");
      }

      logger.info(`Searching for token: ${searchQuery}`);

      const token = await client.searchCurrency(searchQuery);

      if (!token) {
        // 尝试获取一些热门代币作为建议
        const popularTokens = await client.getAllCurrencies();
        const suggestions = popularTokens
          .filter(t =>
            t.currencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.fullName.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5);

        let response = `❌ 没有找到 "${searchQuery}" 对应的代币信息。`;

        if (suggestions.length > 0) {
          response += "\n\n💡 您是不是想找：\n";
          suggestions.forEach(suggestion => {
            response += `- **${suggestion.fullName}** (${suggestion.currencyName.toUpperCase()})\n`;
          });
        }

        if (callback) {
          await callback({
            text: response,
            actions: ["SEARCH_TOKEN_ID"],
            source: message.content.source,
          });
        }

        return {
          text: response,
          success: false,
          data: {
            query: searchQuery,
            suggestions,
          },
        };
      }

      const response = formatTokenOutput(token);

      if (callback) {
        await callback({
          text: response,
          actions: ["SEARCH_TOKEN_ID"],
          source: message.content.source,
        });
      }

      return {
        text: response,
        success: true,
        data: {
          tokenId: token.currencyId,
          tokenName: token.currencyName,
          fullName: token.fullName,
        },
      };
    } catch (error) {
      logger.error("Error in SEARCH_TOKEN_ID action:", error);
      const errorMessage = `查询代币信息时出错：${error instanceof Error ? error.message : "未知错误"}`;

      return {
        text: errorMessage,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Bitcoin 的代币ID是多少？",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "💎 代币信息：\n**Bitcoin** (BTC)\n🆔 ID: 1673723677362319866",
          actions: ["SEARCH_TOKEN_ID"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "查一下 SOL 的信息",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "💎 代币信息：\n**Solana** (sol)\n🆔 ID: 1673723677362319870",
          actions: ["SEARCH_TOKEN_ID"],
        },
      },
    ],
  ],
};

/**
 * Action 2: 获取代币新闻
 */
const getTokenNewsAction: Action = {
  name: "GET_TOKEN_NEWS",
  similes: ["TOKEN_NEWS", "CRYPTO_NEWS", "COIN_NEWS", "LATEST_NEWS", "新闻", "资讯", "最新消息"],
  description: "Get latest news for a specific cryptocurrency using SoSoValue API",

  validate: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined
  ): Promise<boolean> => {
    // 检查是否配置了 SoSoValue API
    const apiKey = runtime.getSetting("SOSO_API_KEY");
    if (!apiKey) {
      logger.warn("SOSO_API_KEY not configured");
      return false;
    }

    // 验证是否包含新闻查询意图
    const text = message.content.text.toLowerCase();

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

    // 检查是否包含新闻关键词
    const hasNewsKeyword = newsKeywords.some(keyword => text.includes(keyword));

    // 检查是否包含代币关键词
    const hasTokenKeyword = tokenKeywords.some(keyword => text.includes(keyword));

    // 检查是否匹配代币符号模式
    const hasTokenSymbol = /[a-z]{2,10}/i.test(text);

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

    // 如果包含新闻关键词并且包含代币相关信息，返回true
    if (hasNewsKeyword && (hasTokenKeyword || hasTokenSymbol)) return true;

    // 如果包含"条新闻"等特定组合词，返回true
    if (text.includes("条新闻") || text.includes("条资讯")) return true;

    return hasNewsKeyword && (hasTokenKeyword || hasTokenSymbol);
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown> = {},
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      const apiKey = runtime.getSetting("SOSO_API_KEY");
      const baseUrl = runtime.getSetting("SOSO_BASE_URL") || "https://openapi.sosovalue.com";

      const client = new SosoValueClient(apiKey, baseUrl);
      const text = message.content.text || "";

      // 提取代币名称（与搜索 Action 相同的逻辑）
      const tokenPatterns = [
        /\b(btc|bitcoin|eth|ethereum|sol|solana|doge|dogecoin|ada|cardano|dot|polkadot|bnb|binance|usdt|tether|usdc|circle|xrp|ripple)\b/gi,
        /\b([A-Z]{2,10})\s*(代币|token|coin)?\b/gi,
      ];

      let searchQuery = "";
      for (const pattern of tokenPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          searchQuery = matches[0];
          break;
        }
      }

      // 如果没有明确指定代币，尝试从上下文中推断
      if (!searchQuery) {
        const words = text.split(/\s+/).filter(word => word.length > 1);
        searchQuery = words[words.length - 1];
      }

      if (!searchQuery) {
        throw new Error("请指定要查询哪个代币的新闻");
      }

      logger.info(`Getting news for token: ${searchQuery}`);

      // 先搜索代币获取ID
      const token = await client.searchCurrency(searchQuery);
      if (!token) {
        const response = `❌ 没有找到 "${searchQuery}" 对应的代币，无法获取新闻。`;

        if (callback) {
          await callback({
            text: response,
            actions: ["GET_TOKEN_NEWS"],
            source: message.content.source,
          });
        }

        return {
          text: response,
          success: false,
          data: { query: searchQuery },
        };
      }

      // 获取代币新闻
      const news = await client.getCurrencyNews(token.currencyId, 1, 5); // 获取最新5条新闻
      const response = formatNewsOutput(news, token);

      if (callback) {
        await callback({
          text: response,
          actions: ["GET_TOKEN_NEWS"],
          source: message.content.source,
        });
      }

      return {
        text: response,
        success: true,
        data: {
          tokenId: token.currencyId,
          tokenName: token.currencyName,
          fullName: token.fullName,
          newsCount: news.length,
          news,
        },
      };
    } catch (error) {
      logger.error("Error in GET_TOKEN_NEWS action:", error);
      const errorMessage = `获取代币新闻时出错：${error instanceof Error ? error.message : "未知错误"}`;

      return {
        text: errorMessage,
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Bitcoin 有什么最新新闻？",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "## 📈 Bitcoin (BTC) 最新资讯\n\n| 序号 | 标题 | 日期 | 类型 | 作者 | 标签 |\n|------|------|------|------|------|------|\n| 1 | [比特币ETF获批](https://example.com) | 2024-10-25 | 新闻 | Reuters | ETF, SEC, 批准 |",
          actions: ["GET_TOKEN_NEWS"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "SOL 最近怎么样？",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "## 📈 Solana (sol) 最新资讯\n\n| 序号 | 标题 | 日期 | 类型 | 作者 | 标签 |\n|------|------|------|------|------|------|\n| 1 | [Solana网络升级成功](https://example.com) | 2024-10-24 | 技术更新 | Solana Foundation | — |",
          actions: ["GET_TOKEN_NEWS"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "获取最新的Solana新闻",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "## 📈 Solana (sol) 最新资讯\n\n| 序号 | 标题 | 日期 | 类型 | 作者 | 标签 |\n|------|------|------|------|------|------|\n| 1 | [Solana生态项目突破](https://example.com) | 2024-10-25 | 新闻 | Solana News | 生态, 项目 |",
          actions: ["GET_TOKEN_NEWS"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Solana的最新动态",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "## 📈 Solana (sol) 最新资讯\n\n| 序号 | 标题 | 日期 | 类型 | 作者 | 标签 |\n|------|------|------|------|------|------|\n| 1 | [Solana主网稳定运行](https://example.com) | 2024-10-25 | 技术更新 | Solana Team | 网络, 稳定性 |",
          actions: ["GET_TOKEN_NEWS"],
        },
      },
    ],
  ],
};

/**
 * 导出 Action 供其他模块使用
 */
export { searchTokenIdAction, getTokenNewsAction, SosoValueClient, formatNewsOutput };
export const sosoNewsActions = [searchTokenIdAction, getTokenNewsAction];
