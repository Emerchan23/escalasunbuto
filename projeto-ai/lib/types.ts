export interface Professional {
  id: string;
  name: string;
  color: string;
  default_hours?: number;
  phone?: string; // Novo campo telefone
  created_at: string;
  updated_at: string;
}

export interface ScheduleEntry {
  date: string; // YYYY-MM-DD
  professionalId: string;
  hours: number;
  observation?: string;
}

export interface HistoryRecord {
  id: string;
  month_year: string; // YYYY-MM
  schedule_data: ScheduleEntry[];
  professionals_data: Professional[];
  created_at: string;
}

export interface Config {
  id: string;
  company_name: string;
  department_name: string;
  system_title: string;
  created_at: string;
  updated_at: string;
}
