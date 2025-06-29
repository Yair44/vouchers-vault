
import { useState, useEffect } from 'react';
import { DEFAULT_VOUCHER_TYPES, CustomVoucherType } from '@/types';

const STORAGE_KEY = 'voucher-custom-types';

export const useVoucherTypes = () => {
  const [customTypes, setCustomTypes] = useState<CustomVoucherType[]>([]);

  // Load custom types from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomTypes(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load custom voucher types:', error);
      }
    }
  }, []);

  // Save to localStorage whenever customTypes changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTypes));
  }, [customTypes]);

  const addCustomType = (name: string) => {
    const newType: CustomVoucherType = {
      id: Date.now().toString(),
      name: name.trim(),
      createdAt: new Date(),
    };
    setCustomTypes(prev => [...prev, newType]);
    return newType;
  };

  const editCustomType = (id: string, newName: string) => {
    setCustomTypes(prev => 
      prev.map(type => 
        type.id === id ? { ...type, name: newName.trim() } : type
      )
    );
  };

  const deleteCustomType = (id: string) => {
    setCustomTypes(prev => prev.filter(type => type.id !== id));
  };

  const getAllTypes = () => {
    return [
      ...DEFAULT_VOUCHER_TYPES.map(type => ({ id: type, name: type, isDefault: true })),
      ...customTypes.map(type => ({ ...type, isDefault: false }))
    ];
  };

  return {
    customTypes,
    addCustomType,
    editCustomType,
    deleteCustomType,
    getAllTypes,
  };
};
