'use client';

import { useState, useEffect } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { getCryptoData } from '@/services/crypto';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  image: string;
  ath: number;
  ath_date: string;
  atl: number;
  atl_date: string;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  market_cap_rank: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface WatchList {
  id: string;
  name: string;
  cryptoIds: string[];
}

export default function Home() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [watchlists, setWatchlists] = useState<WatchList[]>([
    { id: 'default', name: 'Default Watchlist', cryptoIds: [] }
  ]);
  const [activeWatchlistId, setActiveWatchlistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllCryptos, setShowAllCryptos] = useState(true);
  const [activeTab, setActiveTab] = useState<'market' | 'watchlists'>('market');

  useEffect(() => {
    const saved = localStorage.getItem('watchlists');
    if (saved) {
      setWatchlists(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('watchlists', JSON.stringify(watchlists));
  }, [watchlists]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getCryptoData();
        setCryptos(data);
      } catch (error) {
        toast.error('Failed to fetch crypto data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get filtered cryptos based on search and active watchlist
  const getFilteredCryptos = () => {
    let filtered = cryptos.filter(crypto =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!showAllCryptos) {
      const activeWatchlist = watchlists.find(list => list.id === activeWatchlistId);
      filtered = filtered.filter(crypto => activeWatchlist?.cryptoIds.includes(crypto.id));
    }

    return filtered;
  };

  // Store the filtered results in a variable
  const filteredCryptos = getFilteredCryptos();

  useEffect(() => {
    if (isFullScreen) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          setCurrentSlideIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
        } else if (e.key === 'ArrowRight') {
          setCurrentSlideIndex(prev => 
            prev < filteredCryptos.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === 'Escape') {
          setIsFullScreen(false);
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isFullScreen, filteredCryptos.length]);

  // Add navigation buttons to the fullscreen modal
  const NavigationButtons = () => (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
      <button
        onClick={() => setCurrentSlideIndex(prev => prev > 0 ? prev - 1 : prev)}
        className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        disabled={currentSlideIndex === 0}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlideIndex(prev => 
          prev < filteredCryptos.length - 1 ? prev + 1 : prev
        )}
        className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        disabled={currentSlideIndex === filteredCryptos.length - 1}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Add new watchlist
  const addWatchlist = (name: string) => {
    const newWatchlist: WatchList = {
      id: `list-${Date.now()}`,
      name,
      cryptoIds: []
    };
    setWatchlists(prev => [...prev, newWatchlist]);
    toast.success(`Created new watchlist: ${name}`);
  };

  // Toggle crypto in watchlist
  const toggleCryptoInWatchlist = (cryptoId: string, watchlistId: string) => {
    setWatchlists(prev => prev.map(list => {
      if (list.id === watchlistId) {
        return {
          ...list,
          cryptoIds: list.cryptoIds.includes(cryptoId)
            ? list.cryptoIds.filter(id => id !== cryptoId)
            : [...list.cryptoIds, cryptoId]
        };
      }
      return list;
    }));
    toast.success('Updated watchlist');
  };

  // Add this function to handle watchlist creation
  const handleCreateWatchlist = () => {
    const name = prompt('Enter watchlist name:');
    if (name && name.trim()) {  // Check if name exists and isn't just whitespace
      const newWatchlist: WatchList = {
        id: `list-${Date.now()}`,
        name: name.trim(),
        cryptoIds: []
      };
      setWatchlists(prev => [...prev, newWatchlist]);
      setActiveWatchlistId(newWatchlist.id);  // Automatically switch to new watchlist
      setShowAllCryptos(false);  // Show the new watchlist
      toast.success(`Created new watchlist: ${name}`);
    }
  };

  // Handler for adding crypto to watchlist
  const addToWatchlist = (cryptoId: string, watchlistId: string) => {
    setWatchlists(prev => prev.map(list => {
      if (list.id === watchlistId && !list.cryptoIds.includes(cryptoId)) {
        return {
          ...list,
          cryptoIds: [...list.cryptoIds, cryptoId]
        };
      }
      return list;
    }));
    toast.success('Added to watchlist');
  };

  // Handler for removing crypto from watchlist
  const removeFromWatchlist = (cryptoId: string, watchlistId: string) => {
    setWatchlists(prev => prev.map(list => {
      if (list.id === watchlistId) {
        return {
          ...list,
          cryptoIds: list.cryptoIds.filter(id => id !== cryptoId)
        };
      }
      return list;
    }));
    toast.success('Removed from watchlist');
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Tab Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-4">
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'market'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => {
                setActiveTab('market');
                setActiveWatchlistId(null);
              }}
            >
              Market
            </button>
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'watchlists'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('watchlists')}
            >
              My Watchlists
            </button>
          </div>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            className="w-full bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        {activeTab === 'market' || activeWatchlistId ? (
          // Crypto List View
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            {/* List Header */}
            <div className="grid grid-cols-[auto,1fr,1fr,1fr,auto] gap-4 p-4 border-b dark:border-gray-700 font-medium text-sm text-gray-500">
              <div className="w-8">#</div>
              <div>Name</div>
              <div className="text-right">Price</div>
              <div className="text-right">24h Change</div>
              <div className="w-20">Actions</div>
            </div>
            
            {/* List Content */}
            {(activeWatchlistId 
              ? filteredCryptos.filter(crypto => 
                  watchlists.find(w => w.id === activeWatchlistId)?.cryptoIds.includes(crypto.id))
              : filteredCryptos
            ).map((crypto, index) => (
              <div 
                key={crypto.id}
                className="grid grid-cols-[auto,1fr,1fr,1fr,auto] gap-4 p-4 border-b dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="w-8 text-gray-500">{index + 1}</div>
                <div className="flex items-center space-x-3">
                  <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
                  <div>
                    <div className="font-medium">{crypto.name}</div>
                    <div className="text-sm text-gray-500">{crypto.symbol.toUpperCase()}</div>
                  </div>
                </div>
                <div className="text-right font-medium">
                  ${crypto.current_price.toLocaleString()}
                </div>
                <div className={`text-right ${
                  crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {crypto.price_change_percentage_24h >= 0 ? '↑' : '↓'}
                  {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                </div>
                <div className="flex items-center space-x-2 w-20">
                  {/* Fullscreen Button */}
                  <button
                    onClick={() => {
                      setCurrentSlideIndex(index);
                      setIsFullScreen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  
                  {/* Watchlist Actions */}
                  {activeWatchlistId ? (
                    <button
                      onClick={() => removeFromWatchlist(crypto.id, activeWatchlistId)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  ) : (
                    <div className="relative group">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <StarOutline className="w-5 h-5" />
                      </button>
                      
                      {/* Watchlist Dropdown */}
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden invisible group-hover:visible z-10">
                        {watchlists.map(list => (
                          <button
                            key={list.id}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => addToWatchlist(crypto.id, list.id)}
                          >
                            Add to {list.name}
                          </button>
                        ))}
                        {watchlists.length === 0 && (
                          <div className="px-4 py-2 text-gray-500 text-sm">
                            No watchlists yet
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Watchlists Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New Watchlist Card */}
            <button
              onClick={() => {
                const name = prompt('Enter watchlist name:');
                if (name && name.trim()) {
                  const newList = {
                    id: `list-${Date.now()}`,
                    name: name.trim(),
                    cryptoIds: []
                  };
                  setWatchlists(prev => [...prev, newList]);
                  toast.success(`Created ${name} watchlist`);
                }
              }}
              className="h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-500 group transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-500/20">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Create New Watchlist</div>
              </div>
            </button>

            {/* Existing Watchlists */}
            {watchlists.map(list => (
              <div
                key={list.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{list.name}</h3>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${list.name} watchlist?`)) {
                        setWatchlists(prev => prev.filter(w => w.id !== list.id));
                        toast.success(`Deleted ${list.name} watchlist`);
                      }
                    }}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="text-gray-500 mb-4">
                  {list.cryptoIds.length} {list.cryptoIds.length === 1 ? 'crypto' : 'cryptos'}
                </div>
                <button
                  onClick={() => {
                    setActiveWatchlistId(list.id);
                    setActiveTab('market');
                  }}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Watchlist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Mode */}
      {isFullScreen && filteredCryptos[currentSlideIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center overflow-y-auto py-8">
          <NavigationButtons />
          <div className="w-full max-w-5xl p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
              {/* Header */}
              <div className="border-b dark:border-gray-700 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={filteredCryptos[currentSlideIndex]?.image} 
                      alt={filteredCryptos[currentSlideIndex]?.name} 
                      className="w-16 h-16"
                    />
                    <div>
                      <h2 className="text-3xl font-bold">{filteredCryptos[currentSlideIndex]?.name}</h2>
                      <p className="text-xl text-gray-500">{filteredCryptos[currentSlideIndex]?.symbol?.toUpperCase()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsFullScreen(false);
                      setCurrentSlideIndex(0);  // Reset index when closing
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Price Chart */}
                <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Price Chart (7 Days)</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filteredCryptos[currentSlideIndex]?.sparkline_in_7d?.price?.map((price, i) => ({ value: price })) || []}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#4F46E5" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <XAxis hide />
                        <YAxis hide domain={['dataMin', 'dataMax']} />
                        <Tooltip 
                          formatter={(value: number) => [`$${value?.toFixed(2)}`, 'Price']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            border: 'none',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Current Stats</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-500">Current Price</p>
                        <p className="text-2xl font-bold">
                          ${filteredCryptos[currentSlideIndex]?.current_price?.toLocaleString() ?? 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">24h Change</p>
                        <p className={`text-2xl font-bold flex items-center gap-1 ${
                          (filteredCryptos[currentSlideIndex]?.price_change_percentage_24h ?? 0) >= 0 
                            ? 'text-green-500' 
                            : 'text-red-500'
                        }`}>
                          {(filteredCryptos[currentSlideIndex]?.price_change_percentage_24h ?? 0) >= 0 ? (
                            <ArrowTrendingUpIcon className="w-6 h-6" />
                          ) : (
                            <ArrowTrendingDownIcon className="w-6 h-6" />
                          )}
                          {Math.abs(filteredCryptos[currentSlideIndex]?.price_change_percentage_24h ?? 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Market Cap</span>
                        <span className="font-medium">
                          ${filteredCryptos[currentSlideIndex]?.market_cap?.toLocaleString() ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Volume (24h)</span>
                        <span className="font-medium">
                          ${filteredCryptos[currentSlideIndex]?.total_volume?.toLocaleString() ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Market Cap Rank</span>
                        <span className="font-medium">
                          #{filteredCryptos[currentSlideIndex]?.market_cap_rank ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Price History</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">All-Time High</span>
                        <span className="font-medium">
                          ${filteredCryptos[currentSlideIndex]?.ath?.toLocaleString() ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">All-Time Low</span>
                        <span className="font-medium">
                          ${filteredCryptos[currentSlideIndex]?.atl?.toLocaleString() ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">24h High</span>
                        <span className="font-medium">
                          ${filteredCryptos[currentSlideIndex]?.high_24h?.toLocaleString() ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">24h Low</span>
                        <span className="font-medium">
                          ${filteredCryptos[currentSlideIndex]?.low_24h?.toLocaleString() ?? 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 