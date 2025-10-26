import type { Message } from '../../types/messages';
import type { TokenData } from '../../types/token';

export const mockTokenData: TokenData = {
  address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  name: 'Bonk',
  symbol: 'BONK',
  decimals: 5,
  image_url: 'https://img.geckoterminal.com/tokens/bonk-f83133.png',
  image: {
    thumb: 'https://assets.coingecko.com/coins/images/28600/thumb/bonk.jpeg',
    small: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpeg',
    large: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpeg'
  },
  coingecko_coin_id: 'bonk',
  websites: ['https://bonkcoin.com/'],
  description: 'Bonk is the first Solana dog coin for the people, by the people with 50% of the total supply airdropped to the Solana community.',
  categories: ['Memecoin', 'Community', 'Solana Ecosystem'],
  gt_score: 85,
  gt_score_details: {
    pool: 95,
    transaction: 88,
    creation: 70,
    info: 90
  },
  holders: {
    count: 538123,
    distribution_percentage: {
      top_10: 45.5,
      '11_20': 15.2,
      '21_40': 20.3,
      rest: 19.0
    },
    last_updated: new Date().toISOString()
  },
  security: {
    mint_authority: false,
    freeze_authority: false,
    is_honeypot: false
  },
  launchpad: {
    graduation_percentage: 100,
    completed: true,
    completed_at: new Date('2023-12-25T00:00:00Z').toISOString(),
    migrated_destination_pool_address: 'Some-Other-Pool-Address-Here'
  },
  social_media: {
    discord_url: 'https://discord.com/invite/bonkcoin',
    telegram_handle: 'bonkcoin',
    twitter_handle: 'bonk_inu'
  },
  price_history: [
      { date: '2023-10-01', price: 0.00000021 },
      { date: '2023-10-02', price: 0.00000025 },
      { date: '2023-10-03', price: 0.00000023 },
      { date: '2023-10-04', price: 0.00000028 },
      { date: '2023-10-05', price: 0.00000035 },
      { date: '2023-10-06', price: 0.00000032 },
      { date: '2023-10-07', price: 0.00000041 },
  ]
};

export const mockMessages: Message[] = [
  {
    id: '1',
    content: {
      text: '查询代币信息：DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      messageType: 'TEXT'
    },
    sender: 'user',
    timestamp: new Date()
  },
  {
    id: '2',
    content: {
      text: '正在查询该代币的详细技术信息和安全指标...',
      messageType: 'TOKEN_CARD',
      data: {
        tokenInfo: mockTokenData,
        cardType: 'compact'
      }
    },
    sender: 'agent',
    timestamp: new Date()
  },
  {
    id: '3',
    content: {
      text: '这个代币看起来很安全！Mint和Freeze权限都已经禁用，而且不是蜜罐。GT评分85分也相当不错。不过要注意前10%持有者集中度比较高，达到了45.5%。',
      messageType: 'TEXT'
    },
    sender: 'agent',
    timestamp: new Date()
  }
];