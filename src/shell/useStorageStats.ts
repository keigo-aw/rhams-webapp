import { useEffect, useState } from 'react';
import { getStorageStats, type StorageStats } from '../persistence/storageStats';

const REFRESH_MS = 3000;

export function useStorageStats() {
  const [stats, setStats] = useState<StorageStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      getStorageStats()
        .then((s) => {
          if (!cancelled) setStats(s);
        })
        .catch((err) => console.error('Failed to read storage stats', err));
    };
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return stats;
}
