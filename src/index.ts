import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@elizaos/core';
import starterPlugin from './plugin.ts';
import { character } from './character.ts';
// Import custom OpenAI plugin
import customOpenAIPlugin from './plugins/custom-openai.ts';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [starterPlugin, customOpenAIPlugin], // Import custom plugins here
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
