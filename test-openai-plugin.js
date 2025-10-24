/**
 * OpenAI Plugin 改造测试文件
 *
 * 这个文件包含了测试 iFlow API 兼容性和改造后的 OpenAI 插件的各种测试
 * 使用方法：node test-openai-plugin.js
 */

// 测试配置
const CONFIG = {
  API_KEY: "sk-989ec1d533419b87f484a9eb13166203",
  BASE_URL: "https://apis.iflow.cn/v1",
  MODEL: "qwen3-coder-plus",  // 更新为实际使用的模型
  SMALL_MODEL: "qwen3-coder-plus",
  LARGE_MODEL: "qwen3-coder-plus"
};

/**
 * 测试 1: 直接 fetch 调用 iFlow API
 * 验证 iFlow API 的基本兼容性
 */
async function testDirectFetch() {
  console.log("\n=== 测试 1: 直接 fetch 调用 iFlow API ===");

  try {
    console.log("测试直接 fetch 到 /v1/chat/completions...");

    const response = await fetch(`${CONFIG.BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        messages: [
          { role: "user", content: "你好，请简单介绍一下自己" }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log("响应状态:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("错误响应:", errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ 直接 fetch 测试成功！");

    if (data.choices && data.choices[0]) {
      console.log("生成文本:", data.choices[0].message.content);
    }

    if (data.usage) {
      console.log("Token 使用:", data.usage);
    }

  } catch (error) {
    console.error("❌ 直接 fetch 测试失败:", error.message);
  }
}

/**
 * 测试 2: @ai-sdk/openai 兼容性测试
 * 验证原始的 @ai-sdk/openai 库是否能正常工作
 */
async function testAISDK() {
  console.log("\n=== 测试 2: @ai-sdk/openai 兼容性测试 ===");

  try {
    const { createOpenAI } = await import("@ai-sdk/openai");

    const client = createOpenAI({
      apiKey: CONFIG.API_KEY,
      baseURL: CONFIG.BASE_URL
    });

    const model = client.languageModel(CONFIG.MODEL);

    console.log("测试 @ai-sdk/openai 文本生成...");

    const response = await model.doGenerate({
      inputFormat: "prompt",
      prompt: "什么是人工智能？"
    });

    console.log("✅ @ai-sdk/openai 测试成功！");
    console.log("生成文本:", response.text);

    if (response.usage) {
      console.log("Token 使用:", response.usage);
    }

  } catch (error) {
    console.error("❌ @ai-sdk/openai 测试失败:", error.message);
    console.log("这可能是由于 /v1/responses 端点不存在导致的");
  }
}

/**
 * 测试 3: 改造后的插件测试
 * 测试修改后的 ElizaOS OpenAI 插件
 */
async function testModifiedPlugin() {
  console.log("\n=== 测试 3: 改造后的插件测试 ===");

  try {
    const { fileURLToPath } = await import('url');
    const { dirname, join } = await import('path');
    const { createRequire } = await import('module');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);

    // 测试 ESM 版本
    const esmPluginPath = join(__dirname, 'node_modules/@elizaos/plugin-openai/dist/node/index.node.js');
    const openaiPlugin = require(esmPluginPath).default;

    console.log("插件名称:", openaiPlugin.name);
    console.log("可用模型:", Object.keys(openaiPlugin.models));

    // 模拟 runtime 对象
    const mockRuntime = {
      getSetting: (key) => {
        const settings = {
          OPENAI_API_KEY: CONFIG.API_KEY,
          OPENAI_BASE_URL: CONFIG.BASE_URL,
          OPENAI_SMALL_MODEL: CONFIG.SMALL_MODEL,
          OPENAI_LARGE_MODEL: CONFIG.LARGE_MODEL
        };
        return settings[key];
      },
      character: {
        system: "You are a helpful AI assistant."
      },
      emitEvent: (event, data) => {
        console.log(`事件触发: ${event}`, data ? "✅" : "");
      }
    };

    // 测试初始化
    if (openaiPlugin.init) {
      openaiPlugin.init({}, mockRuntime);
      console.log("✅ 插件初始化成功");
    }

    // 测试 TEXT_SMALL 模型
    if (openaiPlugin.models.TEXT_SMALL) {
      console.log("\n测试 TEXT_SMALL 模型...");
      const result = await openaiPlugin.models.TEXT_SMALL(mockRuntime, {
        prompt: "简单解释一下什么是区块链",
        maxTokens: 100,
        temperature: 0.7
      });
      console.log("✅ TEXT_SMALL 结果:", result);
    }

    // 测试 TEXT_LARGE 模型
    if (openaiPlugin.models.TEXT_LARGE) {
      console.log("\n测试 TEXT_LARGE 模型...");
      const result = await openaiPlugin.models.TEXT_LARGE(mockRuntime, {
        prompt: "详细解释量子计算的原理",
        maxTokens: 150,
        temperature: 0.7
      });
      console.log("✅ TEXT_LARGE 结果:", result);
    }

  } catch (error) {
    console.error("❌ 插件测试失败:", error.message);
  }
}

/**
 * 主测试函数
 */
async function runAllTests() {
  console.log("🚀 开始 OpenAI Plugin 改造测试");
  console.log("=====================================");

  await testDirectFetch();
  await testAISDK();
  await testModifiedPlugin();

  console.log("\n=====================================");
  console.log("🎉 所有测试完成！");
  console.log("\n📝 测试说明:");
  console.log("1. 如果直接 fetch 成功但 @ai-sdk/openai 失败，说明需要改造插件");
  console.log("2. 如果改造后的插件测试成功，说明改造完成");
  console.log("3. 建议在改造插件后运行此测试验证功能");
}

// 运行测试
runAllTests().catch(console.error);