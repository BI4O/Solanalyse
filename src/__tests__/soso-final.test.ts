import { describe, it, expect, mock } from "bun:test";
import { SosoValueClient, searchTokenIdAction } from "../actions/get-news";
import { createMockRuntime, createMockMessage } from "./test-utils";

describe("SoSoValue 最终测试", () => {
  it("核心功能应该正常工作", async () => {
    // 为每个测试重新设置 mock
    const mockFetch = mock();
    global.fetch = mockFetch;

    // 模拟空结果（代币不存在）
    mockFetch.mockReturnValueOnce(Promise.resolve({
      ok: true,
      json: async () => ({
        code: 0,
        msg: null,
        data: [], // 空列表
      }),
    }));

    const mockRuntime = createMockRuntime({
      getSetting: mock((key: string) => "mock-api-key"),
    });

    const message = createMockMessage("FAKECOIN 信息");
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

    console.log("✅ 所有核心功能测试通过");
  });
});