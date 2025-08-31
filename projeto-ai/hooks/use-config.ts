"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Config } from '@/lib/types';

export function useConfig() {
  const [config, setConfig] = useState<Config>({
    id: '',
    department_name: 'DEPARTAMENTO - TI',
    company_name: 'Departamento de TI da Saúde',
    system_title: 'Sistema de Escalas',
    created_at: '',
    updated_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getConfig();
      setConfig(data as Config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key: keyof Config, value: string) => {
    try {
      const updatedConfig = { ...config, [key]: value };
      const { id, created_at, updated_at, ...configData } = updatedConfig;
      const result = await apiClient.updateConfig(configData);
      setConfig(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configuração';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    updateConfig,
    refetch: fetchConfig,
  };
}
