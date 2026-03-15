import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface FavoriteItem {
  id: string;
  name: string;
  type: string;
  image: string;
  rating: number | string;
  location: string;
  description?: string;
  reviews?: number | string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Local state mantém IDs favoritados para acesso síncrono (isFavorite)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Carrega favoritos do Supabase quando user muda
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setFavorites([]);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from('post_favorites')
        .select('source_id, source_metadata')
        .eq('user_id', user.id)
        .eq('source_type', 'partner');
      if (data) {
        const ids = new Set(data.map((r: any) => r.source_id as string));
        setFavoriteIds(ids);
        // Reconstrói FavoriteItem a partir dos metadados armazenados
        const items: FavoriteItem[] = data
          .filter((r: any) => r.source_metadata)
          .map((r: any) => ({ id: r.source_id, ...r.source_metadata }));
        setFavorites(items);
      }
    };
    load();
  }, [user]);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const addFavorite = useCallback(async (item: FavoriteItem) => {
    if (!user || favoriteIds.has(item.id)) return;
    // Otimistic update
    setFavoriteIds(prev => new Set([...prev, item.id]));
    setFavorites(prev => [...prev, item]);
    await supabase.from('post_favorites').insert({
      user_id: user.id,
      source_id: item.id,
      source_type: 'partner',
      source_metadata: item,
    });
  }, [user, favoriteIds]);

  const removeFavorite = useCallback(async (id: string) => {
    if (!user) return;
    setFavoriteIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    setFavorites(prev => prev.filter(f => f.id !== id));
    await supabase.from('post_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('source_id', id)
      .eq('source_type', 'partner');
  }, [user]);

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
