import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  high_24h: number;
  low_24h: number;
  image: string;
}

export async function getCryptoData(): Promise<CryptoData[]> {
  try {
    const response = await axios.get(`${COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: true,
        price_change_percentage: '7d'
      }
    });
    
    // Transform the data to match our interface
    return response.data.map((coin: any) => ({
      ...coin,
      sparkline_7d: {
        price: coin.sparkline_in_7d?.price || []
      }
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
} 