import { describe, it, expect, beforeAll, afterAll, mock } from "bun:test";
import { searchTokenIdAction, getTokenNewsAction } from "../actions/get-news";
import { createMockRuntime, createMockMessage, setupLoggerSpies } from "./test-utils";

// 从环境变量加载配置
const API_KEY = process.env.SOSO_API_KEY;
const BASE_URL = process.env.SOSO_BASE_URL || "https://openapi.sosovalue.com";

describe("SoSoValue Actions 测试", () => {
  let mockRuntime: any;
  let restoreLogger: () => void;

  beforeAll(() => {
    if (!API_KEY) {
      throw new Error("SOSO_API_KEY not found in environment variables");
    }

    // 设置 logger spies
    restoreLogger = setupLoggerSpies();

    // 创建配置了 SoSoValue API 的 mock runtime
    mockRuntime = createMockRuntime({
      getSetting: mock((key: string) => {
        switch (key) {
          case "SOSO_API_KEY":
            return API_KEY;
          case "SOSO_BASE_URL":
            return BASE_URL;
          default:
            return null;
        }
      }),
    });
  });

  afterAll(() => {
    restoreLogger?.();
  });

  describe("SEARCH_TOKEN_ID Action", () => {
    it("应该正确验证 Bitcoin 查询", async () => {
      const message = createMockMessage("Bitcoin 的代币ID是多少？");
      const isValid = await searchTokenIdAction.validate(mockRuntime, message, undefined);

      expect(isValid).toBe(true);
    });

    it("应该正确验证 SOL 查询", async () => {
      const message = createMockMessage("查一下 SOL 的信息");
      const isValid = await searchTokenIdAction.validate(mockRuntime, message, undefined);

      expect(isValid).toBe(true);
    });

    it("应该能够搜索 Bitcoin", async () => {
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
      expect(result.text).toContain("ID:");
      expect(result.data?.tokenId).toBeDefined();
      expect(result.data?.tokenName).toBe("btc");
      expect(result.data?.fullName).toBe("Bitcoin");

      console.log("✓ SEARCH_TOKEN_ID Bitcoin 测试通过");
      console.log(`  响应: ${result.text}`);
    });

    it("应该能够搜索 Solana", async () => {
      const message = createMockMessage("查一下 SOL 的信息");
      const callback = mock();

      const result = await searchTokenIdAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(result.success).toBe(true);
      expect(result.text).toContain("Solana");
      expect(result.text).toContain("SOL");
      expect(result.data?.tokenName).toBe("sol");
      expect(result.data?.fullName).toBe("Solana");

      console.log("✓ SEARCH_TOKEN_ID Solana 测试通过");
      console.log(`  响应: ${result.text}`);
    });

    it("应该处理不存在的代币", async () => {
      const message = createMockMessage("查一下 NONEXISTENT123 的信息");
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
      expect(result.text).toContain("NONEXISTENT123");

      console.log("✓ SEARCH_TOKEN_ID 不存在代币测试通过");
      console.log(`  响应: ${result.text}`);
    });

    it("应该调用回调函数", async () => {
      const message = createMockMessage("ETH 的代币ID");
      const callback = mock();

      await searchTokenIdAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(callback).toHaveBeenCalledWith({
        text: expect.stringContaining("Ethereum"),
        actions: ["SEARCH_TOKEN_ID"],
        source: message.content.source,
      });

      console.log("✓ SEARCH_TOKEN_ID 回调函数测试通过");
    });
  });

  describe("GET_TOKEN_NEWS Action", () => {
    it("应该正确验证 Bitcoin 新闻查询", async () => {
      const message = createMockMessage("Bitcoin 有什么最新新闻？");
      const isValid = await getTokenNewsAction.validate(mockRuntime, message, undefined);

      expect(isValid).toBe(true);
    });

    it("应该正确验证 SOL 动态查询", async () => {
      const message = createMockMessage("SOL 最近怎么样？");
      const isValid = await getTokenNewsAction.validate(mockRuntime, message, undefined);

      expect(isValid).toBe(true);
    });

    it("应该能够获取 Bitcoin 新闻", async () => {
      const message = createMockMessage("Bitcoin 有什么最新新闻？");
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
      expect(result.data?.tokenId).toBeDefined();
      expect(result.data?.tokenName).toBe("btc");
      expect(result.data?.fullName).toBe("Bitcoin");
      expect(Array.isArray(result.data?.news)).toBe(true);

      console.log("✓ GET_TOKEN_NEWS Bitcoin 测试通过");
      console.log(`  响应长度: ${result.text.length} 字符`);
      console.log(`  新闻数量: ${result.data?.newsCount || 0}`);
    });

    it("应该能够获取 Ethereum 新闻", async () => {
      const message = createMockMessage("ETH 最近怎么样？");
      const callback = mock();

      const result = await getTokenNewsAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(result.success).toBe(true);
      expect(result.text).toContain("Ethereum");
      expect(result.data?.tokenName).toBe("eth");
      expect(result.data?.fullName).toBe("Ethereum");

      console.log("✓ GET_TOKEN_NEWS Ethereum 测试通过");
      console.log(`  新闻数量: ${result.data?.newsCount || 0}`);
    });

    it("应该处理不存在的代币新闻查询", async () => {
      const message = createMockMessage("NONEXISTENT456 有什么新闻？");
      const callback = mock();

      const result = await getTokenNewsAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(result.success).toBe(false);
      expect(result.text).toContain("没有找到");
      expect(result.text).toContain("NONEXISTENT456");

      console.log("✓ GET_TOKEN_NEWS 不存在代币测试通过");
    });

    it("应该调用回调函数", async () => {
      const message = createMockMessage("SOL 有什么新闻？");
      const callback = mock();

      await getTokenNewsAction.handler(
        mockRuntime,
        message,
        undefined,
        {},
        callback
      );

      expect(callback).toHaveBeenCalledWith({
        text: expect.stringContaining("Solana"),
        actions: ["GET_TOKEN_NEWS"],
        source: message.content.source,
      });

      console.log("✓ GET_TOKEN_NEWS 回调函数测试通过");
    });
  });

  describe("Action 验证逻辑", () => {
    it("SEARCH_TOKEN_ID 应该拒绝没有 API 密钥的情况", async () => {
      const noKeyRuntime = createMockRuntime({
        getSetting: mock(() => null),
      });

      const message = createMockMessage("Bitcoin ID");
      const isValid = await searchTokenIdAction.validate(noKeyRuntime, message, undefined);

      expect(isValid).toBe(false);
      console.log("✓ SEARCH_TOKEN_ID 正确拒绝无 API 密钥情况");
    });

    it("GET_TOKEN_NEWS 应该拒绝没有 API 密钥的情况", async () => {
      const noKeyRuntime = createMockRuntime({
        getSetting: mock(() => null),
      });

      const message = createMockMessage("Bitcoin news");
      const isValid = await getTokenNewsAction.validate(noKeyRuntime, message, undefined);

      expect(isValid).toBe(false);
      console.log("✓ GET_TOKEN_NEWS 正确拒绝无 API 密钥情况");
    });

    it("应该正确识别新闻查询意图", async () => {
      const testCases = [
        "Bitcoin 最新新闻",
        "ETH 有什么消息",
        "SOL 动态如何",
        "BTC update",
        "Ethereum latest",
      ];

      for (const testCase of testCases) {
        const message = createMockMessage(testCase);
        const isValid = await getTokenNewsAction.validate(mockRuntime, message, undefined);
        expect(isValid).toBe(true);
      }

      console.log("✓ GET_TOKEN_NEWS 正确识别各种新闻查询意图");
    });
  });
});