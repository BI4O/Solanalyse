import { type Plugin, logger } from "@elizaos/core";
import { geckoTokenActions } from "../actions/gecko-token-info";

/**
 * GeckoTerminal Plugin - 包装 GeckoTerminal API token info Actions
 */
export const geckoTerminalPlugin: Plugin = {
  name: "gecko-terminal-plugin",
  description: "GeckoTerminal API integration for Solana token information and security analysis",

  async init(config: Record<string, string>) {
    logger.info("Initializing GeckoTerminal plugin");

    // GeckoTerminal 目前不需要 API key，但保留配置检查
    const baseUrl = config.GECKO_BASE_URL || "https://api.geckoterminal.com";

    logger.info(`GeckoTerminal base URL: ${baseUrl}`);
    logger.info("GeckoTerminal plugin initialized successfully");
  },

  // 不提供 routes、events、services，只提供 actions
  routes: [],
  events: {},
  services: [],

  // 核心：提供 GeckoTerminal token info Actions
  actions: geckoTokenActions,

  providers: [],

  // 可选的依赖项
  // dependencies: ['@elizaos/plugin-sql'],
};

export default geckoTerminalPlugin;