# Custom OpenAI Plugin for ElizaOS

This is a custom OpenAI plugin for ElizaOS that fixes the 404 error issue with the official plugin. The official `@elizaos/plugin-openai` was calling a non-existent `/v1/responses` endpoint, which caused 404 errors. This custom plugin directly calls the standard `/v1/chat/completions` endpoint.

## Features

- ✅ Fixes 404 errors with OpenAI API calls
- ✅ Direct integration with `/v1/chat/completions` endpoint
- ✅ Supports all major OpenAI-compatible APIs (OpenAI, iFlow, etc.)
- ✅ Full compatibility with ElizaOS framework
- ✅ Git-friendly - all code is tracked and versioned

## Installation

The custom plugin is automatically loaded when you have `OPENAI_API_KEY` set in your environment variables.

## Configuration

Set the following environment variables in your `.env` file:

```bash
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://apis.iflow.cn/v1  # or your OpenAI-compatible API endpoint
OPENAI_SMALL_MODEL=qwen3-coder-plus
OPENAI_LARGE_MODEL=qwen3-coder-plus
```

## Supported Models

- `TEXT_SMALL` - For smaller, faster responses
- `TEXT_LARGE` - For more complex, detailed responses
- `OBJECT_SMALL` - For JSON object generation (small)
- `OBJECT_LARGE` - For JSON object generation (large)
- `TEXT_EMBEDDING` - For text embeddings

## How It Works

This plugin replaces the official `@elizaos/plugin-openai` with a custom implementation that:

1. Directly calls the `/v1/chat/completions` endpoint instead of `/v1/responses`
2. Properly formats requests for OpenAI-compatible APIs
3. Handles errors and usage tracking correctly
4. Maintains full compatibility with the ElizaOS plugin system

## Benefits Over Official Plugin

- 🚀 Eliminates 404 errors
- ⚡ Improved performance by avoiding unnecessary retries
- 🛡️ Better error handling
- 📦 Git-friendly - all changes are tracked
- 🔧 Easier to customize and extend

## File Structure

```
src/
└── plugins/
    └── custom-openai.ts  # Custom OpenAI plugin implementation
```

## Usage

The plugin is automatically loaded by ElizaOS when the appropriate environment variables are set. No additional configuration is needed.

## Contributing

Feel free to modify and extend this plugin as needed for your specific use case. Since it's part of your project repository, all changes will be tracked by Git.