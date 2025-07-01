
import { useState, useEffect } from 'react';
import { DEFAULT_VOUCHER_CATEGORIES, CustomVoucherCategory } from '@/types';

const STORAGE_KEY = 'voucher-custom-categories';

export const useVoucherCategories = () => {
  const [customCategories, setCustomCategories] = useState<CustomVoucherCategory[]>([]);

  // Load custom categories from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomCategories(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load custom voucher categories:', error);
      }
    }
  }, []);

  // Save to localStorage whenever customCategories changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  const addCustomCategory = (name: string) => {
    const newCategory: CustomVoucherCategory = {
      id: Date.now().toString(),
      name: name.trim().toLowerCase(),
      createdAt: new Date(),
    };
    setCustomCategories(prev => [...prev, newCategory]);
    return newCategory;
  };

  const editCustomCategory = (id: string, newName: string) => {
    setCustomCategories(prev => 
      prev.map(category => 
        category.id === id ? { ...category, name: newName.trim().toLowerCase() } : category
      )
    );
  };

  const deleteCustomCategory = (id: string) => {
    setCustomCategories(prev => prev.filter(category => category.id !== id));
  };

  const getAllCategories = () => {
    return [
      ...DEFAULT_VOUCHER_CATEGORIES.map(category => ({ id: category, name: category, isDefault: true })),
      ...customCategories.map(category => ({ ...category, isDefault: false }))
    ];
  };

  return {
    customCategories,
    addCustomCategory,
    editCustomCategory,
    deleteCustomCategory,
    getAllCategories,
  };
};
