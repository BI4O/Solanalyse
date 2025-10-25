# Solanalyse

**Solanalyse** is an advanced ElizaOS-based AI agent system specialized in Solana blockchain data analysis and news aggregation. This multi-agent platform combines Chinese-language blockchain expertise with robust API integration for comprehensive Solana ecosystem analysis.

## ✨ Key Features

- 🤖 **Multi-Agent Architecture**: Dual agent system with general and specialized Solana experts
- 🔗 **Custom API Integration**: Fixed OpenAI plugin with 404 error resolution and custom endpoint support
- 🇨🇳 **Chinese Language Support**: Native Chinese Solana blockchain data specialist
- 📊 **Real-time Blockchain Analysis**: Token information, address validation, transaction history
- 🛡️ **Security Analysis**: Token safety checks, holder distribution, risk assessments
- 📰 **News Aggregation**: Blockchain and cryptocurrency news filtering and analysis
- 🔧 **Flexible Configuration**: Environment-driven plugin loading and API customization

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/BI4O/Solanalyse.git
cd Solanalyse

# Install dependencies
bun install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development server
bun run dev
```

### Required Environment Variables

```bash
# OpenAI-compatible API configuration
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://apis.iflow.cn/v1
OPENAI_SMALL_MODEL=qwen3-coder-plus
OPENAI_LARGE_MODEL=qwen3-coder-plus

# Database and server
PGLITE_DATA_DIR=./data/.eliza/
SERVER_HOST=localhost
SERVER_PORT=3000
```

## 🏗️ Architecture

### Multi-Agent System

- **Eliza Agent**: General-purpose AI assistant with broad capabilities
- **SolanaData Agent**: Specialized Chinese Solana blockchain expert featuring:
  - Token information queries and analysis
  - Solana address validation (32-44 character format checking)
  - Transaction history and account balance queries
  - Security analysis and risk warnings
  - PDA (Program Derived Address) explanations
  - Holder distribution analysis

### Core Components

- **Custom OpenAI Plugin**: Resolves official plugin 404 errors with enhanced compatibility
- **Dynamic Plugin Loading**: Environment-based platform integrations (Discord, Twitter, Telegram)
- **Comprehensive Testing**: Component and E2E test suites with real runtime validation
- **React Frontend**: Modern web interface for agent interaction

## 🛠️ Development

```bash
# Development with hot-reloading
bun run dev

# Production build
bun run build

# Start production server
bun run start

# Testing
bun run test              # Run all tests
bun run test:component    # Component tests only
bun run test:e2e          # E2E tests only
bun run test:coverage     # With coverage report

# Code quality
bun run lint              # Format code
bun run type-check        # Type checking
bun run check-all         # Run all checks
```

## 📋 Available Commands

### SolanaData Agent Capabilities

The SolanaData agent can handle queries like:

- **Token Information**: "能帮我查一下这个代币的信息吗? C98"
- **Address Queries**: "这个地址的余额是多少? 8hoBHQhbknrK8D4g7hGGN3wHnG9WJKB6XMTnS3Q3XV9L"
- **Technical Concepts**: "能解释一下什么是PDA吗?"
- **Security Analysis**: "帮我分析一下这个代币的安全性"

### Supported Features

- ✅ Solana address format validation
- ✅ Token metadata and pricing information
- ✅ Holder distribution analysis
- ✅ Security risk assessments
- ✅ Transaction history queries
- ✅ Smart contract analysis
- ✅ Chinese and English language support
- ✅ Real-time data fetching

## 🔧 Configuration

### Platform Integrations

Optional platform integrations (configure via environment variables):

```bash
# Discord bot
DISCORD_API_TOKEN=your-discord-token

# Twitter integration
TWITTER_API_KEY=your-twitter-key
TWITTER_API_SECRET_KEY=your-twitter-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-secret

# Telegram bot
TELEGRAM_BOT_TOKEN=your-telegram-token
```

### Custom API Endpoints

The system supports custom OpenAI-compatible APIs:

```bash
# Custom endpoint configuration
OPENAI_BASE_URL=https://your-custom-api.com/v1
OPENAI_SMALL_MODEL=your-custom-model
OPENAI_LARGE_MODEL=your-custom-large-model
```

## 🧪 Testing

Solanalyse employs a comprehensive dual-testing strategy:

1. **Component Tests**: Fast, isolated tests using Bun's native test runner
2. **E2E Tests**: Real runtime testing with database integration

```bash
# Run specific test types
elizaos test component    # Component tests only
elizaos test e2e          # E2E tests only

# Test with coverage
bun run test:coverage
```

## 📚 Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Development guidance for Claude Code
- **[references/](./references/)**: API documentation and plugin development guides
  - ElizaOS plugin creation guide
  - GeckoTerminal API documentation
  - SoSoValue API references

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the repository for details.

## 🔗 Related Projects

- [ElizaOS](https://elizaos.ai/) - The underlying AI agent framework
- [Solana](https://solana.com/) - High-performance blockchain platform
- [GeckoTerminal](https://www.geckoterminal.com/) - Token data and analytics
- [SoSoValue](https://www.sosovalue.com/) - Crypto data and news platform

---

**Built with ❤️ for the Solana ecosystem**