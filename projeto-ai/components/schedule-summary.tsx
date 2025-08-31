"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Professional } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScheduleSummaryProps {
  professionals: Professional[];
  hoursSummary: { [key: string]: number };
  isPrintMode?: boolean;
}

export function ScheduleSummary({ professionals, hoursSummary, isPrintMode = false }: ScheduleSummaryProps) {
  const participatingProfessionals = professionals.filter(p => hoursSummary[p.id] && hoursSummary[p.id] > 0);

  if (participatingProfessionals.length === 0 && !isPrintMode) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Resumo de Horas do Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum profissional com horas atribuídas neste mês.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("mt-6", isPrintMode && "border-none shadow-none components-schedule-summary-root-preview")}> {/* Updated class */}
      <CardHeader className={cn(isPrintMode && "pb-2")}>
        <CardTitle className={cn(isPrintMode && "text-xl")}>Resumo de Horas do Mês</CardTitle>
      </CardHeader>
      <CardContent className={cn(isPrintMode && "pt-0")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {participatingProfessionals.map(professional => (
            <div key={professional.id} className="flex items-center space-x-2 p-2 border rounded-md bg-secondary/50">
              <div className={cn("w-4 h-4 rounded-full", professional.color)}></div>
              <p className="font-medium text-sm">{professional.name}:</p>
              <span className="font-bold text-primary">{hoursSummary[professional.id]}h</span>
            </div>
          ))}
        </div>
        {participatingProfessionals.length === 0 && isPrintMode && (
          <p className="text-muted-foreground text-sm">Nenhum profissional com horas atribuídas neste mês.</p>
        )}
      </CardContent>
    </Card>
  );
}
