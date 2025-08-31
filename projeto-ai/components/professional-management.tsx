"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ProfessionalColorPicker } from "@/components/professional-color-picker";
import { Professional } from "@/lib/types";
import { useProfessionals } from "@/hooks/use-professionals";
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfessionalManagementProps {
  activeProfessionalIds: string[];
  onToggleProfessionalActive: (id: string, checked: boolean) => void;
}

// Função para aplicar máscara de telefone
const formatPhone = (value: string) => {
  // Remove tudo que não é dígito
  const cleaned = value.replace(/\D/g, '');
  
  // Aplica a máscara (64)9 9999-9999
  if (cleaned.length <= 2) {
    return `(${cleaned}`;
  } else if (cleaned.length <= 3) {
    return `(${cleaned.slice(0, 2)})${cleaned.slice(2)}`;
  } else if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 3)} ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 2)})${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }
};

export function ProfessionalManagement({ activeProfessionalIds, onToggleProfessionalActive }: ProfessionalManagementProps) {
  const { professionals, loading, error, addProfessional, updateProfessional, deleteProfessional } = useProfessionals();
  const [newProfessionalName, setNewProfessionalName] = useState("");
  const [newProfessionalDefaultHours, setNewProfessionalDefaultHours] = useState(12);
  const [newProfessionalColor, setNewProfessionalColor] = useState("bg-blue-500");
  const [newProfessionalPhone, setNewProfessionalPhone] = useState(""); // Novo estado para telefone
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);
  const [editingProfessionalName, setEditingProfessionalName] = useState("");
  const [editingProfessionalDefaultHours, setEditingProfessionalDefaultHours] = useState(12);
  const [editingProfessionalColor, setEditingProfessionalColor] = useState("");
  const [editingProfessionalPhone, setEditingProfessionalPhone] = useState(""); // Novo estado para telefone na edição
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddProfessional = async () => {
    setFormError(null);
    if (!newProfessionalName.trim()) {
      setFormError("O nome do profissional não pode ser vazio.");
      return;
    }
    setIsSubmitting(true);
    try {
      await addProfessional({
        name: newProfessionalName.trim(),
        default_hours: newProfessionalDefaultHours,
        color: newProfessionalColor,
        phone: newProfessionalPhone.trim() || undefined, // Adiciona telefone
      });
      setNewProfessionalName("");
      setNewProfessionalDefaultHours(12);
      setNewProfessionalColor("bg-blue-500");
      setNewProfessionalPhone(""); // Limpa telefone
    } catch (err) {
      setFormError("Erro ao adicionar profissional. Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (professional: Professional) => {
    setEditingProfessionalId(professional.id);
    setEditingProfessionalName(professional.name);
    setEditingProfessionalDefaultHours(professional.default_hours || 12);
    setEditingProfessionalColor(professional.color);
    setEditingProfessionalPhone(professional.phone || ""); // Carrega telefone para edição
    setFormError(null);
  };

  const handleUpdateProfessional = async () => {
    setFormError(null);
    if (!editingProfessionalName.trim()) {
      setFormError("O nome do profissional não pode ser vazio.");
      return;
    }
    if (editingProfessionalId) {
      setIsSubmitting(true);
      try {
        await updateProfessional(editingProfessionalId, {
          name: editingProfessionalName.trim(),
          default_hours: editingProfessionalDefaultHours,
          color: editingProfessionalColor,
          phone: editingProfessionalPhone.trim() || undefined, // Atualiza telefone
        });
        setEditingProfessionalId(null);
      } catch (err) {
        setFormError("Erro ao atualizar profissional. Tente novamente.");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este profissional? Isso também removerá todas as suas entradas de escala.")) {
      setIsSubmitting(true);
      try {
        await deleteProfessional(id);
      } catch (err) {
        setFormError("Erro ao remover profissional. Tente novamente.");
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Função para lidar com mudança no campo telefone
  const handlePhoneChange = (value: string, isEditing: boolean = false) => {
    const formatted = formatPhone(value);
    if (isEditing) {
      setEditingProfessionalPhone(formatted);
    } else {
      setNewProfessionalPhone(formatted);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" /> Carregando profissionais...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Profissionais</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          {/* Adicionar Novo Profissional */}
          <div className="border p-4 rounded-md bg-muted/50">
            <h3 className="text-lg font-semibold mb-3">Adicionar Novo Profissional</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="new-professional-name">Nome</Label>
                <Input
                  id="new-professional-name"
                  value={newProfessionalName}
                  onChange={(e) => setNewProfessionalName(e.target.value)}
                  placeholder="Nome do Profissional"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="new-professional-phone">Telefone</Label>
                <Input
                  id="new-professional-phone"
                  value={newProfessionalPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(64)9 9999-9999"
                  disabled={isSubmitting}
                  maxLength={15}
                />
              </div>
              <div>
                <Label htmlFor="new-professional-hours">Horas Padrão</Label>
                <Input
                  id="new-professional-hours"
                  type="number"
                  min={1}
                  max={24}
                  value={newProfessionalDefaultHours}
                  onChange={(e) => setNewProfessionalDefaultHours(parseInt(e.target.value) || 12)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <ProfessionalColorPicker
                  selectedColor={newProfessionalColor}
                  onSelectColor={setNewProfessionalColor}
                />
              </div>
              <Button onClick={handleAddProfessional} disabled={isSubmitting || !newProfessionalName.trim()} className="md:col-span-4">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Adicionar Profissional
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Lista de Profissionais */}
          <h3 className="text-lg font-semibold mt-6 mb-3">Profissionais Cadastrados</h3>
          {professionals.length === 0 ? (
            <p className="text-muted-foreground">Nenhum profissional cadastrado ainda.</p>
          ) : (
            <div className="grid gap-3">
              {professionals.map((professional) => (
                <div key={professional.id} className="flex items-center justify-between border p-3 rounded-md">
                  {editingProfessionalId === professional.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 flex-grow items-center">
                      <Input
                        value={editingProfessionalName}
                        onChange={(e) => setEditingProfessionalName(e.target.value)}
                        className="col-span-1"
                        disabled={isSubmitting}
                        placeholder="Nome"
                      />
                      <Input
                        value={editingProfessionalPhone}
                        onChange={(e) => handlePhoneChange(e.target.value, true)}
                        className="col-span-1"
                        disabled={isSubmitting}
                        placeholder="(64)9 9999-9999"
                        maxLength={15}
                      />
                      <Input
                        type="number"
                        min={1}
                        max={24}
                        value={editingProfessionalDefaultHours}
                        onChange={(e) => setEditingProfessionalDefaultHours(parseInt(e.target.value) || 12)}
                        className="col-span-1"
                        disabled={isSubmitting}
                      />
                      <ProfessionalColorPicker
                        selectedColor={editingProfessionalColor}
                        onSelectColor={setEditingProfessionalColor}
                      />
                      <div className="flex space-x-2 col-span-1">
                        <Button size="sm" onClick={handleUpdateProfessional} disabled={isSubmitting || !editingProfessionalName.trim()}>
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingProfessionalId(null)} disabled={isSubmitting}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 flex-grow">
                        <Checkbox
                          id={`professional-${professional.id}`}
                          checked={activeProfessionalIds.includes(professional.id)}
                          onCheckedChange={(checked) => onToggleProfessionalActive(professional.id, checked as boolean)}
                          disabled={isSubmitting}
                        />
                        <Label htmlFor={`professional-${professional.id}`} className="flex items-center space-x-2 cursor-pointer">
                          <div className={`w-4 h-4 rounded-full ${professional.color}`}></div>
                          <span className="font-medium">{professional.name}</span>
                          {professional.phone && (
                            <span className="text-sm text-muted-foreground">({professional.phone})</span>
                          )}
                          <span className="text-sm text-muted-foreground">({professional.default_hours}h padrão)</span>
                        </Label>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(professional)} disabled={isSubmitting}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProfessional(professional.id)} disabled={isSubmitting}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
