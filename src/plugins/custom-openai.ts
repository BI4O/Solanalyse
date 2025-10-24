import {
  Plugin,
  ModelType,
  logger,
  EventType
} from '@elizaos/core';

// 获取环境变量或默认值
function getSetting(runtime: any, key: string, defaultValue?: string): string | undefined {
  const value = runtime.getSetting(key) ?? process.env[key] ?? defaultValue;
  return value ? String(value) : undefined;
}

// 获取基础URL
function getBaseURL(runtime: any): string {
  const baseURL = getSetting(runtime, "OPENAI_BASE_URL", "https://api.openai.com/v1");
  logger.debug(`[CustomOpenAI] Using base URL: ${baseURL}`);
  return baseURL;
}

// 获取API密钥
function getApiKey(runtime: any): string | undefined {
  return getSetting(runtime, "OPENAI_API_KEY");
}

// 获取小模型名称
function getSmallModel(runtime: any): string {
  return getSetting(runtime, "OPENAI_SMALL_MODEL") ?? getSetting(runtime, "SMALL_MODEL", "gpt-5-nano") ?? "gpt-5-nano";
}

// 获取大模型名称
function getLargeModel(runtime: any): string {
  return getSetting(runtime, "OPENAI_LARGE_MODEL") ?? getSetting(runtime, "LARGE_MODEL", "gpt-5-mini") ?? "gpt-5-mini";
}

// 发送使用事件
function emitModelUsageEvent(runtime: any, type: typeof ModelType[keyof typeof ModelType], prompt: string, usage: any) {
  runtime.emitEvent(EventType.MODEL_USED, {
    provider: "openai",
    type,
    prompt,
    tokens: {
      prompt: usage.prompt_tokens,
      completion: usage.completion_tokens,
      total: usage.total_tokens
    }
  });
}

// 生成对象的通用函数
async function generateObjectByModelType(
  runtime: any,
  params: any,
  modelType: typeof ModelType[keyof typeof ModelType],
  getModelFn: (runtime: any) => string
) {
  const modelName = getModelFn(runtime);
  const baseURL = getBaseURL(runtime);
  const apiKey = getApiKey(runtime);

  logger.log(`[CustomOpenAI] Using ${modelType} model: ${modelName}`);

  const temperature = params.temperature ?? 0;

  try {
    const response = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: params.prompt }],
        temperature,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const object = JSON.parse(data.choices[0].message.content);
    const usage = data.usage;

    if (usage) {
      emitModelUsageEvent(runtime, modelType, params.prompt, usage);
    }

    return object;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`[CustomOpenAI] Error in generateObjectByModelType: ${message}`);
    throw error;
  }
}

