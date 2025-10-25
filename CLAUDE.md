# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Solanalyse** - an ElizaOS-based AI agent project specialized in Solana blockchain data analysis. The project uses **bun** as the package manager and implements a multi-agent architecture with custom plugins for blockchain data queries and news aggregation.

## Essential Commands

```bash
# Development
bun run dev              # Start development server with hot-reloading
bun run start            # Start production server
bun run build            # Build project (TypeScript + bundling)

# Testing
bun run test             # Run all tests (component + e2e)
bun run test:component   # Run component tests only
bun run test:e2e         # Run e2e tests only
bun run test:coverage    # Run tests with coverage

# Code Quality
bun run lint             # Format code with Prettier
bun run type-check       # Check TypeScript types
bun run check-all        # Run all checks (types + format + tests)

# ElizaOS CLI Commands (alternative to bun scripts)
elizaos dev              # Start with hot-reloading
elizaos start            # Start production server
elizaos test             # Run all tests
elizaos test component   # Run component tests only
elizaos test e2e         # Run e2e tests only
```

## Architecture & Key Files

### Multi-Agent System
```
src/
├── index.ts              # Main entry point - exports multiple agents
├── character.ts          # Default "Eliza" character
├── characters/
│   └── SolanaData.ts     # Solana blockchain data specialist agent
├── plugins/
│   └── custom-openai.ts  # Custom OpenAI plugin with 404 error fixes
├── plugin.ts             # Default starter plugin
├── frontend/             # React-based web UI (Vite + TailwindCSS)
└── __tests__/            # Test suites (component + e2e)
```

### Key Architectural Patterns

**1. Multi-Agent Architecture** (`src/index.ts`)
- **projectAgent**: Default "Eliza" character with general capabilities
- **solanaDataAgent**: Specialized Solana blockchain data expert
- Both agents share the same plugin ecosystem but have different personalities

**2. SolanaData Character** (`src/characters/SolanaData.ts`)
- Chinese-speaking Solana blockchain specialist
- Handles token information queries, address validation, transaction history
- Validates Solana address formats (32-44 chars, specific character sets)
- Provides security analysis and risk warnings
- Topics include: token data, holder analysis, PDA explanations, rent/fees

**3. Custom OpenAI Plugin** (`src/plugins/custom-openai.ts`)
- **Purpose**: Fixes 404 errors from official @elizaos/plugin-openai
- **Features**: Custom base URL support, flexible model configuration
- **Models**: TEXT_SMALL, TEXT_LARGE, OBJECT_SMALL, OBJECT_LARGE, TEXT_EMBEDDING
- **Fallback**: Returns mock embeddings when embedding models unavailable
- **Configuration**: Supports custom OpenAI-compatible APIs (like iFlow)

**4. Environment-Driven Plugin Loading**
- Core plugins: @elizaos/plugin-sql always loaded
- Platform plugins: Discord, Twitter, Telegram (conditional on env vars)
- Model plugins: Uses custom OpenAI plugin instead of official one
- Bootstrap plugin: Can be disabled with IGNORE_BOOTSTRAP env var

### Build System

The project uses a **custom build script** (`build.ts`) that:
- Bundles JavaScript with Bun's native build API in parallel with TypeScript declarations
- Marks ElizaOS core packages as external dependencies
- Handles TypeScript declaration failures gracefully (continues build)
- Outputs to `dist/` directory with source maps and proper naming structure

### Frontend (Optional)

React-based web UI in `src/frontend/`:
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom theme
- **State**: TanStack React Query
- **Development**: Port 5173 with API proxy to localhost:3000

## Environment Configuration

Key environment variables:
```bash
# Required: OpenAI-compatible API configuration
OPENAI_API_KEY=sk-your-key-here
OPENAI_BASE_URL=https://apis.iflow.cn/v1  # Custom API endpoint
OPENAI_SMALL_MODEL=qwen3-coder-plus        # Custom model names
OPENAI_LARGE_MODEL=qwen3-coder-plus
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Optional: Platform integrations
DISCORD_API_TOKEN=your-discord-token
TWITTER_API_KEY=your-twitter-key
TELEGRAM_BOT_TOKEN=your-telegram-token

# ElizaOS System
PGLITE_DATA_DIR=./data/.eliza/
SERVER_HOST=localhost
SERVER_PORT=3000
IGNORE_BOOTSTRAP=  # Set to disable bootstrap plugin
```

## Development Workflow

1. **Quick Start**: `bun run dev` - starts agents with hot-reloading
2. **Agent Selection**: Agents are available via the web UI at localhost:3000
3. **Character Customization**: Modify `src/characters/SolanaData.ts` for blockchain expert behavior
4. **Plugin Development**: Extend existing plugins or create new ones following ElizaOS patterns
5. **Testing**: Write tests in `src/__tests__/` and export from `src/index.ts`
6. **API Integration**: Configure custom OpenAI-compatible endpoints in environment

## Important Notes

- **Package Manager**: Always use `bun` (not npm or pnpm)
- **Custom OpenAI Plugin**: This project uses a custom OpenAI plugin to fix 404 errors - do not replace with official plugin
- **Multi-Agent**: Both agents share plugins but maintain separate personalities and capabilities
- **Chinese Language**: SolanaData agent primarily speaks Chinese and handles Chinese blockchain terminology
- **Solana Specialization**: The system is optimized for Solana blockchain queries and data analysis
- **Database**: Uses PGLite (PostgreSQL-compatible) for data persistence
- **Hot Reloading**: Available in dev mode for rapid iteration
- 到了要验证阶段，不要帮我启动elizaos dev，提醒我自己去启动来验证就可以
- 当我说"记下这个bug"的时候，请你帮我去bugs文件夹下新建一个md文件，记录下我们改的这个bug的细节，提醒我们以后不要再犯