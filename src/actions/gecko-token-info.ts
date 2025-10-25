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

// GeckoTerminal API 数据模型
interface GeckoImage {
  thumb: string;
  small: string;
  large: string;
}

interface GeckoGtScoreDetails {
  pool: number;
  transaction: number;
  creation: number;
  info: number;
}

interface GeckoHolders {
  count: number;
  distribution_percentage: {
    top_10: string;
    "11_20": string;
    "21_40": string;
    rest: string;
  };
  last_updated: string;
}

interface GeckoLaunchpadDetails {
  graduation_percentage: number;
  completed: boolean;
  completed_at: string;
  migrated_destination_pool_address: string;
}

interface GeckoTokenAttributes {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  image: GeckoImage;
  coingecko_coin_id: string | null;
  websites: string[];
  discord_url: string | null;
  telegram_handle: string | null;
  twitter_handle: string | null;
  description: string | null;
  gt_score: number;
  gt_score_details: GeckoGtScoreDetails;
  categories: string[];
  gt_category_ids: string[];
  holders: GeckoHolders;
  mint_authority: string;
  freeze_authority: string;
  is_honeypot: string;
  launchpad_details: GeckoLaunchpadDetails;
}

interface GeckoTokenData {
  id: string;
  type: string;
  attributes: GeckoTokenAttributes;
}

interface GeckoTokenInfoResponse {
  data: GeckoTokenData;
}

// 验证输入参数的 schema
const tokenInfoSchema = z.object({
  tokenAddress: z.string().min(1, "Token address is required"),
});

/**
 * 根据代币地址获取 Solana 代币详细信息
 */
export const tokenInfoAction: Action = {
  name: "TOKEN_INFO",
  description: "Get detailed token information from GeckoTerminal API by token address",
  similes: [
    "get token info",
    "token information",
    "查询代币信息",
    "代币详细信息",
    "token details",
    "check token",
  ],
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you get info for token address HGafL7qFRtS6zYyUMn1jJc3z67itxZYd55D94mfupump?",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "I'll get the detailed token information for that address.",
          actions: ["TOKEN_INFO"],
        },
      },
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "查询代币信息：So11111111111111111111111111111111111111112",
        },
      },
      {
        name: "{{name2}}",
        content: {
          text: "正在查询该代币的详细信息...",
          actions: ["TOKEN_INFO"],
        },
      },
    ],
  ],

  validate: async (runtime: IAgentRuntime, message: Memory) => {
    // 从消息中提取代币地址
    const text = message.content.text.toLowerCase();

    // 匹配 Solana 地址格式 (43-44字符，base58编码)
    const addressMatch = text.match(/[1-9A-HJ-NP-Za-km-z]{43,44}/);

    if (!addressMatch) {
      return false;
    }

    try {
      tokenInfoSchema.parse({ tokenAddress: addressMatch[0] });
      return true;
    } catch {
      return false;
    }
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: { [key: string]: unknown },
    callback?: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      // 提取代币地址
      const text = message.content.text;
      const addressMatch = text.match(/[1-9A-HJ-NP-Za-km-z]{43,44}/);

      if (!addressMatch) {
        throw new Error("No valid Solana token address found in message");
      }

      const tokenAddress = addressMatch[0];
      logger.info({ tokenAddress }, "Fetching token info from GeckoTerminal");

      // 调用 GeckoTerminal API
      const apiUrl = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}/info`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`GeckoTerminal API error: ${response.status} ${response.statusText}`);
      }

      const data: GeckoTokenInfoResponse = await response.json();
      const token = data.data.attributes;

      // 格式化返回信息
      const formattedInfo = `
💎 **代币详细信息**

**基本信息:**
🏷️ 名称: ${token.name}
🔤 符号: ${token.symbol}
📍 地址: \`${token.address}\`
🔢 精度: ${token.decimals}

**评分指标:**
⭐ GT评分: ${token.gt_score.toFixed(2)}
📊 评分详情:
  • 流动性: ${token.gt_score_details.pool}
  • 交易: ${token.gt_score_details.transaction}
  • 创建: ${token.gt_score_details.creation}
  • 信息: ${token.gt_score_details.info}

**持有者信息:**
👥 持有者数量: ${token.holders.count.toLocaleString()}
📈 分布情况:
  • 前10%: ${token.holders.distribution_percentage.top_10}%
  • 11-20%: ${token.holders.distribution_percentage["11_20"]}%
  • 21-40%: ${token.holders.distribution_percentage["21_40"]}%
  • 其他: ${token.holders.distribution_percentage.rest}%

**安全设置:**
🔒 Mint权限: ${token.mint_authority}
🧊 Freeze权限: ${token.freeze_authority}
🚨 蜜罐检测: ${token.is_honeypot}

**分类标签:**
📂 ${token.categories.length > 0 ? token.categories.join(", ") : "无分类"}

**启动台信息:**
🎓 毕业进度: ${token.launchpad_details.graduation_percentage}%
✅ 已完成: ${token.launchpad_details.completed ? "是" : "否"}
${token.launchpad_details.completed ? `📅 完成时间: ${new Date(token.launchpad_details.completed_at).toLocaleString()}` : ""}

**社交媒体:**
${token.discord_url ? `💬 Discord: ${token.discord_url}` : "💬 Discord: 无"}
${token.telegram_handle ? `📱 Telegram: ${token.telegram_handle}` : "📱 Telegram: 无"}
${token.twitter_handle ? `🐦 Twitter: ${token.twitter_handle}` : "🐦 Twitter: 无"}

${token.description ? `📝 描述: ${token.description}` : "📝 描述: 无"}
      `.trim();

      if (callback) {
        callback({
          text: formattedInfo,
          data: {
            tokenAddress,
            tokenInfo: token,
          },
        });
      }

      return {
        success: true,
        data: {
          tokenAddress,
          tokenInfo: token,
        },
      };
    } catch (error) {
      logger.error(error, "Error fetching token info from GeckoTerminal");

      const errorMessage = `❌ 获取代币信息失败: ${error instanceof Error ? error.message : "未知错误"}`;

      if (callback) {
        callback({
          text: errorMessage,
          error: true,
        });
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },
};

// 导出 actions 供插件使用
export const geckoTokenActions = [tokenInfoAction];