// 自定义 OpenAI 插件实现
const customOpenAIPlugin: Plugin = {
  name: "custom-openai",
  description: "Custom OpenAI plugin with fixed API endpoints",
  config: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_SMALL_MODEL: process.env.OPENAI_SMALL_MODEL,
    OPENAI_LARGE_MODEL: process.env.OPENAI_LARGE_MODEL,
    SMALL_MODEL: process.env.SMALL_MODEL,
    LARGE_MODEL: process.env.LARGE_MODEL,
  },
  async init(_config, runtime) {
    logger.log("Custom OpenAI plugin initialized");

    // 验证API密钥
    try {
      const apiKey = getApiKey(runtime);
      if (!apiKey) {
        logger.warn("OPENAI_API_KEY is not set - OpenAI functionality will be limited");
        return;
      }

      const baseURL = getBaseURL(runtime);
      const response = await fetch(`${baseURL}/models`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        logger.warn(`OpenAI API key validation failed: ${response.statusText}`);
        logger.warn("OpenAI functionality will be limited until a valid API key is provided");
      } else {
        logger.log("OpenAI API key validated successfully");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn(`Error validating OpenAI API key: ${message}`);
      logger.warn("OpenAI functionality will be limited until a valid API key is provided");
    }
  },
  models: {
    // 小文本模型
    [ModelType.TEXT_SMALL]: async (runtime, params) => {
      const modelName = getSmallModel(runtime);
      const baseURL = getBaseURL(runtime);
      const apiKey = getApiKey(runtime);

      logger.log(`[CustomOpenAI] Using TEXT_SMALL model: ${modelName}`);

      const {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7
      } = params;

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            ...(runtime.character?.system ? [{ role: "system", content: runtime.character.system }] : []),
            { role: "user", content: prompt }
          ],
          temperature,
          max_tokens: maxTokens,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          stop: stopSequences.length > 0 ? stopSequences : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const openaiResponse = data.choices[0]?.message?.content || "";
      const usage = data.usage;

      if (usage) {
        emitModelUsageEvent(runtime, ModelType.TEXT_SMALL, prompt, usage);
      }

      return openaiResponse;
    },

    // 大文本模型
    [ModelType.TEXT_LARGE]: async (runtime, params) => {
      const modelName = getLargeModel(runtime);
      const baseURL = getBaseURL(runtime);
      const apiKey = getApiKey(runtime);

      logger.log(`[CustomOpenAI] Using TEXT_LARGE model: ${modelName}`);

      const {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7
      } = params;

      const response = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            ...(runtime.character?.system ? [{ role: "system", content: runtime.character.system }] : []),
            { role: "user", content: prompt }
          ],
          temperature,
          max_tokens: maxTokens,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
          stop: stopSequences.length > 0 ? stopSequences : undefined
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const openaiResponse = data.choices[0]?.message?.content || "";
      const usage = data.usage;

      if (usage) {
        emitModelUsageEvent(runtime, ModelType.TEXT_LARGE, prompt, usage);
      }

      return openaiResponse;
    },

    // 小对象模型
    [ModelType.OBJECT_SMALL]: async (runtime, params) => {
      return generateObjectByModelType(runtime, params, ModelType.OBJECT_SMALL, getSmallModel);
    },

    // 大对象模型
    [ModelType.OBJECT_LARGE]: async (runtime, params) => {
      return generateObjectByModelType(runtime, params, ModelType.OBJECT_LARGE, getLargeModel);
    },

    // 嵌入模型
    [ModelType.TEXT_EMBEDDING]: async (runtime, params) => {
      const embeddingModelName = getSetting(runtime, "OPENAI_EMBEDDING_MODEL", "text-embedding-3-small") ?? "text-embedding-3-small";
      const baseURL = getBaseURL(runtime);
      const apiKey = getApiKey(runtime);

      let text: string;
      if (params == null) {
        // 当参数为 null 或 undefined 时，提供默认值
        text = "default text for embedding initialization";
      } else if (typeof params === "string") {
        text = params;
      } else if (typeof params === "object" && params.text) {
        text = params.text;
      } else {
        // 如果没有找到有效的文本，使用默认值
        text = "default text";
      }

      try {
        const response = await fetch(`${baseURL}/embeddings`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: embeddingModelName,
            input: text
          })
        });

        if (!response.ok) {
          // 如果嵌入模型不可用，返回一个模拟的嵌入向量
          logger.warn(`[CustomOpenAI] Embedding model not available, returning mock embedding: ${response.status} - ${response.statusText}`);
          // 返回一个1536维的零向量（OpenAI Ada模型的标准维度）
          return new Array(1536).fill(0);
        }

        const data = await response.json();
        const embedding = data.data[0].embedding;
        const usage = data.usage;

        if (usage) {
          emitModelUsageEvent(runtime, ModelType.TEXT_EMBEDDING, text, usage);
        }

        return embedding;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[CustomOpenAI] Error in TEXT_EMBEDDING: ${message}`);
        // 如果出现错误，返回一个模拟的嵌入向量
        logger.warn(`[CustomOpenAI] Returning mock embedding due to error`);
        return new Array(1536).fill(0);
      }
    }
  },
  tests: [
    {
      name: "custom_openai_plugin_tests",
      tests: [
        {
          name: "custom_openai_test_text_small",
          fn: async (runtime) => {
            try {
              const text = await runtime.useModel(ModelType.TEXT_SMALL, {
                prompt: "What is the nature of reality in 10 words?"
              });
              if (text.length === 0) {
                throw new Error("Failed to generate text");
              }
              logger.log({ text }, "generated with custom_openai_test_text_small");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              logger.error(`Error in custom_openai_test_text_small: ${message}`);
              throw error;
            }
          }
        }
      ]
    }
  ]
};

export default customOpenAIPlugin;