"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HistoryRecord } from "@/lib/types";
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface HistoryDialogProps {
  history: HistoryRecord[];
  onLoadHistory: (record: HistoryRecord) => void;
  onDeleteHistory: (id: string) => void;
  loading?: boolean;
}

export function HistoryDialog({ history, onLoadHistory, onDeleteHistory, loading = false }: HistoryDialogProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteHistory(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Carregando...
            </>
          ) : (
            'Ver Histórico'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Histórico de Escalas</DialogTitle>
          <DialogDescription>
            Visualize e carregue escalas salvas anteriormente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-4 py-4">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center">Nenhuma escala salva no histórico ainda.</p>
            ) : (
              history
                .sort((a, b) => {
                  const dateA = a.created_at ? parseISO(a.created_at).getTime() : 0;
                  const dateB = b.created_at ? parseISO(b.created_at).getTime() : 0;
                  return dateB - dateA;
                })
                .map((record, index) => (
                  <div key={record.id || index} className="flex items-center justify-between p-3 border rounded-md bg-card">
                    <div className="flex-1">
                      <p className="font-medium">
                        Escala de {format(parseISO(record.month_year + "-01"), "MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Salva em: {record.created_at ? format(parseISO(record.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Data não disponível'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.schedule_data?.length || 0} entradas • {record.professionals_data?.length || 0} profissionais
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => onLoadHistory(record)} size="sm">
                        Carregar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={deletingId === record.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingId === record.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a escala de {format(parseISO(record.month_year + "-01"), "MMMM 'de' yyyy", { locale: ptBR })}?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(record.id!)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
