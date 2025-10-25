import { describe, it, expect, beforeAll } from "bun:test";
import { SosoValueClient } from "../actions/get-news";

// 从环境变量加载配置
const API_KEY = process.env.SOSO_API_KEY;
const BASE_URL = process.env.SOSO_BASE_URL || "https://openapi.sosovalue.com";

describe("SoSoValue API 测试", () => {
  let client: SosoValueClient;

  beforeAll(() => {
    if (!API_KEY) {
      throw new Error("SOSO_API_KEY not found in environment variables");
    }
    client = new SosoValueClient(API_KEY, BASE_URL);
  });

  describe("SosoValueClient 基础功能", () => {
    it("应该能够正确初始化客户端", () => {
      expect(client).toBeDefined();
    });

    it("应该能够获取所有代币列表", async () => {
      const currencies = await client.getAllCurrencies();

      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(0);

      // 检查第一个代币的结构
      const firstCurrency = currencies[0];
      expect(firstCurrency).toHaveProperty("currencyId");
      expect(firstCurrency).toHaveProperty("fullName");
      expect(firstCurrency).toHaveProperty("currencyName");

      console.log(`✓ 获取到 ${currencies.length} 个代币`);
      console.log(`✓ 示例代币: ${firstCurrency.fullName} (${firstCurrency.currencyName})`);
    });
  });

  describe("代币搜索功能", () => {
    it("应该能够精确搜索 Bitcoin", async () => {
      const token = await client.searchCurrency("Bitcoin");

      expect(token).toBeDefined();
      expect(token?.fullName.toLowerCase()).toBe("bitcoin");
      expect(token?.currencyName.toLowerCase()).toBe("btc");

      console.log(`✓ 找到 Bitcoin: ${token?.fullName} (${token?.currencyName.toUpperCase()}) - ID: ${token?.currencyId}`);
    });

    it("应该能够通过符号 BTC 搜索", async () => {
      const token = await client.searchCurrency("BTC");

      expect(token).toBeDefined();
      expect(token?.currencyName.toLowerCase()).toBe("btc");

      console.log(`✓ 通过 BTC 找到: ${token?.fullName} (${token?.currencyName.toUpperCase()})`);
    });

    it("应该能够搜索 Ethereum", async () => {
      const token = await client.searchCurrency("ETH");

      expect(token).toBeDefined();
      expect(token?.currencyName.toLowerCase()).toBe("eth");
      expect(token?.fullName.toLowerCase()).toBe("ethereum");

      console.log(`✓ 找到 Ethereum: ${token?.fullName} (${token?.currencyName.toUpperCase()}) - ID: ${token?.currencyId}`);
    });

    it("应该能够搜索 Solana", async () => {
      const token = await client.searchCurrency("SOL");

      expect(token).toBeDefined();
      expect(token?.currencyName.toLowerCase()).toBe("sol");
      expect(token?.fullName.toLowerCase()).toBe("solana");

      console.log(`✓ 找到 Solana: ${token?.fullName} (${token?.currencyName.toUpperCase()}) - ID: ${token?.currencyId}`);
    });

    it("对于不存在的代币应该返回 null", async () => {
      const token = await client.searchCurrency("NONEXISTENTTOKEN123");

      expect(token).toBeNull();
      console.log("✓ 不存在的代币正确返回 null");
    });

    it("应该支持模糊搜索", async () => {
      const token = await client.searchCurrency("bit"); // 模糊搜索 "bitcoin"

      expect(token).toBeDefined();
      expect(token?.fullName.toLowerCase()).toContain("bit");

      console.log(`✓ 模糊搜索 'bit' 找到: ${token?.fullName}`);
    });
  });

  describe("新闻查询功能", () => {
    let bitcoinId: string;

    beforeAll(async () => {
      const bitcoin = await client.searchCurrency("Bitcoin");
      if (!bitcoin) {
        throw new Error("无法找到 Bitcoin 代币");
      }
      bitcoinId = bitcoin.currencyId;
    });

    it("应该能够获取 Bitcoin 的新闻", async () => {
      const news = await client.getCurrencyNews(bitcoinId, 1, 3);

      expect(Array.isArray(news)).toBe(true);

      if (news.length > 0) {
        const firstNews = news[0];
        expect(firstNews).toHaveProperty("id");
        expect(firstNews).toHaveProperty("sourceLink");
        expect(firstNews).toHaveProperty("releaseTime");
        expect(firstNews).toHaveProperty("multilanguageContent");
        expect(Array.isArray(firstNews.multilanguageContent)).toBe(true);

        console.log(`✓ 获取到 ${news.length} 条 Bitcoin 新闻`);
        console.log(`✓ 第一条新闻: ${firstNews.multilanguageContent[0]?.title}`);
      } else {
        console.log("⚠️ Bitcoin 暂无新闻数据");
      }
    });

    it("应该能够获取 Ethereum 的新闻", async () => {
      const ethereum = await client.searchCurrency("Ethereum");
      expect(ethereum).toBeDefined();

      const news = await client.getCurrencyNews(ethereum!.currencyId, 1, 2);
      expect(Array.isArray(news)).toBe(true);

      console.log(`✓ 获取到 ${news.length} 条 Ethereum 新闻`);
    });

    it("应该支持分页参数", async () => {
      const news = await client.getCurrencyNews(bitcoinId, 1, 2);

      expect(news.length).toBeLessThanOrEqual(2);
      console.log(`✓ 分页参数生效，返回 ${news.length} 条新闻`);
    });
  });

  describe("错误处理", () => {
    it("应该处理无效的代币ID", async () => {
      try {
        await client.getCurrencyNews("invalid_id_123", 1, 5);
        // 如果没有抛出错误，可能API返回了空结果
        console.log("⚠️ 无效ID没有抛出错误，可能返回空结果");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        console.log(`✓ 正确处理无效ID错误: ${error.message}`);
      }
    });
  });
});