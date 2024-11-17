export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

export interface Watchlist {
  id: string;
  name: string;
  icon: string;
  cryptos: string[]; // Array of crypto IDs
} 