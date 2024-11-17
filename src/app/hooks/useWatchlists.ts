import { useState, useEffect } from 'react';
import { Watchlist } from '@/types';

export function useWatchlists() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);

  useEffect(() => {
    // Load watchlists from localStorage on mount
    const stored = localStorage.getItem('watchlists');
    if (stored) {
      setWatchlists(JSON.parse(stored));
    }
  }, []);

  const addWatchlist = (name: string, icon: string) => {
    const newWatchlist: Watchlist = {
      id: Date.now().toString(),
      name,
      icon,
      cryptos: []
    };
    const updatedWatchlists = [...watchlists, newWatchlist];
    setWatchlists(updatedWatchlists);
    localStorage.setItem('watchlists', JSON.stringify(updatedWatchlists));
  };

  const addCryptoToWatchlist = (watchlistId: string, cryptoId: string) => {
    const updatedWatchlists = watchlists.map(watchlist => {
      if (watchlist.id === watchlistId && !watchlist.cryptos.includes(cryptoId)) {
        return {
          ...watchlist,
          cryptos: [...watchlist.cryptos, cryptoId]
        };
      }
      return watchlist;
    });
    setWatchlists(updatedWatchlists);
    localStorage.setItem('watchlists', JSON.stringify(updatedWatchlists));
  };

  const removeCryptoFromWatchlist = (watchlistId: string, cryptoId: string) => {
    const updatedWatchlists = watchlists.map(watchlist => {
      if (watchlist.id === watchlistId) {
        return {
          ...watchlist,
          cryptos: watchlist.cryptos.filter(id => id !== cryptoId)
        };
      }
      return watchlist;
    });
    setWatchlists(updatedWatchlists);
    localStorage.setItem('watchlists', JSON.stringify(updatedWatchlists));
  };

  const deleteWatchlist = (watchlistId: string) => {
    const updatedWatchlists = watchlists.filter(w => w.id !== watchlistId);
    setWatchlists(updatedWatchlists);
    localStorage.setItem('watchlists', JSON.stringify(updatedWatchlists));
  };

  return {
    watchlists,
    addWatchlist,
    addCryptoToWatchlist,
    removeCryptoFromWatchlist,
    deleteWatchlist
  };
}