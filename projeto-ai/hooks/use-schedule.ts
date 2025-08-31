"use client";

import { useState, useEffect } from 'react';
import { apiClient, ScheduleEntryWithProfessional } from '@/lib/api';
import { ScheduleEntry } from '@/lib/types';

export function useSchedule(year?: number, month?: number) {
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntryWithProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: ScheduleEntryWithProfessional[];
      if (year && month) {
        data = await apiClient.getScheduleByMonth(year, month);
      } else {
        data = await apiClient.getScheduleEntries();
      }
      
      setScheduleEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar escala');
      console.error('Erro ao buscar escala:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateEntry = async (entry: Omit<ScheduleEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const updatedEntry = await apiClient.createOrUpdateScheduleEntry(entry);
      
      setScheduleEntries(prev => {
        const existingIndex = prev.findIndex(e => e.date === entry.date);
        if (existingIndex > -1) {
          return prev.map((e, i) => i === existingIndex ? updatedEntry : e);
        } else {
          return [...prev, updatedEntry];
        }
      });
      
      return updatedEntry;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar entrada';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEntry = async (date: string) => {
    try {
      await apiClient.deleteScheduleEntry(date);
      setScheduleEntries(prev => prev.filter(e => e.date !== date));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar entrada';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearMonth = async (year: number, month: number) => {
    try {
      await apiClient.clearScheduleMonth(year, month);
      setScheduleEntries(prev => {
        const monthYear = `${year}-${month.toString().padStart(2, '0')}`;
        return prev.filter(e => !e.date.startsWith(monthYear));
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao limpar mês';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [year, month]);

  return {
    scheduleEntries,
    loading,
    error,
    createOrUpdateEntry,
    deleteEntry,
    clearMonth,
    refetch: fetchSchedule,
  };
}
