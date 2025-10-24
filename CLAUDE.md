# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **ElizaOS Agent Project Starter** - a template for building AI agents using the ElizaOS framework. The project uses **bun** as the package manager and follows a character-driven agent architecture with plugin composition.

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

# Frontend Development (if working on UI)
cd src/frontend && bun run dev  # Start frontend dev server on port 5173
```

## Architecture & Key Files

### Core Structure
```
src/
├── index.ts              # Main entry point - exports character and tests
├── character.ts          # Agent personality & dynamic plugin loading
├── plugin.ts             # Custom plugin with actions/services/providers
├── frontend/             # React-based web UI (Vite + TailwindCSS)
└── __tests__/            # Test suites (component + e2e)
```

### Key Architectural Patterns

**1. Dynamic Plugin Loading** (`src/character.ts`)
- Plugins are loaded based on environment variables
- Supported providers: OpenAI, Anthropic, Ollama, Google GenAI
- Platform integrations: Discord, Twitter, Telegram (conditional)
- Character name: "Eliza" with helpful, empathetic personality

**2. Custom Plugin System** (`src/plugin.ts`)
- **HelloWorldAction**: Basic greeting functionality
- **StarterService**: Lifecycle management with health monitoring
- **Custom Routes**: `/helloworld` endpoint
- **Model Providers**: Fallback text generation (rickroll responses)
- **Configuration**: Zod-based validation schema

**3. Testing Architecture**
- **Component Tests**: Fast, isolated tests using Bun's native test runner
- **E2E Tests**: Real runtime testing with database integration
- Tests must be exported from `src/index.ts` to be discovered

### Build System

The project uses a **custom build script** (`build.ts`) that:
- Bundles JavaScript with Bun's native build API
- Generates TypeScript declarations in parallel
- Marks ElizaOS core packages as external dependencies
- Outputs to `dist/` directory with source maps

### Frontend (Optional)

React-based web UI in `src/frontend/`:
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom theme
- **State**: TanStack React Query
- **Development**: Port 5173 with API proxy to localhost:3000

## Environment Configuration

Create `.env` file from `.env.example`:
```bash
# Required: At least one model provider
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
GROQ_API_KEY=your-groq-key-here

# Optional: Platform integrations
DISCORD_API_TOKEN=your-discord-token
TWITTER_USERNAME=your-twitter-username
TELEGRAM_BOT_TOKEN=your-telegram-token

# System
LOG_LEVEL=info
database_dir=./data/.eliza/
```

## Development Workflow

1. **Quick Start**: `bun run dev` - starts agent with hot-reloading
2. **Character Changes**: Modify `src/character.ts` for personality updates
3. **Custom Functionality**: Extend `src/plugin.ts` for new actions/services
4. **Testing**: Write tests in `src/__tests__/` and export from `src/index.ts`
5. **Frontend Work**: Use `cd src/frontend && bun run dev` for UI development

## Important Notes

- **Package Manager**: Always use `bun` (not npm or pnpm)
- **TypeScript**: Strict mode enabled with modern ESNext target
- **Testing**: Dual strategy - fast component tests + comprehensive e2e tests
- **Plugin Loading**: Environment variables control which plugins load
- **Database**: Uses PGLite (PostgreSQL-compatible) for data persistence
- **Hot Reloading**: Available in dev mode for rapid iteration