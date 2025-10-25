import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin.ts';
import { character } from './character.ts';
// Import custom OpenAI plugin
import customOpenAIPlugin from './plugins/custom-openai.ts';
// Import SoSoNews character
import { soSoNewsCharacter } from './characters/SoSoNews.ts';
// Import SoSoValue news plugin
import sosoNewsPlugin from './plugins/soso-news.ts';
// Import TokenView character
import { tokenViewCharacter } from './characters/TokenView.ts';
// Import GeckoTerminal plugin
import geckoTerminalPlugin from './plugins/gecko-terminal.ts';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

const initSoSoNewsCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing SoSoNews character');
  logger.info({ name: soSoNewsCharacter.name }, 'Name:');
};

const initTokenViewCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing TokenView character');
  logger.info({ name: tokenViewCharacter.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [starterPlugin, customOpenAIPlugin], // Import custom plugins here
};

export const soSoNewsAgent: ProjectAgent = {
  character: soSoNewsCharacter,
  init: async (runtime: IAgentRuntime) => await initSoSoNewsCharacter({ runtime }),
  plugins: [starterPlugin, customOpenAIPlugin, sosoNewsPlugin],
};

export const tokenViewAgent: ProjectAgent = {
  character: tokenViewCharacter,
  init: async (runtime: IAgentRuntime) => await initTokenViewCharacter({ runtime }),
  plugins: [starterPlugin, customOpenAIPlugin, geckoTerminalPlugin],
};

const project: Project = {
  agents: [projectAgent, soSoNewsAgent, tokenViewAgent],
};

export { character } from './character.ts';
export { soSoNewsCharacter } from './characters/SoSoNews.ts';
export { tokenViewCharacter } from './characters/TokenView.ts';

export default project;
