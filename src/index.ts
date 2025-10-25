import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin.ts';
import { character } from './character.ts';
// Import custom OpenAI plugin
import customOpenAIPlugin from './plugins/custom-openai.ts';
// Import SolanaData character
import { solanaDataCharacter } from './characters/SolanaData.ts';
// Import SoSoValue news plugin
import sosoNewsPlugin from './plugins/soso-news.ts';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

const initSolanaDataCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing SolanaData character');
  logger.info({ name: solanaDataCharacter.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [starterPlugin, customOpenAIPlugin], // Import custom plugins here
};

export const solanaDataAgent: ProjectAgent = {
  character: solanaDataCharacter,
  init: async (runtime: IAgentRuntime) => await initSolanaDataCharacter({ runtime }),
  plugins: [starterPlugin, customOpenAIPlugin, sosoNewsPlugin],
};

const project: Project = {
  agents: [projectAgent, solanaDataAgent],
};

export { character } from './character.ts';
export { solanaDataCharacter } from './characters/SolanaData.ts';

export default project;
