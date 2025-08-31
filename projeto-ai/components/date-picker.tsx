"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from 'lucide-react';
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  className?: string;
  children?: React.ReactNode; // Adicionado para permitir um trigger customizado
}

export function DatePicker({ selectedDate, onSelectDate, className, children }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children ? ( // Se houver children, usa-os como trigger
          children
        ) : ( // Caso contrário, usa o botão padrão
          <Button
            variant={"outline"}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP", { locale: ptBR })
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          initialFocus
          locale={ptBR}
          captionLayout="dropdown" // Habilita dropdowns para mês e ano
          fromYear={1990} // Ano inicial (pode ajustar se necessário)
          toYear={2040} // Ano final, conforme solicitado
        />
      </PopoverContent>
    </Popover>
  );
}
