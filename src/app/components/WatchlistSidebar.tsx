import { useState } from 'react';
import { useWatchlists } from '@/app/hooks/useWatchlists';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function WatchlistSidebar() {
  const { watchlists, addWatchlist, deleteWatchlist } = useWatchlists();
  const [isCreating, setIsCreating] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');

  const handleCreateWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWatchlistName.trim()) {
      addWatchlist(newWatchlistName, '📈'); // Default icon for now
      setNewWatchlistName('');
      setIsCreating(false);
      toast.success('Watchlist created!');
    }
  };

  return (
    <div className="w-64 bg-gray-100 p-4 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Watchlists</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="p-2 rounded-full hover:bg-gray-200"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateWatchlist} className="mb-4">
          <input
            type="text"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            placeholder="Watchlist name"
            className="w-full p-2 rounded border"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="bg-gray-300 px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {watchlists.map((watchlist) => (
          <div
            key={watchlist.id}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-200"
          >
            <div className="flex items-center gap-2">
              <span>{watchlist.icon}</span>
              <span>{watchlist.name}</span>
              <span className="text-sm text-gray-500">
                ({watchlist.cryptos.length})
              </span>
            </div>
            <button
              onClick={() => {
                deleteWatchlist(watchlist.id);
                toast.success('Watchlist deleted');
              }}
              className="p-1 rounded-full hover:bg-gray-300"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 