import { Crypto } from '@/app/types';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useWatchlists } from '@/app/hooks/useWatchlists';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  cryptos: Crypto[];
}

export default function CryptoList({ cryptos }: Props) {
  const { watchlists, addCryptoToWatchlist } = useWatchlists();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);

  const handleAddToWatchlist = (cryptoId: string, watchlistId: string) => {
    addCryptoToWatchlist(watchlistId, cryptoId);
    setSelectedCrypto(null);
    toast.success('Added to watchlist');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cryptos.map((crypto) => (
        <div key={crypto.id} className="relative">
          <Link
            href={`/crypto/${crypto.id}`}
            className="p-4 border rounded-lg hover:shadow-lg transition-shadow block"
          >
            <div className="flex items-center space-x-4">
              <img src={crypto.image} alt={crypto.name} className="w-8 h-8" />
              <div>
                <h3 className="font-bold">{crypto.name}</h3>
                <p className="text-gray-600">{crypto.symbol.toUpperCase()}</p>
              </div>
              <div className="ml-auto">
                <p className="font-bold">${crypto.current_price}</p>
                <p
                  className={`text-sm ${
                    crypto.price_change_percentage_24h >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSelectedCrypto(selectedCrypto === crypto.id ? null : crypto.id)}
            className="absolute top-2 right-2 p-2"
          >
            <StarIcon className="w-5 h-5" />
          </button>

          {selectedCrypto === crypto.id && (
            <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg p-2 z-10 w-48">
              <p className="px-2 py-1 text-sm font-bold">Add to Watchlist:</p>
              {watchlists.map((watchlist) => (
                <button
                  key={watchlist.id}
                  onClick={() => handleAddToWatchlist(crypto.id, watchlist.id)}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                >
                  {watchlist.icon} {watchlist.name}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 