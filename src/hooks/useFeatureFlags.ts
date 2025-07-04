import { useState, useEffect } from 'react';

type FeatureFlags = {
  listForSaleEnabled: boolean;
};

const DEFAULT_FLAGS: FeatureFlags = {
  listForSaleEnabled: false, // Hidden by default
};

const STORAGE_KEY = 'voucher-feature-flags';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedFlags = JSON.parse(stored);
        setFlags({ ...DEFAULT_FLAGS, ...parsedFlags });
      } catch (error) {
        console.error('Failed to parse feature flags:', error);
      }
    }
  }, []);

  const updateFlag = (key: keyof FeatureFlags, value: boolean) => {
    const newFlags = { ...flags, [key]: value };
    setFlags(newFlags);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
  };

  return { flags, updateFlag };
};

// Global function for console access
(window as any).toggleListForSale = (enabled: boolean) => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const currentFlags = stored ? JSON.parse(stored) : DEFAULT_FLAGS;
  const newFlags = { ...currentFlags, listForSaleEnabled: enabled };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newFlags));
  window.location.reload(); // Refresh to apply changes
  console.log(`List for sale feature ${enabled ? 'enabled' : 'disabled'}`);
};