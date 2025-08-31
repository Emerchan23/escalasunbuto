"use client";

import { useApiConnection } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wifi, WifiOff } from 'lucide-react';

export function ApiStatus() {
  const { isConnected, isLoading } = useApiConnection();

  if (isLoading) {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Verificando conexão com o servidor...
        </AlertDescription>
      </Alert>
    );
  }

  if (!isConnected) {
    return (
      <Alert variant="destructive" className="mb-4">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          <strong>Sem conexão com o servidor!</strong>
          <br />
          Verifique se o sistema monolítico está rodando em http://localhost:4000
          <br />
          Execute o comando <code>docker-compose -f docker-compose-escalas.yml up -d</code> para iniciar o sistema.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <Wifi className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        Conectado ao servidor com sucesso!
      </AlertDescription>
    </Alert>
  );
}
