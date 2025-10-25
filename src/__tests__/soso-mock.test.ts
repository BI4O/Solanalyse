import { describe, it, expect, mock } from "bun:test";
import { SosoValueClient, searchTokenIdAction, getTokenNewsAction } from "../actions/get-news";
import { createMockRuntime, createMockMessage, setupLoggerSpies } from "./test-utils";

// Mock fetch 函数来模拟 API 响应
const mockFetch = mock();

describe("SoSoValue 功能测试（使用 Mock 数据）", () => {
  let restoreLogger: () => void;
  let mockRuntime: any;

  // 在每个测试前设置
  const setupTest = () => {
    // 设置 logger spies
    restoreLogger = setupLoggerSpies();

    // Mock 全局 fetch
    global.fetch = mockFetch;

    // 创建配置了 SoSoValue API 的 mock runtime
    mockRuntime = createMockRuntime({
      getSetting: mock((key: string) => {
        switch (key) {
          case "SOSO_API_KEY":
            return "mock-api-key";
          case "SOSO_BASE_URL":
            return "https://mock-api.sosovalue.com";
          default:
            return null;
        }
      }),
    });
  };

  // 在每个测试后清理
  const cleanupTest = () => {
    restoreLogger?.();
    mockFetch.mockClear();
  };

  describe("SosoValueClient Mock 测试", () => {
    it("应该能够获取模拟的代币列表", async () => {
      setupTest();

      // 模拟成功的 API 响应
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: [
            {
              currencyId: "1673723677362319866",
              fullName: "Bitcoin",
              currencyName: "btc",
            },
            {
              currencyId: "1673723677362319867",
              fullName: "Ethereum",
              currencyName: "eth",
            },
          ],
        }),
      });

      const client = new SosoValueClient("mock-key");
      const currencies = await client.getAllCurrencies();

      expect(currencies).toHaveLength(2);
      expect(currencies[0].fullName).toBe("Bitcoin");
      expect(currencies[0].currencyName).toBe("btc");
      expect(currencies[0].currencyId).toBe("1673723677362319866");

      console.log("✅ Mock 代币列表测试通过");
      console.log(`  获取到 ${currencies.length} 个代币`);
    });

    it("应该能够搜索 Bitcoin", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: [
            {
              currencyId: "1673723677362319866",
              fullName: "Bitcoin",
              currencyName: "btc",
            },
          ],
        }),
      });

      const client = new SosoValueClient("mock-key");
      const result = await client.searchCurrency("Bitcoin");

      expect(result).toBeDefined();
      expect(result?.fullName).toBe("Bitcoin");
      expect(result?.currencyName).toBe("btc");
      expect(result?.currencyId).toBe("1673723677362319866");

      console.log("✅ Mock 搜索测试通过");
      console.log(`  找到: ${result?.fullName} (${result?.currencyName.toUpperCase()})`);
    });

    it("应该能够获取模拟新闻", async () => {
      // 先模拟搜索代币
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: [
            {
              currencyId: "1673723677362319866",
              fullName: "Bitcoin",
              currencyName: "btc",
            },
          ],
        }),
      });

      // 然后模拟获取新闻
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: {
            pageNum: "1",
            pageSize: "5",
            totalPages: "1",
            total: "2",
            list: [
              {
                id: "news1",
                sourceLink: "https://example.com/news1",
                releaseTime: Date.now(),
                author: "Test Author",
                category: 1,
                featureImage: "https://example.com/image.jpg",
                matchedCurrencies: [
                  {
                    id: "1673723677362319866",
                    fullName: "Bitcoin",
                    name: "btc",
                  },
                ],
                tags: ["Bitcoin", "Crypto"],
                multilanguageContent: [
                  {
                    language: "en",
                    title: "Bitcoin Price Surges",
                    content: "Bitcoin price has reached new heights...",
                  },
                ],
              },
            ],
          },
        }),
      });

      const client = new SosoValueClient("mock-key");
      const news = await client.getCurrencyNews("1673723677362319866", 1, 5);

      expect(news).toHaveLength(1);
      expect(news[0].multilanguageContent[0].title).toBe("Bitcoin Price Surges");

      console.log("✅ Mock 新闻查询测试通过");
      console.log(`  获取到 ${news.length} 条新闻`);
    });
  });

  describe("Actions Mock 测试", () => {
    it("SEARCH_TOKEN_ID Action 应该正常工作", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: [
            {
              currencyId: "1673723677362319866",
              fullName: "Bitcoin",
              currencyName: "btc",
            },
          ],
        }),
      });

      const message = createMockMessage("Bitcoin 的代币ID是多少？");
      const callback = mock();

      const result = await searchTokenIdAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(result.success).toBe(true);
      expect(result.text).toContain("Bitcoin");
      expect(result.text).toContain("BTC");
      expect(result.data?.tokenId).toBe("1673723677362319866");
      expect(result.data?.tokenName).toBe("btc");

      console.log("✅ SEARCH_TOKEN_ID Action 测试通过");
    });

    it("GET_TOKEN_NEWS Action 应该正常工作", async () => {
      // 模拟搜索代币
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: [
            {
              currencyId: "1673723677362319866",
              fullName: "Bitcoin",
              currencyName: "btc",
            },
          ],
        }),
      });

      // 模拟获取新闻
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: {
            pageNum: "1",
            pageSize: "5",
            totalPages: "1",
            total: "1",
            list: [
              {
                id: "news1",
                sourceLink: "https://example.com/news1",
                releaseTime: Date.now(),
                author: "Test Author",
                category: 1,
                featureImage: "https://example.com/image.jpg",
                matchedCurrencies: [
                  {
                    id: "1673723677362319866",
                    fullName: "Bitcoin",
                    name: "btc",
                  },
                ],
                tags: ["Bitcoin"],
                multilanguageContent: [
                  {
                    language: "en",
                    title: "Bitcoin News",
                    content: "Latest Bitcoin updates...",
                  },
                ],
              },
            ],
          },
        }),
      });

      const message = createMockMessage("Bitcoin 有什么新闻？");
      const callback = mock();

      const result = await getTokenNewsAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(result.success).toBe(true);
      expect(result.text).toContain("Bitcoin");
      expect(result.text).toContain("最新资讯");
      expect(result.data?.newsCount).toBe(1);

      console.log("✅ GET_TOKEN_NEWS Action 测试通过");
    });

    it("应该正确处理不存在的代币", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 0,
          msg: null,
          data: [], // 空列表
        }),
      });

      const message = createMockMessage("NONEXISTENT 代币信息");
      const callback = mock();

      const result = await searchTokenIdAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(result.success).toBe(false);
      expect(result.text).toContain("没有找到");

      console.log("✅ 错误处理测试通过");
    });
  });

  describe("API 错误处理", () => {
    it("应该正确处理 API 错误", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
      });

      const client = new SosoValueClient("mock-key");

      try {
        await client.getAllCurrencies();
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error.message).toContain("403 Forbidden");
        console.log("✅ API 错误处理测试通过");
      }
    });
  });
});