"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { DatePicker } from "@/components/date-picker"; // Importar DatePicker

interface MonthSelectorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToMonth: (date: Date) => void;
  onGoToCurrentMonth: () => void;
}

export function MonthSelector({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onGoToMonth,
  onGoToCurrentMonth,
}: MonthSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="icon" onClick={onPrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {/* Usar DatePicker para o botão central */}
      <DatePicker
        selectedDate={currentDate}
        onSelectDate={(date) => {
          if (date) {
            onGoToMonth(date);
          }
        }}
        className="w-auto" // Ajustar largura para se adequar ao conteúdo
      >
        <Button variant="outline">
          <CalendarDays className="h-4 w-4 mr-2" />
          {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </Button>
      </DatePicker>
      <Button variant="outline" size="icon" onClick={onNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
