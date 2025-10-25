import { describe, it, expect, mock } from "bun:test";
import { SosoValueClient, searchTokenIdAction, getTokenNewsAction } from "../actions/get-news";
import { createMockRuntime, createMockMessage } from "./test-utils";

// Mock fetch 函数
const mockFetch = mock();

// 设置 global fetch
global.fetch = mockFetch;

describe("SoSoValue Mock 功能测试", () => {
  it("SosoValueClient 应该能够获取代币列表", async () => {
    // 模拟 API 响应
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
    const currencies = await client.getAllCurrencies();

    expect(currencies).toHaveLength(1);
    expect(currencies[0].fullName).toBe("Bitcoin");
    expect(currencies[0].currencyName).toBe("btc");
    expect(currencies[0].currencyId).toBe("1673723677362319866");

    console.log("✅ 代币列表测试通过");
  });

  it("应该能够搜索代币", async () => {
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

    console.log("✅ 代币搜索测试通过");
  });

  it("应该能够获取新闻", async () => {
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
                  content: "Latest updates...",
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
    expect(news[0].multilanguageContent[0].title).toBe("Bitcoin News");

    console.log("✅ 新闻查询测试通过");
  });

  it("SEARCH_TOKEN_ID Action 应该正常工作", async () => {
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

    const mockRuntime = createMockRuntime({
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
                  content: "Latest updates...",
                },
              ],
            },
          ],
        },
      }),
    });

    const mockRuntime = createMockRuntime({
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
    // 重新设置 mock
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        code: 0,
        msg: null,
        data: [], // 空列表
      }),
    });

    const mockRuntime = createMockRuntime({
      getSetting: mock((key: string) => {
        switch (key) {
          case "SOSO_API_KEY":
            return "mock-api-key";
          default:
            return null;
        }
      }),
    });

    // 使用一个简单的代币名称，确保被正确识别
    const message = createMockMessage("FAKECOIN 代币信息");
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

  // 清理 mock
  // 注意：Bun 测试框架可能不支持 afterEach，在每个测试末尾手动清理
  mockFetch.mockClear();
});