import axios from 'axios';
import { Crypto } from '@/types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const api = {
  getCryptos: async (): Promise<Crypto[]> => {
    const response = await axios.get(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&sparkline=false`
    );
    return response.data;
  },

  getCryptoById: async (id: string): Promise<Crypto> => {
    const response = await axios.get(
      `${COINGECKO_API}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    return response.data;
  },
}; 