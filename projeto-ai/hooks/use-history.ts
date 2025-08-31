"use client";

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { HistoryRecord } from '@/lib/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getHistoryRecords(); // Updated line
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (data: Omit<HistoryRecord, 'id' | 'created_at'>) => {
    try {
      const savedRecord = await apiClient.saveToHistory(data);
      
      setHistory(prev => {
        const existingIndex = prev.findIndex(record => record.month_year === data.month_year);
        if (existingIndex > -1) {
          return prev.map((record, i) => i === existingIndex ? savedRecord : record);
        } else {
          return [...prev, savedRecord];
        }
      });
      
      return savedRecord;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar no histórico';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteFromHistory = async (id: string) => {
    try {
      await apiClient.deleteFromHistory(id);
      setHistory(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar do histórico';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };



  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    loading,
    error,
    saveToHistory,
    deleteFromHistory,
    refetch: fetchHistory,
  };
}
