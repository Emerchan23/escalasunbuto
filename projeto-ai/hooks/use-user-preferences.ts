// hooks/use-user-preferences.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

export interface UserPreferences {
  active_professional_ids: string[];
  schedule_generation_mode: 'daily' | 'weekly';
  starting_professional_id: string | null;
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    active_professional_ids: [],
    schedule_generation_mode: 'daily',
    starting_professional_id: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar preferências
  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getUserPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Erro ao carregar preferências do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar preferências
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      setError(null);
      const updatedPreferences = await apiClient.updateUserPreferences(updates);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('Erro ao atualizar preferências do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  }, []);

  // Carregar preferências na inicialização
  useEffect(() => {
    loadPreferences();
  }, []);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refreshPreferences: loadPreferences,
  };
}