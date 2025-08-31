"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Professional } from '@/lib/types';

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProfessionals();
      setProfessionals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais');
      console.error('Erro ao buscar profissionais:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProfessional = async (professional: Omit<Professional, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('Tentando adicionar profissional:', professional);
      const newProfessional = await apiClient.createProfessional(professional);
      console.log('Profissional adicionado com sucesso:', newProfessional);
      setProfessionals(prev => [...prev, newProfessional]);
      return newProfessional;
    } catch (err) {
      console.error('Erro detalhado ao adicionar profissional:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar profissional';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProfessional = async (id: string, updates: Partial<Professional>) => {
    try {
      const updatedProfessional = await apiClient.updateProfessional(id, updates);
      setProfessionals(prev => 
        prev.map(p => p.id === id ? updatedProfessional : p)
      );
      return updatedProfessional;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar profissional';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProfessional = async (id: string) => {
    try {
      await apiClient.deleteProfessional(id);
      setProfessionals(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar profissional';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  return {
    professionals,
    loading,
    error,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    refetch: fetchProfessionals,
  };
}
