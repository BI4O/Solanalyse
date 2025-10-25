import { type Plugin, logger } from "@elizaos/core";
import { sosoNewsActions } from "../actions/get-news";

/**
 * SoSoValue News Plugin - 包装 SoSoValue 新闻查询 Action
 */
export const sosoNewsPlugin: Plugin = {
  name: "soso-news-plugin",
  description: "SoSoValue API integration for cryptocurrency news and token information",

  async init(config: Record<string, string>) {
    logger.info("Initializing SoSoValue news plugin");

    // 检查必要的环境变量
    if (!config.SOSO_API_KEY) {
      logger.warn("SOSO_API_KEY not configured - SoSoValue actions will not work");
    } else {
      logger.info("SoSoValue API key configured successfully");
    }
  },

  // 不提供 routes、events、services，只提供 actions
  routes: [],
  events: {},
  services: [],

  // 核心：提供 SoSoValue 新闻查询 Actions
  actions: sosoNewsActions,

  providers: [],

  // 可选的依赖项
  // dependencies: ['@elizaos/plugin-sql'],
};

export default sosoNewsPlugin;