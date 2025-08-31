"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO, getWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfessionalManagement } from "@/components/professional-management";
import { ScheduleCalendar } from "@/components/schedule-calendar";
import { MonthSelector } from "@/components/month-selector";
import { HistoryDialog } from "@/components/history-dialog";
import { ScheduleSummary } from "@/components/schedule-summary";
import { ApiStatus } from "@/components/api-status";
import { Professional, ScheduleEntry } from "@/lib/types";
import { ScheduleEntryWithProfessional } from "@/lib/api";
import { useProfessionals } from "@/hooks/use-professionals";
import { useSchedule } from "@/hooks/use-schedule";
import { useHistory } from "@/hooks/use-history";
import { useConfig } from "@/hooks/use-config";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { cn } from "@/lib/utils";
import { Loader2, History } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

export default function Home() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isPrintPreviewActive, setIsPrintPreviewActive] = useState(false); // Renamed state
  const [isInitialized, setIsInitialized] = useState(false);

  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [historicalProfessionals, setHistoricalProfessionals] = useState<Professional[] | null>(null);
  const [historicalScheduleEntries, setHistoricalScheduleEntries] = useState<ScheduleEntryWithProfessional[] | null>(null);
  const [historicalMonthYear, setHistoricalMonthYear] = useState<string | null>(null);

  // Usar preferências do usuário do banco de dados
  const { preferences, loading: preferencesLoading, updatePreferences } = useUserPreferences();
  const activeProfessionalIds = preferences.active_professional_ids;
  const scheduleGenerationMode = preferences.schedule_generation_mode;
  const startingProfessionalId = preferences.starting_professional_id;


  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { professionals, loading: professionalsLoading, error: professionalsError } = useProfessionals();
  const { scheduleEntries, loading: scheduleLoading, error: scheduleError, createOrUpdateEntry, deleteEntry, clearMonth, refetch: refetchSchedule } = useSchedule(currentYear, currentMonth);
  const { history, loading: historyLoading, saveToHistory, deleteFromHistory } = useHistory();
  const { config } = useConfig();

  useEffect(() => {
    if (professionals.length > 0 && activeProfessionalIds.length === 0 && !preferencesLoading && !isInitialized) {
      updatePreferences({ active_professional_ids: professionals.map(p => p.id) });
      setIsInitialized(true);
    }
  }, [professionals, activeProfessionalIds.length, preferencesLoading, isInitialized]);

  useEffect(() => {
    if (activeProfessionalIds.length > 0 && (!startingProfessionalId || !activeProfessionalIds.includes(startingProfessionalId)) && !preferencesLoading && isInitialized) {
      updatePreferences({ starting_professional_id: activeProfessionalIds[0] });
    } else if (activeProfessionalIds.length === 0 && !preferencesLoading && isInitialized) {
      updatePreferences({ starting_professional_id: null });
    }
  }, [activeProfessionalIds, startingProfessionalId, preferencesLoading, isInitialized]);

  useEffect(() => {
    console.log("NEXT_PUBLIC_API_URL no frontend:", process.env.NEXT_PUBLIC_API_URL);
  }, []);

  // Apply/remove print-preview-active-body-wrapper class to body
  useEffect(() => {
    if (isPrintPreviewActive) {
      document.body.classList.add('print-preview-active-body-wrapper');
    } else {
      document.body.classList.remove('print-preview-active-body-wrapper');
    }
    // Cleanup function
    return () => {
      document.body.classList.remove('print-preview-active-body-wrapper');
    };
  }, [isPrintPreviewActive]);


  const handleToggleProfessionalActive = async (id: string, checked: boolean) => {
    const newActiveProfessionalIds = checked 
      ? [...activeProfessionalIds, id]
      : activeProfessionalIds.filter(activeId => activeId !== id);
    
    try {
      await updatePreferences({ active_professional_ids: newActiveProfessionalIds });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
    }
  };

  const handleUpdateScheduleEntry = async (entry: Omit<ScheduleEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createOrUpdateEntry(entry);
    } catch (error) {
        console.error('Erro ao atualizar entrada:', error);
    }
  };

  const handleDeleteScheduleEntry = async (date: string) => {
    try {
      await deleteEntry(date);
    } catch (error) {
        console.error('Erro ao deletar entrada:', error);
    }
  };

  const handlePrevMonth = async () => {
    setIsViewingHistory(false);
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = async () => {
    setIsViewingHistory(false);
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleGoToMonth = (date: Date) => {
    setIsViewingHistory(false);
    setCurrentDate(date);
  };

  const handleGoToCurrentMonth = () => {
    setIsViewingHistory(false);
    setCurrentDate(new Date());
  };

  const generateAutomaticSchedule = async () => {
    if (isViewingHistory) {
      alert("Não é possível gerar escala automática no modo de visualização de histórico. Volte para a escala atual.");
      return;
    }

    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start, end });

    const activeProfessionals = professionals.filter(p => activeProfessionalIds.includes(p.id));

    if (activeProfessionals.length === 0) {
      alert("Por favor, adicione e selecione pelo menos um profissional para gerar a escala automática.");
      return;
    }
    
    let initialProfessionalIndex = 0;
    if (startingProfessionalId) {
      const foundIndex = activeProfessionals.findIndex(p => p.id === startingProfessionalId);
      if (foundIndex !== -1) {
        initialProfessionalIndex = foundIndex;
      }
    }

    try {
      await clearMonth(currentYear, currentMonth);
      
      let professionalIndex = initialProfessionalIndex;
      let currentProfessionalForWeek: Professional | null = null;
      let lastProcessedWeek: number | null = null;

      for (const day of daysInMonth) {
        let assignedProfessional: Professional;

        if (scheduleGenerationMode === 'daily') {
          assignedProfessional = activeProfessionals[professionalIndex];
          professionalIndex = (professionalIndex + 1) % activeProfessionals.length;
        } else {
          const currentWeekNumber = getWeek(day, { locale: ptBR, weekStartsOn: 1 }); 

          if (lastProcessedWeek === null || currentWeekNumber !== lastProcessedWeek) {
            currentProfessionalForWeek = activeProfessionals[professionalIndex];
            professionalIndex = (professionalIndex + 1) % activeProfessionals.length;
            lastProcessedWeek = currentWeekNumber;
          }
          assignedProfessional = currentProfessionalForWeek!;
        }

        await createOrUpdateEntry({
          date: format(day, "yyyy-MM-dd"),
          professionalId: assignedProfessional.id,
          hours: assignedProfessional.default_hours || 12,
          observation: undefined,
        });
      }
      
      // ADICIONAR ESTA LINHA para atualizar o calendário
      await refetchSchedule();
      
      alert("Escala automática gerada com sucesso!");
    } catch (error) {
      console.error('Erro ao gerar escala automática:', error);
      alert("Erro ao gerar escala automática. Tente novamente.");
    }
  };

  const createScheduleRecord = async () => {
    if (isViewingHistory) {
      alert("Não é possível salvar histórico no modo de visualização de histórico. Volte para a escala atual.");
      return;
    }

    const monthYear = format(currentDate, "yyyy-MM");
    
    try {
      const scheduleData: ScheduleEntry[] = scheduleEntries.map(entry => ({
        date: entry.date,
        professionalId: entry.professional_id,
        hours: entry.hours,
        observation: entry.observation,
      }));

      await saveToHistory({
        month_year: monthYear,
        schedule_data: scheduleData,
        professionals_data: professionals,
      });
      
      alert(`Escala para ${format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })} salva no histórico!`);
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
      alert("Erro ao salvar no histórico. Tente novamente.");
    }
  };

  const loadHistoricalSchedule = (record: any) => {
    // Verificar se os dados necessários existem
    if (!record.schedule_data || !Array.isArray(record.schedule_data)) {
      alert("Dados de escala não encontrados ou inválidos.");
      return;
    }
    
    if (!record.professionals_data || !Array.isArray(record.professionals_data)) {
      alert("Dados de profissionais não encontrados ou inválidos.");
      return;
    }
    
    setIsViewingHistory(true);
    setCurrentDate(parseISO(record.month_year + "-01"));
    setHistoricalProfessionals(record.professionals_data);
    
    const entriesWithProfessional: ScheduleEntryWithProfessional[] = record.schedule_data.map((entry: any) => {
      const prof = record.professionals_data.find((p: any) => p.id === entry.professionalId);
      return {
        ...entry,
        professional_id: entry.professionalId,
        professional_name: prof?.name || 'Desconhecido',
        professional_color: prof?.color || 'bg-gray-500',
      };
    });
    setHistoricalScheduleEntries(entriesWithProfessional);
    setHistoricalMonthYear(record.month_year);
    alert(`Escala de ${format(parseISO(record.month_year + "-01"), "MMMM 'de' yyyy", { locale: ptBR })} carregada para visualização.`);
  };

  const handleReturnToCurrentSchedule = () => {
    setIsViewingHistory(false);
    setHistoricalProfessionals(null);
    setHistoricalScheduleEntries(null);
    setHistoricalMonthYear(null);
    setCurrentDate(new Date());
    refetchSchedule();
  };

  // New function for print preview
  const handlePrintPreview = () => {
    setIsPrintPreviewActive(true);
  };

  // New function to exit print preview
  const handleExitPrintPreview = () => {
    setIsPrintPreviewActive(false);
  };

  const displayedProfessionals = isViewingHistory ? historicalProfessionals || [] : professionals;
  const displayedScheduleEntries = isViewingHistory ? historicalScheduleEntries || [] : scheduleEntries;

  const professionalHoursSummary = useMemo(() => {
    const summary: { [key: string]: number } = {};
    const currentMonthYearFormatted = format(currentDate, "yyyy-MM");

    displayedScheduleEntries.forEach(entry => {
      const entryMonthYear = format(parseISO(entry.date), "yyyy-MM");
      if (entryMonthYear === currentMonthYearFormatted) {
        summary[entry.professional_id] = (summary[entry.professional_id] || 0) + entry.hours;
      }
    });
    return summary;
  }, [displayedScheduleEntries, currentDate]);

  if (professionalsLoading || scheduleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", isPrintPreviewActive && "print-preview-active-body-wrapper")}> {/* Add wrapper class */}
      {/* Main content, hidden when in print preview */}
      <div className={cn("container mx-auto py-8", isPrintPreviewActive && "hidden")}>
        {/* Cabeçalho com logo */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-40 h-auto mb-2">
            <Image 
              src="/images/logo.png" 
              alt="Logo Chapadão do Céu" 
              width={160} 
              height={100} 
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-center">SECRETARIA MUNICIPAL DE SAÚDE DE CHAPADÃO DO CÉU</h1>
          <h2 className="text-xl font-semibold text-center">DEPARTAMENTO DE INFORMÁTICA</h2>
          <h3 className="text-lg mt-4">Sistema de Escala de Sobreaviso - TI</h3>
        </div>

        <ApiStatus />

        {(professionalsError || scheduleError) && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {professionalsError || scheduleError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="schedule">Gerenciar Escala</TabsTrigger>
            <TabsTrigger value="professionals">Gerenciar Profissionais</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle className="space-y-4">
                  <div className="flex justify-between items-center">
                    <MonthSelector
                      currentDate={currentDate}
                      onPrevMonth={handlePrevMonth}
                      onNextMonth={handleNextMonth}
                      onGoToMonth={handleGoToMonth}
                      onGoToCurrentMonth={handleGoToCurrentMonth}
                    />
                    {isViewingHistory && (
                      <Button onClick={handleReturnToCurrentSchedule} variant="outline">
                        <History className="h-4 w-4 mr-2" /> Voltar para Escala Atual
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 items-center">
                    <Select value={scheduleGenerationMode} onValueChange={(value: 'daily' | 'weekly') => updatePreferences({ schedule_generation_mode: value })} disabled={isViewingHistory}>
                      <SelectTrigger className="w-full min-w-[140px]">
                        <SelectValue placeholder="Modo de Geração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Rotação Diária</SelectItem>
                        <SelectItem value="weekly">Rotação Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={startingProfessionalId || ''}
                      onValueChange={(value) => updatePreferences({ starting_professional_id: value || null })}
                      disabled={isViewingHistory || activeProfessionalIds.length === 0}
                    >
                      <SelectTrigger className="w-full min-w-[140px]">
                        <SelectValue placeholder="Começar com..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeProfessionalIds.map(profId => {
                          const prof = professionals.find(p => p.id === profId);
                          return prof ? (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.name}
                            </SelectItem>
                          ) : null;
                        })}
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      onClick={generateAutomaticSchedule} 
                      disabled={activeProfessionalIds.length === 0 || scheduleLoading || isViewingHistory || !startingProfessionalId}
                      className="whitespace-nowrap text-xs sm:text-sm"
                      size="sm"
                    >
                      {scheduleLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Gerando...
                        </>
                      ) : (
                        'Gerar Escala'
                      )}
                    </Button>
                    
                    <Button 
                      onClick={createScheduleRecord}
                      disabled={scheduleEntries.length === 0 || historyLoading || isViewingHistory}
                      className="whitespace-nowrap text-xs sm:text-sm"
                      size="sm"
                    >
                      {historyLoading ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Salvando...
                        </>
                      ) : (
                        'Criar Registro'
                      )}
                    </Button>
                    
                    <div className="flex justify-center">
                      <HistoryDialog history={history} onLoadHistory={loadHistoricalSchedule} onDeleteHistory={deleteFromHistory} loading={historyLoading} />
                    </div>
                    
                    <Button onClick={handlePrintPreview} className="whitespace-nowrap text-xs sm:text-sm" size="sm">
                      Ver Impressão
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleCalendar
                  currentDate={currentDate}
                  professionals={displayedProfessionals}
                  scheduleEntries={displayedScheduleEntries}
                  onUpdateEntry={handleUpdateScheduleEntry}
                  onDeleteEntry={handleDeleteScheduleEntry}
                  isReadOnly={isViewingHistory}
                />
                <ScheduleSummary
                  professionals={displayedProfessionals}
                  hoursSummary={professionalHoursSummary}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professionals">
            <ProfessionalManagement
              activeProfessionalIds={activeProfessionalIds}
              onToggleProfessionalActive={handleToggleProfessionalActive}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Print preview content, shown when in print preview */}
      {isPrintPreviewActive && (
        <div className="p-8 print-scale-container-preview"> {/* New class for preview container */}
          {/* Cabeçalho para impressão */}
          <div className="flex flex-col items-center mb-4 print-header-container-preview"> {/* New class */}
            <div className="flex-shrink-0">
              <Image 
                src="/images/logo.png" 
                alt="Logo Chapadão do Céu" 
                width={80} 
                height={50} 
                priority
                className="print-logo-preview" // New class
              />
            </div>
            <div className="flex-grow print-header-text-preview"> {/* New class */}
              <h1 className="font-bold print-header-preview">SECRETARIA MUNICIPAL DE SAÚDE DE CHAPADÃO DO CÉU</h1> {/* New class */}
              <h2 className="font-semibold print-header-preview sub-header-preview">DEPARTAMENTO DE INFORMÁTICA</h2> {/* New class */}
              <h3 className="print-header-preview system-title-preview"> {/* New class */}
                Escala de Sobreaviso - {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
            </div>
          </div>
          <ScheduleCalendar
            currentDate={currentDate}
            professionals={displayedProfessionals}
            scheduleEntries={displayedScheduleEntries}
            onUpdateEntry={async () => {}}
            onDeleteEntry={async () => {}}
            isPrintMode={true} // Keep this true to apply print-specific logic within calendar/summary components
          />
          <ScheduleSummary
            professionals={displayedProfessionals}
            hoursSummary={professionalHoursSummary}
            isPrintMode={true} // Keep this true to apply print-specific logic within calendar/summary components
          />
          <footer className="py-2 text-center text-xs text-muted-foreground print-footer-preview"> {/* New class */}
            <p>{config.company_name}</p>
          </footer>
          <div className="text-center mt-4">
            <Button onClick={handleExitPrintPreview}>Voltar</Button>
            <Button onClick={() => window.print()} className="ml-2">Imprimir Agora</Button>
          </div>
        </div>
      )}
    </div>
  );
}
