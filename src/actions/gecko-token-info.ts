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

// 紧凑版 Markdown 生成模板（不含 HTML）
function shortAddr(addr: string): string {
  if (!addr) return '—';
  return `\`${addr.slice(0,6)}...${addr.slice(-4)}\``;
}
// 短进度条，适合紧凑布局
function progressBar(percent: number, len: number = 6): string {
  if (percent == null) return '`—`';
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const filled = '█'.repeat(Math.round((p/100)*len));
  const empty = '─'.repeat(len - filled.length);
  return `\`${filled}${empty}\` ${p}%`;
}

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
  launchpad_details?: GeckoLaunchpadDetails; // 只有这个字段可选
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


      let formattedInfo = `## 🪙 ${token.name || 'Unknown'}${token.symbol ? ` (${token.symbol})` : ''} — ${shortAddr(token.address)}

**GT:** ⭐ ${token.gt_score != null ? token.gt_score.toFixed(1) : '—'}  •  **持有:** ${token.holders?.count != null ? token.holders.count.toLocaleString() : '—'}
**安全:** ${token.is_honeypot === 'yes' ? '🚨 蜜罐' : token.is_honeypot === 'no' ? '✅ 安全' : '⚠️ 未知'}`;

      formattedInfo += `

**指标:** ${token.gt_score_details?.pool != null ? progressBar(token.gt_score_details.pool) : '`—`'} 流动性 · ${token.gt_score_details?.transaction != null ? progressBar(token.gt_score_details.transaction) : '`—`'} 活跃度`;

      // 分类/社媒 单行显示（存在则显示）
      const cats = Array.isArray(token.categories) && token.categories.length ? token.categories.map(c => `\`${c}\``).join(' ') : '';
      const socials = [
        token.telegram_handle ? `TG:${token.telegram_handle}` : null,
        token.twitter_handle ? `TW:${token.twitter_handle}` : null,
        token.discord_url ? `DC` : null
      ].filter(Boolean).join(' · ');

      if (cats) formattedInfo += `\n\n**分类:** ${cats}`;
      if (socials) formattedInfo += `\n**社媒:** ${socials}`;

      // 折叠部分（保留但紧凑）
      formattedInfo += `

<details><summary>更多 ▸</summary>

- 创建: ${token.gt_score_details?.creation != null ? token.gt_score_details.creation + '%' : '—'}  ·  信息: ${token.gt_score_details?.info != null ? token.gt_score_details.info + '%' : '—'}
- Top10%: ${token.holders?.distribution_percentage?.top_10 ?? '—'}%  ·  11-20%: ${token.holders?.distribution_percentage?.["11_20"] ?? '—'}%  ·  其他: ${token.holders?.distribution_percentage?.rest ?? '—'}%
- 精度: ${token.decimals ?? '—'}  ·  Mint: ${token.mint_authority === 'yes' ? '❌ 有' : token.mint_authority === 'no' ? '✅ 无' : '—'}  ·  Freeze: ${token.freeze_authority === 'yes' ? '❌ 有' : token.freeze_authority === 'no' ? '✅ 无' : '—'}
${token.launchpad_details ? `- 启动台毕业: ${token.launchpad_details.graduation_percentage ?? '—'}%` : ''}

</details>`;

      // 描述（如存在，截断成一行）
      if (token.description) {
        const desc = token.description.replace(/\s+/g,' ').trim();
        formattedInfo += `

**描述:** ${desc.length > 180 ? desc.slice(0,180) + '...' : desc}`;
      }

      formattedInfo = formattedInfo.trim();

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