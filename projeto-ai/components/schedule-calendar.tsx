"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Professional, ScheduleEntry } from "@/lib/types";
import { ScheduleEntryWithProfessional } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';

interface ScheduleCalendarProps {
  currentDate: Date;
  professionals: Professional[];
  scheduleEntries: ScheduleEntryWithProfessional[];
  onUpdateEntry: (entry: Omit<ScheduleEntry, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDeleteEntry: (date: string) => Promise<void>;
  isPrintMode?: boolean; // This prop is now used for both actual print and preview mode
  isReadOnly?: boolean;
}

export function ScheduleCalendar({ 
  currentDate, 
  professionals, 
  scheduleEntries, 
  onUpdateEntry, 
  onDeleteEntry,
  isPrintMode = false, // Renamed from isPrintMode to isPrintPreviewActive in page.tsx, but still used here
  isReadOnly = false
}: ScheduleCalendarProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("");
  const [hours, setHours] = useState<number>(12);
  const [observation, setObservation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const startDay = start.getDay();
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() - (startDay - i));
    return d;
  });

  const endDay = end.getDay();
  const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) => {
    const d = new Date(end);
    d.setDate(d.getDate() + (i + 1));
    return d;
  });

  const allDays = [...prevMonthDays, ...days, ...nextMonthDays];

  const handleDayClick = (date: Date) => {
    if (isPrintMode || isReadOnly) { // isPrintMode now covers preview as well
      return;
    }

    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    
    const existingEntry = scheduleEntries.find(entry => entry.date === dateStr);
    
    if (existingEntry) {
      setSelectedProfessionalId(existingEntry.professional_id);
      setHours(existingEntry.hours);
      setObservation(existingEntry.observation || "");
    } else {
      setSelectedProfessionalId(professionals.length > 0 ? professionals[0].id : "");
      setHours(12);
      setObservation("");
    }
    
    setIsDialogOpen(true);
  };

  const handleSaveEntry = async () => {
    if (selectedProfessionalId) {
      setIsSubmitting(true);
      try {
        await onUpdateEntry({
          date: selectedDate,
          professionalId: selectedProfessionalId,
          hours,
          observation: observation.trim() || undefined
        });
        setIsDialogOpen(false);
      } catch (error) {
        console.error('Erro ao salvar entrada:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteEntry = async () => {
    setIsSubmitting(true);
    try {
      await onDeleteEntry(selectedDate);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Erro ao deletar entrada:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEntryForDate = (dateStr: string) => {
    return scheduleEntries.find(entry => entry.date === dateStr);
  };

  const getProfessionalById = (id: string) => {
    return professionals.find(p => p.id === id);
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <>
      <div className={cn("grid grid-cols-7 gap-1", isPrintMode ? "components-schedule-calendar-root-preview" : "components-schedule-calendar-root")}> {/* Updated class */}
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className="text-center font-medium p-2 bg-muted rounded-md"
          >
            {day}
          </div>
        ))}
        
        {allDays.map((day, index) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const entry = getEntryForDate(dateStr);
          const professional = entry ? getProfessionalById(entry.professional_id) : null;
          
          return (
            <div
              key={index}
              className={cn(
                "min-h-24 p-2 border rounded-md",
                !isSameMonth(day, currentDate) && "opacity-50 bg-muted/30",
                isToday(day) && "border-primary",
                (!isPrintMode && !isReadOnly) && "cursor-pointer hover:bg-muted/50", // isPrintMode now covers preview as well
                isPrintMode && entry && "border-2"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "font-medium text-sm",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                )}>
                  {format(day, "d")}
                </span>
                {entry && professional && (
                  <div className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full text-white",
                    professional.color
                  )}>
                    {entry.hours}h
                  </div>
                )}
              </div>
              
              {entry && professional && (
                <div className="mt-1">
                  <div className="flex items-center space-x-1">
                    <div className={cn("w-2 h-2 rounded-full", professional.color)}></div>
                    <span className="text-xs font-medium truncate">{professional.name}</span>
                  </div>
                  {entry.observation && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entry.observation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDate ? format(parseISO(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ""}
            </DialogTitle>
            <DialogDescription>
              Defina o profissional de sobreaviso para este dia.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professional" className="text-right">
                Profissional
              </Label>
              <Select 
                value={selectedProfessionalId} 
                onValueChange={setSelectedProfessionalId}
                disabled={isSubmitting}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map(professional => (
                    <SelectItem key={professional.id} value={professional.id}>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${professional.color}`}></div>
                        <span>{professional.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hours" className="text-right">
                Horas
              </Label>
              <Input
                id="hours"
                type="number"
                min={1}
                max={24}
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 12)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observation" className="text-right">
                Observação
              </Label>
              <Textarea
                id="observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="col-span-3"
                placeholder="Opcional"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              onClick={handleDeleteEntry}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removendo...
                </>
              ) : (
                'Remover'
              )}
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEntry}
                disabled={isSubmitting || !selectedProfessionalId}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
