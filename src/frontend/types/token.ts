export interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  coingecko_coin_id: string;
  websites: string[];
  description: string;
  categories: string[];
  gt_score: number;
  gt_score_details: {
    pool: number;
    transaction: number;
    creation: number;
    info: number;
  };
  holders: {
    count: number;
    distribution_percentage: {
      top_10: number;
      '11_20': number;
      '21_40': number;
      rest: number;
    };
    last_updated: string;
  };
  security: {
    mint_authority: boolean;
    freeze_authority: boolean;
    is_honeypot: boolean;
  };
  launchpad: {
    graduation_percentage: number;
    completed: boolean;
    completed_at: string;
    migrated_destination_pool_address: string;
  };
  social_media: {
    discord_url: string;
    telegram_handle: string;
    twitter_handle: string;
  };
  price_history: {
      date: string;
      price: number;
  }[];
}